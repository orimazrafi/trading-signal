package email

import (
	"strings"
	"testing"
)

func TestBuildAlertEmailContent(t *testing.T) {
	t.Parallel()

	payload := AlertPayload{
		To:               "user@example.com",
		Symbol:           "CIFR",
		ChangePercent:    -0.5,
		Price:            25.85,
		BaselinePrice:    25.98,
		ThresholdPercent: 0.5,
	}

	content := buildAlertEmailContent(payload, "http://localhost:5173")

	if content.Subject != "CIFR price alert: -0.50%" {
		t.Fatalf("subject = %q", content.Subject)
	}

	for _, snippet := range []string{
		"CIFR",
		"Price dropped",
		"$25.85",
		"$25.98",
		"View alert history",
		"/dashboard/alerts",
		"Trading Signal",
	} {
		if !strings.Contains(content.HTML, snippet) {
			t.Fatalf("HTML missing %q", snippet)
		}
	}

	for _, snippet := range []string{
		"CIFR",
		"fell",
		"$25.85",
		"$25.98",
		"View your alert history",
		"/dashboard/alerts",
		"Trading Signal",
	} {
		if !strings.Contains(content.Text, snippet) {
			t.Fatalf("text missing %q", snippet)
		}
	}
}

func TestResolveAlertDirection(t *testing.T) {
	t.Parallel()

	down := resolveAlertDirection(-1.25)
	if down.badgeLabel != "Price dropped" || down.sign != "" {
		t.Fatalf("unexpected down direction: %+v", down)
	}

	up := resolveAlertDirection(2)
	if up.badgeLabel != "Price rose" || up.sign != "+" {
		t.Fatalf("unexpected up direction: %+v", up)
	}
}
