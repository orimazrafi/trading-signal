/** Default JWT secret — must not be used in production. */
export const DEV_JWT_SECRET = "dev-jwt-secret-change-me";

/** Throws when required production environment settings are missing or unsafe. */
export function validateProductionEnv(nodeEnv: string, jwtSecret: string, authAllowMock: boolean): void {
  if (nodeEnv !== "production") {
    return;
  }

  if (jwtSecret === DEV_JWT_SECRET) {
    throw new Error("JWT_SECRET must be set to a secure value in production");
  }

  if (authAllowMock) {
    throw new Error("AUTH_ALLOW_MOCK must not be enabled in production");
  }
}
