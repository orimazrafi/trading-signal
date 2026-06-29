import { describe, expect, it } from "vitest";
import { isPrismaUniqueViolation } from "./prismaErrors.js";

describe("isPrismaUniqueViolation", () => {
  it("returns true for Prisma P2002 errors", () => {
    expect(isPrismaUniqueViolation({ code: "P2002" })).toBe(true);
  });

  it("returns false for other errors", () => {
    expect(isPrismaUniqueViolation({ code: "P2025" })).toBe(false);
    expect(isPrismaUniqueViolation(null)).toBe(false);
  });
});
