import type { Response } from "express";

/** One authenticated SSE connection for alert notifications. */
export type AlertStreamClient = {
  userId: string;
  response: Response;
};
