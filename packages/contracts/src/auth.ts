/** Authenticated user returned by auth API endpoints. */
export type AuthenticatedUser = {
  userId: string;
  email: string;
};

/** Response body for auth endpoints that return the session user. */
export type AuthResponse = {
  user: AuthenticatedUser;
};
