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
	verb      string
	color     string
	sign      string
	absChange float64
}

// resolveAlertDirection returns display fields for the alert move direction.
func resolveAlertDirection(changePercent float64) alertDirection {
	if changePercent >= 0 {
		return alertDirection{
			verb:      "rose",
			color:     colorPositive,
			sign:      "+",
			absChange: changePercent,
		}
	}

	return alertDirection{
		verb:      "fell",
		color:     colorNegative,
		sign:      "",
		absChange: math.Abs(changePercent),
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

	text := buildAlertEmailText(payload, direction)
	html := buildAlertEmailHTML(payload, direction, clientURL)

	return AlertEmailContent{
		Subject: subject,
		Text:    text,
		HTML:    html,
	}
}

// buildAlertEmailText builds the plain-text body for a price alert email.
func buildAlertEmailText(payload AlertPayload, direction alertDirection) string {
	lines := []string{
		appName + " — Price alert",
		"",
		fmt.Sprintf(
			"%s %s %.2f%% (your threshold was %.2f%%)",
			payload.Symbol,
			direction.verb,
			direction.absChange,
			payload.ThresholdPercent,
		),
		"",
		fmt.Sprintf("Current price: $%.2f", payload.Price),
		fmt.Sprintf("Baseline price: $%.2f", payload.BaselinePrice),
		"",
		"Open Trading Signal to review your alert history.",
	}

	return strings.Join(lines, "\n")
}

// buildAlertEmailHTML builds the HTML body for a price alert email.
func buildAlertEmailHTML(payload AlertPayload, direction alertDirection, clientURL string) string {
	logoURL := strings.TrimRight(clientURL, "/") + "/email-logo.png"
	dashboardURL := strings.TrimRight(clientURL, "/") + "/dashboard/alerts"
	headline := fmt.Sprintf(
		"%s %s <span style=\"color:%s\">%s%.2f%%</span>",
		payload.Symbol,
		direction.verb,
		direction.color,
		direction.sign,
		payload.ChangePercent,
	)

	return fmt.Sprintf(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>%s</title>
</head>
<body style="margin:0;padding:0;background:%s;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:%s;">
  <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="background:%s;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="max-width:560px;background:%s;border:1px solid %s;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="background:%s;padding:20px 24px;">
              <table role="presentation" width="100%%" cellspacing="0" cellpadding="0">
                <tr>
                  <td width="44" valign="middle">
                    <img src="%s" alt="%s" width="40" height="40" style="display:block;border:0;border-radius:8px;">
                  </td>
                  <td valign="middle" style="padding-left:12px;">
                    <p style="margin:0;font-size:18px;font-weight:700;color:#ffffff;line-height:1.2;">%s</p>
                    <p style="margin:4px 0 0;font-size:13px;color:rgba(255,255,255,0.85);">Price alert</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 24px 8px;">
              <p style="margin:0;font-size:24px;font-weight:700;line-height:1.3;color:%s;">%s</p>
              <p style="margin:12px 0 0;font-size:15px;line-height:1.5;color:%s;">
                Your alert threshold of <strong>%.2f%%</strong> was crossed.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 24px 24px;">
              <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="background:%s;border:1px solid %s;border-radius:12px;">
                <tr>
                  <td style="padding:16px 18px;border-bottom:1px solid %s;">
                    <p style="margin:0;font-size:12px;text-transform:uppercase;letter-spacing:0.04em;color:%s;">Current price</p>
                    <p style="margin:6px 0 0;font-size:20px;font-weight:700;color:%s;">$%.2f</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 18px;border-bottom:1px solid %s;">
                    <p style="margin:0;font-size:12px;text-transform:uppercase;letter-spacing:0.04em;color:%s;">Baseline price</p>
                    <p style="margin:6px 0 0;font-size:20px;font-weight:700;color:%s;">$%.2f</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 18px;">
                    <p style="margin:0;font-size:12px;text-transform:uppercase;letter-spacing:0.04em;color:%s;">Your threshold</p>
                    <p style="margin:6px 0 0;font-size:20px;font-weight:700;color:%s;">%.2f%%</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 24px 28px;" align="center">
              <a href="%s" style="display:inline-block;background:%s;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:12px 22px;border-radius:10px;">
                Open %s
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:0 24px 24px;">
              <p style="margin:0;font-size:12px;line-height:1.5;color:%s;text-align:center;">
                You received this email because you enabled price alerts in %s.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
		appName,
		colorBackground,
		colorForeground,
		colorBackground,
		colorCard,
		colorBorder,
		colorPrimary,
		logoURL,
		appName,
		appName,
		colorForeground,
		headline,
		colorMuted,
		payload.ThresholdPercent,
		colorBackground,
		colorBorder,
		colorBorder,
		colorMuted,
		colorForeground,
		payload.Price,
		colorBorder,
		colorMuted,
		colorForeground,
		payload.BaselinePrice,
		colorMuted,
		colorForeground,
		payload.ThresholdPercent,
		dashboardURL,
		colorPrimary,
		appName,
		colorMuted,
		appName,
	)
}
