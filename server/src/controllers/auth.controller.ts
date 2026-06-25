import { HTTP_STATUS } from "@trading-signal/contracts/httpStatus";
import type { Request, Response } from "express";
import { env } from "../config/env.js";
import { sendAuthErrorResponse } from "../lib/authHttpErrors.js";
import { log } from "../lib/logger/index.js";
import { parseAuthCredentialsBody } from "../lib/parseAuthCredentials.js";
import {
  AuthError,
  OAUTH_STATE_COOKIE,
  authenticateWithGoogleCode,
  buildGoogleAuthUrl,
  clearAuthCookie,
  createOAuthState,
  loginWithEmail,
  registerWithEmail,
  setAuthCookie,
} from "../services/auth.service.js";

/** Registers a new user and sets the auth cookie. */
export async function postSignup(req: Request, res: Response): Promise<void> {
  const { email, password } = parseAuthCredentialsBody(req.body);

  try {
    const user = await registerWithEmail(email, password);
    setAuthCookie(res, user);
    res.status(HTTP_STATUS.CREATED).json({ user });
  } catch (error) {
    sendAuthErrorResponse(res, error, req.path);
  }
}

/** Logs in with email/password and sets the auth cookie. */
export async function postLogin(req: Request, res: Response): Promise<void> {
  const { email, password } = parseAuthCredentialsBody(req.body);

  try {
    const user = await loginWithEmail(email, password);
    setAuthCookie(res, user);
    res.json({ user });
  } catch (error) {
    sendAuthErrorResponse(res, error, req.path);
  }
}

/** Clears the auth cookie. */
export function postLogout(_req: Request, res: Response): void {
  clearAuthCookie(res);
  res.json({ ok: true });
}

/** Returns the currently authenticated user. */
export function getMe(req: Request, res: Response): void {
  if (!req.user) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: "Unauthorized" });
    return;
  }

  res.json({ user: req.user });
}

/** Redirects the browser to Google OAuth consent. */
export function getGoogleAuth(req: Request, res: Response): void {
  try {
    const state = createOAuthState();

    res.cookie(OAUTH_STATE_COOKIE, state, {
      httpOnly: true,
      secure: env.nodeEnv === "production",
      sameSite: "lax",
      maxAge: 10 * 60 * 1000,
      path: "/",
    });

    res.redirect(buildGoogleAuthUrl(state));
  } catch (error) {
    sendAuthErrorResponse(res, error, req.path);
  }
}

/** Handles the Google OAuth callback, sets auth cookie, and redirects to the client. */
export async function getGoogleCallback(req: Request, res: Response): Promise<void> {
  const code = typeof req.query.code === "string" ? req.query.code : "";
  const state = typeof req.query.state === "string" ? req.query.state : "";
  const storedState = req.cookies?.[OAUTH_STATE_COOKIE];

  res.clearCookie(OAUTH_STATE_COOKIE, { path: "/" });

  if (!code || !state || !storedState || state !== storedState) {
    res.redirect(`${env.clientUrl}/login?authError=invalid_oauth_state`);
    return;
  }

  try {
    const user = await authenticateWithGoogleCode(code);
    setAuthCookie(res, user);
    res.redirect(`${env.clientUrl}/dashboard`);
  } catch (error) {
    if (error instanceof AuthError) {
      log.error("Google callback failed", error, { path: req.path, code: error.code });
      const authError = error.code ?? "google_sign_in_failed";
      res.redirect(`${env.clientUrl}/login?authError=${encodeURIComponent(authError)}`);
      return;
    }

    log.error("Google callback failed", error, { path: req.path });
    res.redirect(`${env.clientUrl}/login?authError=google_sign_in_failed`);
  }
}
