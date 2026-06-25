import { describe, expect, it } from "vitest";
import { DEV_JWT_SECRET, validateProductionEnv } from "./validateProductionEnv.js";

describe("validateProductionEnv", () => {
  it("allows development defaults", () => {
    expect(() => validateProductionEnv("development", DEV_JWT_SECRET, true)).not.toThrow();
  });

  it("rejects the default JWT secret in production", () => {
    expect(() => validateProductionEnv("production", DEV_JWT_SECRET, false)).toThrow(
      /JWT_SECRET/,
    );
  });

  it("rejects mock auth in production", () => {
    expect(() => validateProductionEnv("production", "secure-production-secret", true)).toThrow(
      /AUTH_ALLOW_MOCK/,
    );
  });
});
