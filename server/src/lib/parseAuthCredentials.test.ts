import { describe, expect, it } from "vitest";
import { parseAuthCredentialsBody } from "./parseAuthCredentials.js";

describe("parseAuthCredentialsBody", () => {
  it("parses email and password strings", () => {
    expect(
      parseAuthCredentialsBody({
        email: "user@example.com",
        password: "secret",
      }),
    ).toEqual({
      email: "user@example.com",
      password: "secret",
    });
  });

  it("returns empty strings for invalid bodies", () => {
    expect(parseAuthCredentialsBody("not-an-object")).toEqual({
      email: "",
      password: "",
    });
  });
});
