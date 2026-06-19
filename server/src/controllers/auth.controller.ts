import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { resolveAuthenticatedUser } from "../services/auth.service.js";

/** Verifies JWT from HTTP-only cookie and attaches the logged-in user to the request. */
export function authCookieMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const token = req.cookies?.auth_token;

  if (typeof token !== "string") {
    req.user = env.mockUser;
    next();
    return;
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    req.user = resolveAuthenticatedUser(decoded);
    next();
  } catch (error) {
    console.error("[auth] Invalid auth_token cookie, using mock user:", error);
    req.user = env.mockUser;
    next();
  }
}
