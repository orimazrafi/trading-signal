import { Router, type Request, type Response } from "express";

export const healthRouter = Router();

/** Returns server health status for load balancers and the client. */
healthRouter.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", service: "trading-signal-server" });
});
