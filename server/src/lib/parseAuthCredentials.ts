export type AuthCredentialsBody = {
  email: string;
  password: string;
};

/** Returns true when value is a non-null object record. */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Parses email/password fields from signup and login request bodies. */
export function parseAuthCredentialsBody(body: unknown): AuthCredentialsBody {
  if (!isRecord(body)) {
    return { email: "", password: "" };
  }

  return {
    email: typeof body.email === "string" ? body.email : "",
    password: typeof body.password === "string" ? body.password : "",
  };
}
