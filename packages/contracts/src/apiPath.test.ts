import { describe, expect, it } from "vitest";
import {
  API_BASE_PATH,
  API_VERSION,
  buildApiPath,
  buildDefaultGoogleCallbackUrl,
} from "./apiPath.js";

describe("apiPath", () => {
  it("defines the v1 API prefix", () => {
    expect(API_VERSION).toBe("v1");
    expect(API_BASE_PATH).toBe("/api/v1");
  });

  it("buildApiPath normalizes resource segments", () => {
    expect(buildApiPath("/price-alerts")).toBe("/api/v1/price-alerts");
    expect(buildApiPath("auth/google")).toBe("/api/v1/auth/google");
  });

  it("buildDefaultGoogleCallbackUrl uses the versioned auth callback path", () => {
    expect(buildDefaultGoogleCallbackUrl("http://localhost:5173")).toBe(
      "http://localhost:5173/api/v1/auth/google/callback",
    );
    expect(buildDefaultGoogleCallbackUrl("http://localhost:5173/")).toBe(
      "http://localhost:5173/api/v1/auth/google/callback",
    );
  });
});
