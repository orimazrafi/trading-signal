import { HTTP_STATUS } from "@trading-signal/contracts/httpStatus";
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { log } from "../lib/logger/index.js";
import { AUTH_COOKIE_NAME, parseJwtUser } from "../services/auth.service.js";

/** Requires a valid JWT in the auth httpOnly cookie. */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.[AUTH_COOKIE_NAME];

  if (typeof token !== "string") {
    if (env.authAllowMock) {
      req.user = env.mockUser;
      next();
      return;
    }

    res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: "Unauthorized" });
    return;
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    const user = parseJwtUser(decoded);

    if (!user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: "Unauthorized" });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    log.error("Invalid auth cookie", error, { path: req.path });
    res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: "Unauthorized" });
  }
}

/** Attaches the user when a valid auth cookie is present; otherwise continues anonymously. */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = req.cookies?.[AUTH_COOKIE_NAME];

  if (typeof token !== "string") {
    if (env.authAllowMock) {
      req.user = env.mockUser;
    }

    next();
    return;
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    const user = parseJwtUser(decoded);

    if (user) {
      req.user = user;
    }
  } catch (error) {
    log.error("Invalid auth cookie", error, { path: req.path });
  }

  next();
}
