import cors from "cors";
import express, { type Express } from "express";
import { healthRouter } from "./routes/health.js";

/** Builds the Express application with middleware and routes. */
export function createApp(): Express {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use("/api", healthRouter);

  return app;
}
