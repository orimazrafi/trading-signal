import axios, { isAxiosError } from "axios";
import { env } from "../config/env.js";
import {
  buildAlertEmailHtml,
  buildAlertEmailSubject,
  buildAlertEmailText,
  formatAlertEmailFrom,
  type AlertEmailPayload,
} from "../lib/alertEmailTemplate.js";
import { log } from "../lib/logger/index.js";

const RESEND_EMAILS_URL = "https://api.resend.com/emails";

type ResendConfig = {
  apiKey: string;
  from: string;
};

type ResendEmailRequest = {
  from: string;
  to: string[];
  subject: string;
  text: string;
  html: string;
};

/** Returns Resend credentials when both API key and sender are configured. */
function getResendConfig(): ResendConfig | null {
  if (!env.resendApiKey || !env.emailFrom) {
    return null;
  }

  return { apiKey: env.resendApiKey, from: env.emailFrom };
}

/** Maps an alert payload to a Resend API email request. */
function buildResendAlertEmailRequest(
  payload: AlertEmailPayload,
  from: string,
): ResendEmailRequest {
  return {
    from: formatAlertEmailFrom(from),
    to: [payload.to],
    subject: buildAlertEmailSubject(payload),
    text: buildAlertEmailText(payload),
    html: buildAlertEmailHtml(payload),
  };
}

/** Posts a prepared email payload to the Resend API. */
async function postResendEmail(apiKey: string, email: ResendEmailRequest): Promise<void> {
  await axios.post(RESEND_EMAILS_URL, email, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
  });
}

/** Sends a price alert email via Resend when configured. */
export async function sendAlertEmail(payload: AlertEmailPayload): Promise<boolean> {
  const config = getResendConfig();

  if (!config) {
    log.warn("Alert email skipped because Resend is not configured", {
      symbol: payload.symbol,
      to: payload.to,
    });
    return false;
  }

  try {
    await postResendEmail(
      config.apiKey,
      buildResendAlertEmailRequest(payload, config.from),
    );
  } catch (error) {
    const status = isAxiosError(error) ? error.response?.status : undefined;
    const errorBody = isAxiosError(error)
      ? JSON.stringify(error.response?.data ?? error.message)
      : error instanceof Error
        ? error.message
        : "Unknown error";

    log.error("Failed to send alert email", new Error(errorBody), {
      symbol: payload.symbol,
      to: payload.to,
      status,
    });
    return false;
  }

  log.info("Sent alert email", { symbol: payload.symbol, to: payload.to });
  return true;
}

export type { AlertEmailPayload };
