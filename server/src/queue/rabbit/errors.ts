/** Extracts a readable message from an unknown error value. */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

/** Extracts a Node/system error code when present. */
function getErrorCode(error: unknown): string | undefined {
  if (error && typeof error === "object" && "code" in error) {
    const code = (error as { code: unknown }).code;
    return typeof code === "string" ? code : undefined;
  }
  return undefined;
}

/** Returns true for configuration or permission errors that retry will not fix. */
export function isFatalRabbitError(error: unknown): boolean {
  const message = getErrorMessage(error).toUpperCase();
  const code = getErrorCode(error);

  if (message.includes("ACCESS_REFUSED")) return true;
  if (message.includes("NOT_ALLOWED")) return true;
  if (message.includes("PRECONDITION_FAILED")) return true;
  if (code === "ENOTFOUND") return true;

  return false;
}

/** Returns true for network or broker interruptions worth retrying. */
export function isTransientRabbitError(error: unknown): boolean {
  if (isFatalRabbitError(error)) {
    return false;
  }

  const code = getErrorCode(error);
  const transientCodes = ["ECONNREFUSED", "ECONNRESET", "ETIMEDOUT", "EPIPE", "ENETUNREACH"];
  if (code && transientCodes.includes(code)) {
    return true;
  }

  const message = getErrorMessage(error).toLowerCase();
  if (message.includes("connection closed")) return true;
  if (message.includes("heartbeat")) return true;
  if (message.includes("socket")) return true;

  return false;
}

/** Formats an error for structured logging. */
export function formatRabbitError(error: unknown): string {
  return getErrorMessage(error);
}
