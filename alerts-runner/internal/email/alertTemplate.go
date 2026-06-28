package email

import (
	"fmt"
	"math"
	"strings"
)

// AlertEmailContent is the rendered subject and bodies for a price alert email.
type AlertEmailContent struct {
	Subject string
	Text    string
	HTML    string
}

// alertDirection describes whether price moved up or down.
type alertDirection struct {
	verb       string
	badgeLabel string
	color      string
	badgeBg    string
	sign       string
	absChange  float64
}

// resolveAlertDirection returns display fields for the alert move direction.
func resolveAlertDirection(changePercent float64) alertDirection {
	if changePercent >= 0 {
		return alertDirection{
			verb:       "rose",
			badgeLabel: "Price rose",
			color:      colorPositive,
			badgeBg:    colorPositiveMuted,
			sign:       "+",
			absChange:  changePercent,
		}
	}

	return alertDirection{
		verb:       "fell",
		badgeLabel: "Price dropped",
		color:      colorNegative,
		badgeBg:    colorNegativeMuted,
		sign:       "",
		absChange:  math.Abs(changePercent),
	}
}

// buildAlertEmailContent renders subject, plain-text, and HTML bodies for a triggered alert.
func buildAlertEmailContent(payload AlertPayload, clientURL string) AlertEmailContent {
	direction := resolveAlertDirection(payload.ChangePercent)
	subject := fmt.Sprintf(
		"%s price alert: %s%.2f%%",
		payload.Symbol,
		direction.sign,
		payload.ChangePercent,
	)

	text := buildAlertEmailText(payload, direction, clientURL)
	html := buildAlertEmailHTML(payload, direction, clientURL)

	return AlertEmailContent{
		Subject: subject,
		Text:    text,
		HTML:    html,
	}
}

// buildAlertEmailText builds the plain-text body for a price alert email.
func buildAlertEmailText(payload AlertPayload, direction alertDirection, clientURL string) string {
	priceDelta := payload.Price - payload.BaselinePrice
	deltaSign := "+"
	if priceDelta < 0 {
		deltaSign = "-"
	}

	dashboardURL := strings.TrimRight(clientURL, "/") + "/dashboard/alerts"
	lines := []string{
		appName + " — Price alert",
		"",
		fmt.Sprintf("%s %s %.2f%%", payload.Symbol, direction.verb, direction.absChange),
		fmt.Sprintf("Your %.2f%% threshold was crossed.", payload.ThresholdPercent),
		"",
		fmt.Sprintf("Current price:  $%.2f", payload.Price),
		fmt.Sprintf("Baseline price: $%.2f", payload.BaselinePrice),
		fmt.Sprintf("Price change:   %s$%.2f", deltaSign, math.Abs(priceDelta)),
		"",
		"View your alert history:",
		dashboardURL,
		"",
		"You received this email because you enabled price alerts in " + appName + ".",
	}

	return strings.Join(lines, "\n")
}

// buildAlertEmailHTML builds the HTML body for a price alert email.
func buildAlertEmailHTML(payload AlertPayload, direction alertDirection, clientURL string) string {
	dashboardURL := strings.TrimRight(clientURL, "/") + "/dashboard/alerts"
	priceDelta := payload.Price - payload.BaselinePrice
	deltaSign := "+"
	deltaColor := colorPositive
	if priceDelta < 0 {
		deltaSign = "-"
		deltaColor = colorNegative
	}

	changeDisplay := fmt.Sprintf("%s%.2f%%", direction.sign, payload.ChangePercent)
	priceDeltaDisplay := fmt.Sprintf("%s$%.2f", deltaSign, math.Abs(priceDelta))

	return fmt.Sprintf(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>%s price alert</title>
</head>
<body style="margin:0;padding:0;background:%s;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:%s;">
  <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="background:%s;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="max-width:520px;background:%s;border:1px solid %s;border-radius:20px;overflow:hidden;box-shadow:0 12px 32px rgba(15,23,42,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg,%s 0%%,%s 100%%);padding:22px 24px;">
              <table role="presentation" width="100%%" cellspacing="0" cellpadding="0">
                <tr>
                  <td width="48" valign="middle">
                    <div style="width:44px;height:44px;border-radius:12px;background:rgba(255,255,255,0.16);text-align:center;line-height:44px;font-size:15px;font-weight:700;color:#ffffff;letter-spacing:-0.02em;">TS</div>
                  </td>
                  <td valign="middle" style="padding-left:14px;">
                    <p style="margin:0;font-size:18px;font-weight:700;color:#ffffff;line-height:1.2;">%s</p>
                    <p style="margin:4px 0 0;font-size:13px;color:rgba(248,250,252,0.88);">Price alert notification</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 24px 12px;text-align:center;">
              <p style="margin:0;font-size:13px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:%s;">%s</p>
              <p style="margin:10px 0 0;font-size:40px;font-weight:800;line-height:1;color:%s;letter-spacing:-0.03em;">%s</p>
              <p style="margin:14px 0 0;">
                <span style="display:inline-block;padding:7px 14px;border-radius:999px;background:%s;color:%s;font-size:13px;font-weight:700;">%s</span>
              </p>
              <p style="margin:16px 0 0;font-size:15px;line-height:1.5;color:%s;">
                Your <strong>%.2f%%</strong> alert threshold was crossed.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 24px 20px;">
              <table role="presentation" width="100%%" cellspacing="0" cellpadding="0">
                <tr>
                  <td width="48%%" valign="top" style="padding-right:6px;">
                    <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="background:%s;border:1px solid %s;border-radius:14px;">
                      <tr>
                        <td style="padding:16px 18px;">
                          <p style="margin:0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:%s;">Current</p>
                          <p style="margin:8px 0 0;font-size:24px;font-weight:800;color:%s;line-height:1;">$%.2f</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td width="48%%" valign="top" style="padding-left:6px;">
                    <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="background:%s;border:1px solid %s;border-radius:14px;">
                      <tr>
                        <td style="padding:16px 18px;">
                          <p style="margin:0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:%s;">Baseline</p>
                          <p style="margin:8px 0 0;font-size:24px;font-weight:800;color:%s;line-height:1;">$%.2f</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <p style="margin:14px 0 0;text-align:center;font-size:14px;font-weight:600;color:%s;">
                %s from baseline
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:4px 24px 28px;" align="center">
              <a href="%s" style="display:inline-block;background:%s;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 28px;border-radius:12px;box-shadow:0 8px 20px rgba(12,74,110,0.28);">
                View alert history
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:0 24px 24px;border-top:1px solid %s;">
              <p style="margin:16px 0 0;font-size:12px;line-height:1.6;color:%s;text-align:center;">
                You received this email because you enabled price alerts in %s.<br>
                Manage alerts anytime from your dashboard.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
		payload.Symbol,
		colorBackground,
		colorForeground,
		colorBackground,
		colorCard,
		colorBorder,
		colorPrimary,
		colorPrimaryAccent,
		appName,
		colorMuted,
		payload.Symbol,
		direction.color,
		changeDisplay,
		direction.badgeBg,
		direction.color,
		direction.badgeLabel,
		colorMuted,
		payload.ThresholdPercent,
		colorBackground,
		colorBorder,
		colorMuted,
		colorForeground,
		payload.Price,
		colorBackground,
		colorBorder,
		colorMuted,
		colorForeground,
		payload.BaselinePrice,
		deltaColor,
		priceDeltaDisplay,
		dashboardURL,
		colorPrimary,
		colorBorder,
		colorMuted,
		appName,
	)
}
