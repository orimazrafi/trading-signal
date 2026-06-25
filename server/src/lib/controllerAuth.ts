import { HTTP_STATUS } from "@trading-signal/contracts/httpStatus";
import type { Response } from "express";

/** Returns the authenticated user id or sends 401. */
export function getAuthenticatedUserId(req: { user?: { userId: string } }, res: Response): string | null {
  const userId = req.user?.userId;

  if (!userId) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: "Unauthorized" });
    return null;
  }

  return userId;
}
