import axios from "axios";
import { env } from "./env.js";

type GoogleTokenErrorBody = {
  error?: string;
  error_description?: string;
};

/** Probes Google's token endpoint; invalid_grant means id + secret are accepted. */
export async function logGoogleOAuthCredentialStatus(): Promise<void> {
  if (!env.googleClientId || !env.googleClientSecret) {
    console.warn("[auth] Google OAuth not configured (missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET)");
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
    console.warn("[auth] Google OAuth credential probe returned an unexpected success");
  } catch (error) {
    if (!axios.isAxiosError(error)) {
      console.warn("[auth] Google OAuth credential probe failed:", error);
      return;
    }

    const body = error.response?.data as GoogleTokenErrorBody | undefined;

    if (body?.error === "invalid_grant") {
      console.log("[auth] Google OAuth credentials OK (client id + secret accepted by Google)");
      return;
    }

    if (body?.error === "invalid_client") {
      console.error(
        "[auth] Google OAuth credentials INVALID — open Google Cloud Console, reset the OAuth client secret, and update server/.env",
      );
      console.error(`[auth]   client id: ${env.googleClientId}`);
      console.error(`[auth]   callback:  ${env.googleCallbackUrl}`);
      return;
    }

    console.warn(
      "[auth] Google OAuth credential probe failed:",
      body?.error ?? error.message,
      body?.error_description ?? "",
    );
  }
}
