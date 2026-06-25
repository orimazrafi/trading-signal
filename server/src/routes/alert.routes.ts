import { Router } from "express";
import { requireAuth } from "../controllers/auth.controller.js";
import {
  deletePriceAlert,
  getAlertNotifications,
  getAlertStream,
  getPriceAlerts,
  patchAlertNotificationRead,
  patchPriceAlert,
  postAlertRunCheck,
  postPriceAlert,
} from "../controllers/alert.controller.js";

/** Protected price alert HTTP routes. */
export const alertRoutes = Router();

alertRoutes.get("/", requireAuth, getPriceAlerts);
alertRoutes.post("/run-check", requireAuth, postAlertRunCheck);
alertRoutes.post("/", requireAuth, postPriceAlert);
alertRoutes.patch("/:id", requireAuth, patchPriceAlert);
alertRoutes.delete("/:id", requireAuth, deletePriceAlert);
alertRoutes.get("/notifications", requireAuth, getAlertNotifications);
alertRoutes.patch("/notifications/:id/read", requireAuth, patchAlertNotificationRead);
alertRoutes.get("/stream", requireAuth, getAlertStream);
