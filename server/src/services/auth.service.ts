import { HTTP_STATUS, type HttpStatusCode } from "@trading-signal/contracts/httpStatus";
import bcrypt from "bcrypt";
import crypto from "crypto";
import axios from "axios";
import jwt, { type SignOptions } from "jsonwebtoken";
import type { Response } from "express";
import type { AuthenticatedUser } from "../types/auth.js";
import { env } from "../config/env.js";
import { log } from "../lib/logger/index.js";
import {
  createUserWithPassword,
  findUserByEmail,
  findUserByEmailForLogin,
  toAuthenticatedUser,
  upsertGoogleUser,
} from "../repositories/user.repository.js";
import { ensureDefaultWatchlistForUser } from "./watchlist.service.js";

export const AUTH_COOKIE_NAME = "auth_token";
export const OAUTH_STATE_COOKIE = "oauth_state";

const BCRYPT_ROUNDS = 12;
const MIN_PASSWORD_LENGTH = 8;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";
const GOOGLE_OAUTH_TIMEOUT_MS = 8000;

type GoogleTokenResponse = {
  access_token: string;
};

type GoogleUserInfo = {
  id: string;
  email: string;
};

type GoogleOAuthErrorBody = {
  error?: string;
  error_description?: string;
};

type CredentialUser = {
  id: string;
  email: string;
  passwordHash: string | null;
};

type GoogleProfile = {
  googleId: string;
  email: string;
};

export class AuthError extends Error {
  constructor(
    message: string,
    readonly statusCode: HttpStatusCode = HTTP_STATUS.BAD_REQUEST,
    readonly code?: string,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

/** Returns true when value is a non-null object record. */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Maps decoded JWT claims to an authenticated user when valid. */
function extractJwtClaims(decoded: Record<string, unknown>): AuthenticatedUser | null {
  const { userId, email } = decoded;

  if (typeof userId !== "string" || typeof email !== "string") {
    return null;
  }

  return { userId, email };
}

/** Validates decoded JWT claims and maps them to an authenticated user. */
export function parseJwtUser(decoded: unknown): AuthenticatedUser | null {
  if (typeof decoded === "string" || !isRecord(decoded)) {
    return null;
  }

  return extractJwtClaims(decoded);
}

/** Returns true when email matches the expected format. */
function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email);
}

/** Normalizes and validates an email address. */
export function normalizeEmail(email: string): string {
  const normalized = email.trim().toLowerCase();

  if (!isValidEmail(normalized)) {
    throw new AuthError("A valid email address is required");
  }

  return normalized;
}

/** Returns true when password meets minimum length. */
function isValidPasswordLength(password: string): boolean {
  return password.length >= MIN_PASSWORD_LENGTH;
}

/** Validates password length for signup and login. */
export function validatePassword(password: string): void {
  if (!isValidPasswordLength(password)) {
    throw new AuthError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }
}

/** Builds JWT sign options from environment configuration. */
function getJwtSignOptions(): SignOptions {
  return {
    expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"],
  };
}

/** Signs a JWT access token for the authenticated user. */
export function signAccessToken(user: AuthenticatedUser): string {
  return jwt.sign({ userId: user.userId, email: user.email }, env.jwtSecret, getJwtSignOptions());
}

/** Returns shared httpOnly cookie flags for auth cookies. */
function getBaseCookieOptions() {
  return {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: "lax" as const,
    path: "/",
  };
}

/** Returns cookie options for the auth token. */
function getAuthCookieOptions() {
  return {
    ...getBaseCookieOptions(),
    maxAge: env.jwtExpiresInMs,
  };
}

/** Sets the httpOnly auth cookie on the response. */
export function setAuthCookie(res: Response, user: AuthenticatedUser): void {
  res.cookie(AUTH_COOKIE_NAME, signAccessToken(user), getAuthCookieOptions());
}

/** Clears the auth cookie on logout. */
export function clearAuthCookie(res: Response): void {
  res.clearCookie(AUTH_COOKIE_NAME, getBaseCookieOptions());
}

/** Hashes a plaintext password with bcrypt. */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

/** Compares a plaintext password to a stored bcrypt hash. */
export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

/** Throws when an account already exists for the email. */
async function assertEmailAvailable(email: string): Promise<void> {
  const existing = await findUserByEmail(email);

  if (existing) {
    throw new AuthError("An account with this email already exists", HTTP_STATUS.CONFLICT);
  }
}

/** Persists a new email/password user and returns the created row. */
async function createPasswordUser(email: string, password: string) {
  const passwordHash = await hashPassword(password);
  return createUserWithPassword(email, passwordHash);
}

/** Registers a new user with email and password. */
export async function registerWithEmail(email: string, password: string): Promise<AuthenticatedUser> {
  const normalizedEmail = normalizeEmail(email);
  validatePassword(password);
  await assertEmailAvailable(normalizedEmail);

  const user = await createPasswordUser(normalizedEmail, password);
  await ensureDefaultWatchlistForUser(user.id);
  return toAuthenticatedUser(user);
}

/** Throws when no credential user exists for the email. */
function assertCredentialUserExists(user: CredentialUser | null): asserts user is CredentialUser {
  if (!user) {
    throw new AuthError("Invalid email or password", HTTP_STATUS.UNAUTHORIZED);
  }
}

/** Throws when the account cannot sign in with a password. */
function assertPasswordAccount(user: CredentialUser): asserts user is CredentialUser & {
  passwordHash: string;
} {
  if (!user.passwordHash) {
    throw new AuthError("This account uses Google sign-in. Please continue with Google.", HTTP_STATUS.UNAUTHORIZED);
  }
}

/** Throws when the password does not match the stored hash. */
async function assertPasswordMatches(password: string, passwordHash: string): Promise<void> {
  const valid = await verifyPassword(password, passwordHash);

  if (!valid) {
    throw new AuthError("Invalid email or password", HTTP_STATUS.UNAUTHORIZED);
  }
}

/** Authenticates a user with email and password. */
export async function loginWithEmail(email: string, password: string): Promise<AuthenticatedUser> {
  const normalizedEmail = normalizeEmail(email);
  validatePassword(password);

  const user = await findUserByEmailForLogin(normalizedEmail);
  assertCredentialUserExists(user);
  assertPasswordAccount(user);
  await assertPasswordMatches(password, user.passwordHash);

  return toAuthenticatedUser(user);
}

/** Creates a random OAuth state value for CSRF protection. */
export function createOAuthState(): string {
  return crypto.randomBytes(32).toString("hex");
}

/** Throws when Google OAuth client id is missing. */
function assertGoogleClientConfigured(): void {
  if (!env.googleClientId) {
    throw new AuthError("Google sign-in is not configured", HTTP_STATUS.SERVICE_UNAVAILABLE);
  }
}

/** Throws when Google OAuth credentials are missing. */
function assertGoogleOAuthConfigured(): void {
  if (!env.googleClientId || !env.googleClientSecret) {
    throw new AuthError("Google sign-in is not configured", HTTP_STATUS.SERVICE_UNAVAILABLE, "google_not_configured");
  }
}

/** Builds Google OAuth consent query parameters. */
function buildGoogleOAuthParams(state: string): URLSearchParams {
  return new URLSearchParams({
    client_id: env.googleClientId,
    redirect_uri: env.googleCallbackUrl,
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "online",
    prompt: "select_account",
  });
}

/** Builds the Google OAuth consent URL. */
export function buildGoogleAuthUrl(state: string): string {
  assertGoogleClientConfigured();
  return `${GOOGLE_AUTH_URL}?${buildGoogleOAuthParams(state).toString()}`;
}

/** Maps Google token endpoint failures to auth errors without logging secrets. */
function mapGoogleTokenError(body: GoogleOAuthErrorBody | undefined): AuthError {
  switch (body?.error) {
    case "invalid_client":
      return new AuthError(
        "Google client credentials are invalid",
        HTTP_STATUS.BAD_GATEWAY,
        "invalid_client",
      );
    case "invalid_grant":
      return new AuthError(
        "Google authorization code expired or was already used",
        HTTP_STATUS.BAD_GATEWAY,
        "invalid_grant",
      );
    default:
      return new AuthError("Google sign-in failed", HTTP_STATUS.BAD_GATEWAY, "google_sign_in_failed");
  }
}

/** Logs a Google token exchange failure without exposing secrets. */
function logGoogleTokenExchangeFailure(error: unknown, body: GoogleOAuthErrorBody | undefined): void {
  log.error("Google token exchange failed", error, {
    errorCode: body?.error,
    description: body?.error_description,
  });
}

/** Builds the Google token exchange request body. */
function buildGoogleTokenParams(code: string): URLSearchParams {
  return new URLSearchParams({
    code,
    client_id: env.googleClientId,
    client_secret: env.googleClientSecret,
    redirect_uri: env.googleCallbackUrl,
    grant_type: "authorization_code",
  });
}

/** Exchanges an OAuth authorization code for a Google access token. */
async function exchangeGoogleAuthCode(code: string): Promise<string> {
  const tokenParams = buildGoogleTokenParams(code);

  try {
    const tokenResponse = await axios.post<GoogleTokenResponse>(
      GOOGLE_TOKEN_URL,
      tokenParams.toString(),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        timeout: GOOGLE_OAUTH_TIMEOUT_MS,
      },
    );

    return tokenResponse.data.access_token;
  } catch (error) {
    const body = axios.isAxiosError(error)
      ? (error.response?.data as GoogleOAuthErrorBody | undefined)
      : undefined;

    logGoogleTokenExchangeFailure(error, body);
    throw axios.isAxiosError(error) ? mapGoogleTokenError(body) : error;
  }
}

/** Fetches Google profile data for an access token. */
async function fetchGoogleUserProfile(accessToken: string): Promise<GoogleUserInfo> {
  const userInfoResponse = await axios.get<GoogleUserInfo>(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
    timeout: GOOGLE_OAUTH_TIMEOUT_MS,
  });

  return userInfoResponse.data;
}

/** Normalizes Google profile fields required for sign-in. */
function parseGoogleProfile(profile: GoogleUserInfo): GoogleProfile | null {
  const googleId = profile.id;
  const email = profile.email?.trim().toLowerCase();

  if (!googleId || !email) {
    return null;
  }

  return { googleId, email };
}

/** Throws when Google profile data is incomplete. */
function assertGoogleProfile(profile: GoogleProfile | null): asserts profile is GoogleProfile {
  if (!profile) {
    throw new AuthError("Google account did not return required profile data", HTTP_STATUS.BAD_GATEWAY);
  }
}

/** Exchanges an OAuth code for Google profile data. */
export async function authenticateWithGoogleCode(code: string): Promise<AuthenticatedUser> {
  assertGoogleOAuthConfigured();

  const accessToken = await exchangeGoogleAuthCode(code);
  const profile = parseGoogleProfile(await fetchGoogleUserProfile(accessToken));
  assertGoogleProfile(profile);

  const user = await upsertGoogleUser(profile.googleId, profile.email);
  await ensureDefaultWatchlistForUser(user.id);
  return toAuthenticatedUser(user);
}
