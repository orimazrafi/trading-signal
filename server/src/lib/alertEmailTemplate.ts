import { env } from "../config/env.js";

const APP_NAME = "Trading Signal";

const EMAIL_COLORS = {
  primary: "#0c4a6e",
  primaryAccent: "#0e7490",
  positive: "#059669",
  positiveMuted: "#d1fae5",
  negative: "#dc2626",
  negativeMuted: "#fee2e2",
  foreground: "#0f172a",
  muted: "#64748b",
  border: "#e2e8f0",
  background: "#f1f5f9",
  card: "#ffffff",
} as const;

type AlertDirection = {
  verb: string;
  badgeLabel: string;
  color: string;
  badgeBg: string;
  sign: string;
  absChange: number;
};

/** Resolves display fields for the alert move direction. */
function resolveAlertDirection(changePercent: number): AlertDirection {
  if (changePercent >= 0) {
    return {
      verb: "rose",
      badgeLabel: "Price rose",
      color: EMAIL_COLORS.positive,
      badgeBg: EMAIL_COLORS.positiveMuted,
      sign: "+",
      absChange: changePercent,
    };
  }

  return {
    verb: "fell",
    badgeLabel: "Price dropped",
    color: EMAIL_COLORS.negative,
    badgeBg: EMAIL_COLORS.negativeMuted,
    sign: "",
    absChange: Math.abs(changePercent),
  };
}

/** Formats a signed dollar delta from baseline to current price. */
function formatPriceDelta(price: number, baselinePrice: number): { text: string; color: string } {
  const delta = price - baselinePrice;
  const sign = delta >= 0 ? "+" : "-";

  return {
    text: `${sign}$${Math.abs(delta).toFixed(2)}`,
    color: delta >= 0 ? EMAIL_COLORS.positive : EMAIL_COLORS.negative,
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
  const clientUrl = env.clientUrl.replace(/\/$/, "");
  const dashboardAlertsUrl = `${clientUrl}/dashboard/alerts`;
  const priceDelta = formatPriceDelta(payload.price, payload.baselinePrice);

  return [
    `${APP_NAME} — Price alert`,
    "",
    `${payload.symbol} ${direction.verb} ${direction.absChange.toFixed(2)}%`,
    `Your ${payload.thresholdPercent.toFixed(2)}% threshold was crossed.`,
    "",
    `Current price:  $${payload.price.toFixed(2)}`,
    `Baseline price: $${payload.baselinePrice.toFixed(2)}`,
    `Price change:   ${priceDelta.text}`,
    "",
    "View your alert history:",
    dashboardAlertsUrl,
    "",
    `You received this email because you enabled price alerts in ${APP_NAME}.`,
  ].join("\n");
}

/** Builds the HTML body for a price alert email. */
export function buildAlertEmailHtml(payload: AlertEmailPayload): string {
  const direction = resolveAlertDirection(payload.changePercent);
  const clientUrl = env.clientUrl.replace(/\/$/, "");
  const dashboardAlertsUrl = `${clientUrl}/dashboard/alerts`;
  const changeDisplay = `${direction.sign}${payload.changePercent.toFixed(2)}%`;
  const priceDelta = formatPriceDelta(payload.price, payload.baselinePrice);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${payload.symbol} price alert</title>
</head>
<body style="margin:0;padding:0;background:${EMAIL_COLORS.background};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${EMAIL_COLORS.foreground};">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${EMAIL_COLORS.background};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background:${EMAIL_COLORS.card};border:1px solid ${EMAIL_COLORS.border};border-radius:20px;overflow:hidden;box-shadow:0 12px 32px rgba(15,23,42,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg,${EMAIL_COLORS.primary} 0%,${EMAIL_COLORS.primaryAccent} 100%);padding:22px 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td width="48" valign="middle">
                    <div style="width:44px;height:44px;border-radius:12px;background:rgba(255,255,255,0.16);text-align:center;line-height:44px;font-size:15px;font-weight:700;color:#ffffff;letter-spacing:-0.02em;">TS</div>
                  </td>
                  <td valign="middle" style="padding-left:14px;">
                    <p style="margin:0;font-size:18px;font-weight:700;color:#ffffff;line-height:1.2;">${APP_NAME}</p>
                    <p style="margin:4px 0 0;font-size:13px;color:rgba(248,250,252,0.88);">Price alert notification</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 24px 12px;text-align:center;">
              <p style="margin:0;font-size:13px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${EMAIL_COLORS.muted};">${payload.symbol}</p>
              <p style="margin:10px 0 0;font-size:40px;font-weight:800;line-height:1;color:${direction.color};letter-spacing:-0.03em;">${changeDisplay}</p>
              <p style="margin:14px 0 0;">
                <span style="display:inline-block;padding:7px 14px;border-radius:999px;background:${direction.badgeBg};color:${direction.color};font-size:13px;font-weight:700;">${direction.badgeLabel}</span>
              </p>
              <p style="margin:16px 0 0;font-size:15px;line-height:1.5;color:${EMAIL_COLORS.muted};">
                Your <strong>${payload.thresholdPercent.toFixed(2)}%</strong> alert threshold was crossed.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 24px 20px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td width="48%" valign="top" style="padding-right:6px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${EMAIL_COLORS.background};border:1px solid ${EMAIL_COLORS.border};border-radius:14px;">
                      <tr>
                        <td style="padding:16px 18px;">
                          <p style="margin:0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:${EMAIL_COLORS.muted};">Current</p>
                          <p style="margin:8px 0 0;font-size:24px;font-weight:800;color:${EMAIL_COLORS.foreground};line-height:1;">$${payload.price.toFixed(2)}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td width="48%" valign="top" style="padding-left:6px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${EMAIL_COLORS.background};border:1px solid ${EMAIL_COLORS.border};border-radius:14px;">
                      <tr>
                        <td style="padding:16px 18px;">
                          <p style="margin:0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:${EMAIL_COLORS.muted};">Baseline</p>
                          <p style="margin:8px 0 0;font-size:24px;font-weight:800;color:${EMAIL_COLORS.foreground};line-height:1;">$${payload.baselinePrice.toFixed(2)}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <p style="margin:14px 0 0;text-align:center;font-size:14px;font-weight:600;color:${priceDelta.color};">
                ${priceDelta.text} from baseline
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:4px 24px 28px;" align="center">
              <a href="${dashboardAlertsUrl}" style="display:inline-block;background:${EMAIL_COLORS.primary};color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 28px;border-radius:12px;box-shadow:0 8px 20px rgba(12,74,110,0.28);">
                View alert history
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:0 24px 24px;border-top:1px solid ${EMAIL_COLORS.border};">
              <p style="margin:16px 0 0;font-size:12px;line-height:1.6;color:${EMAIL_COLORS.muted};text-align:center;">
                You received this email because you enabled price alerts in ${APP_NAME}.<br>
                Manage alerts anytime from your dashboard.
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
