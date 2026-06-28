import { HTTP_STATUS } from "@trading-signal/contracts/httpStatus";
import type { Request, Response } from "express";
import { getHealthStatus } from "../lib/healthCheck.js";

/** Returns service health including database and Redis connectivity. */
export async function getHealth(_req: Request, res: Response): Promise<void> {
  const health = await getHealthStatus();

  res.status(HTTP_STATUS.OK).json(health);
}
