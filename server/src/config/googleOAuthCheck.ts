import axios from "axios";
import { log } from "../lib/logger.js";
import { env } from "./env.js";

type GoogleTokenErrorBody = {
  error?: string;
  error_description?: string;
};

/** Probes Google's token endpoint; invalid_grant means id + secret are accepted. */
export async function logGoogleOAuthCredentialStatus(): Promise<void> {
  if (!env.googleClientId || !env.googleClientSecret) {
    log.warn("Google OAuth not configured", {
      missingClientId: !env.googleClientId,
      missingClientSecret: !env.googleClientSecret,
    });
    return;
  }

  const tokenParams = new URLSearchParams({
    code: "diagnostic-fake-code",
    client_id: env.googleClientId,
    client_secret: env.googleClientSecret,
    redirect_uri: env.googleCallbackUrl,
    grant_type: "authorization_code",
  });

  try {
    await axios.post("https://oauth2.googleapis.com/token", tokenParams.toString(), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      timeout: 8000,
    });
    log.warn("Google OAuth credential probe returned an unexpected success");
  } catch (error) {
    if (!axios.isAxiosError(error)) {
      log.warn("Google OAuth credential probe failed", { error });
      return;
    }

    const body = error.response?.data as GoogleTokenErrorBody | undefined;

    if (body?.error === "invalid_grant") {
      log.info("Google OAuth credentials OK");
      return;
    }

    if (body?.error === "invalid_client") {
      log.error("Google OAuth credentials invalid", undefined, {
        clientId: env.googleClientId,
        callbackUrl: env.googleCallbackUrl,
      });
      return;
    }

    log.warn("Google OAuth credential probe failed", {
      error: body?.error ?? error.message,
      description: body?.error_description ?? "",
    });
  }
}
