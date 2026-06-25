import { env } from "../config/env.js";

const APP_NAME = "Trading Signal";

const EMAIL_COLORS = {
  primary: "#7c3aed",
  positive: "#059669",
  negative: "#dc2626",
  foreground: "#08060d",
  muted: "#64748b",
  border: "#e5e4e7",
  background: "#f8fafc",
  card: "#ffffff",
} as const;

type AlertDirection = {
  verb: string;
  color: string;
  sign: string;
  absChange: number;
};

/** Resolves display fields for the alert move direction. */
function resolveAlertDirection(changePercent: number): AlertDirection {
  if (changePercent >= 0) {
    return {
      verb: "rose",
      color: EMAIL_COLORS.positive,
      sign: "+",
      absChange: changePercent,
    };
  }

  return {
    verb: "fell",
    color: EMAIL_COLORS.negative,
    sign: "",
    absChange: Math.abs(changePercent),
  };
}

/** Adds the Trading Signal display name when the from address is bare. */
export function formatAlertEmailFrom(from: string): string {
  const trimmed = from.trim();
  if (!trimmed || trimmed.includes("<")) {
    return trimmed;
  }

  return `${APP_NAME} <${trimmed}>`;
}

/** Builds the subject line for a price alert email. */
export function buildAlertEmailSubject(payload: AlertEmailPayload): string {
  const direction = resolveAlertDirection(payload.changePercent);
  return `${payload.symbol} price alert: ${direction.sign}${payload.changePercent.toFixed(2)}%`;
}

/** Builds the plain-text body for a price alert email. */
export function buildAlertEmailText(payload: AlertEmailPayload): string {
  const direction = resolveAlertDirection(payload.changePercent);

  return [
    `${APP_NAME} — Price alert`,
    "",
    `${payload.symbol} ${direction.verb} ${direction.absChange.toFixed(2)}% (your threshold was ${payload.thresholdPercent.toFixed(2)}%)`,
    "",
    `Current price: $${payload.price.toFixed(2)}`,
    `Baseline price: $${payload.baselinePrice.toFixed(2)}`,
    "",
    `Open ${APP_NAME} to review your alert history.`,
  ].join("\n");
}

/** Builds the HTML body for a price alert email. */
export function buildAlertEmailHtml(payload: AlertEmailPayload): string {
  const direction = resolveAlertDirection(payload.changePercent);
  const clientUrl = env.clientUrl.replace(/\/$/, "");
  const dashboardAlertsUrl = `${clientUrl}/dashboard/alerts`;
  const logoUrl = `${clientUrl}/email-logo.png`;
  const headline = `${payload.symbol} ${direction.verb} <span style="color:${direction.color}">${direction.sign}${payload.changePercent.toFixed(2)}%</span>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${APP_NAME}</title>
</head>
<body style="margin:0;padding:0;background:${EMAIL_COLORS.background};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${EMAIL_COLORS.foreground};">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${EMAIL_COLORS.background};padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:${EMAIL_COLORS.card};border:1px solid ${EMAIL_COLORS.border};border-radius:16px;overflow:hidden;">
          <tr>
            <td style="background:${EMAIL_COLORS.primary};padding:20px 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td width="44" valign="middle">
                    <img src="${logoUrl}" alt="${APP_NAME}" width="40" height="40" style="display:block;border:0;border-radius:8px;">
                  </td>
                  <td valign="middle" style="padding-left:12px;">
                    <p style="margin:0;font-size:18px;font-weight:700;color:#ffffff;line-height:1.2;">${APP_NAME}</p>
                    <p style="margin:4px 0 0;font-size:13px;color:rgba(255,255,255,0.85);">Price alert</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 24px 8px;">
              <p style="margin:0;font-size:24px;font-weight:700;line-height:1.3;color:${EMAIL_COLORS.foreground};">${headline}</p>
              <p style="margin:12px 0 0;font-size:15px;line-height:1.5;color:${EMAIL_COLORS.muted};">
                Your alert threshold of <strong>${payload.thresholdPercent.toFixed(2)}%</strong> was crossed.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 24px 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${EMAIL_COLORS.background};border:1px solid ${EMAIL_COLORS.border};border-radius:12px;">
                <tr>
                  <td style="padding:16px 18px;border-bottom:1px solid ${EMAIL_COLORS.border};">
                    <p style="margin:0;font-size:12px;text-transform:uppercase;letter-spacing:0.04em;color:${EMAIL_COLORS.muted};">Current price</p>
                    <p style="margin:6px 0 0;font-size:20px;font-weight:700;color:${EMAIL_COLORS.foreground};">$${payload.price.toFixed(2)}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 18px;border-bottom:1px solid ${EMAIL_COLORS.border};">
                    <p style="margin:0;font-size:12px;text-transform:uppercase;letter-spacing:0.04em;color:${EMAIL_COLORS.muted};">Baseline price</p>
                    <p style="margin:6px 0 0;font-size:20px;font-weight:700;color:${EMAIL_COLORS.foreground};">$${payload.baselinePrice.toFixed(2)}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 18px;">
                    <p style="margin:0;font-size:12px;text-transform:uppercase;letter-spacing:0.04em;color:${EMAIL_COLORS.muted};">Your threshold</p>
                    <p style="margin:6px 0 0;font-size:20px;font-weight:700;color:${EMAIL_COLORS.foreground};">${payload.thresholdPercent.toFixed(2)}%</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 24px 28px;" align="center">
              <a href="${dashboardAlertsUrl}" style="display:inline-block;background:${EMAIL_COLORS.primary};color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:12px 22px;border-radius:10px;">
                Open ${APP_NAME}
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:0 24px 24px;">
              <p style="margin:0;font-size:12px;line-height:1.5;color:${EMAIL_COLORS.muted};text-align:center;">
                You received this email because you enabled price alerts in ${APP_NAME}.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export type AlertEmailPayload = {
  to: string;
  symbol: string;
  changePercent: number;
  price: number;
  baselinePrice: number;
  thresholdPercent: number;
};
