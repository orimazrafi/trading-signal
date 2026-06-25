import { Router } from "express";
import {
  getGoogleAuth,
  getGoogleCallback,
  getMe,
  postLogin,
  postLogout,
  postSignup,
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.js";

/** Public and protected authentication HTTP routes. */
export const authRoutes = Router();

authRoutes.post("/signup", postSignup);
authRoutes.post("/login", postLogin);
authRoutes.post("/logout", postLogout);
authRoutes.get("/me", requireAuth, getMe);
authRoutes.get("/google", getGoogleAuth);
authRoutes.get("/google/callback", getGoogleCallback);