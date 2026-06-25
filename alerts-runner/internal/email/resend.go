// Package email builds and sends branded price-alert emails through the Resend API.
package email

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

// Sender delivers alert emails through Resend.
type Sender struct {
	apiKey     string
	from       string
	clientURL  string
	httpClient *http.Client
}

// NewSender creates a Resend email sender.
func NewSender(apiKey, from, clientURL string) *Sender {
	return &Sender{
		apiKey:     apiKey,
		from:       from,
		clientURL:  strings.TrimRight(strings.TrimSpace(clientURL), "/"),
		httpClient: &http.Client{Timeout: 10 * time.Second},
	}
}

// AlertPayload is the content of a triggered price alert email.
type AlertPayload struct {
	To               string
	Symbol           string
	ChangePercent    float64
	Price            float64
	BaselinePrice    float64
	ThresholdPercent float64
}

// SendAlert delivers a price-alert email when Resend credentials and a from-address are configured.
func (s *Sender) SendAlert(ctx context.Context, payload AlertPayload) error {
	if s.apiKey == "" || s.from == "" {
		return fmt.Errorf("email provider is not configured")
	}

	content := buildAlertEmailContent(payload, s.clientURL)

	body := map[string]any{
		"from":    formatFromAddress(s.from),
		"to":      []string{payload.To},
		"subject": content.Subject,
		"text":    content.Text,
		"html":    content.HTML,
	}

	encoded, err := json.Marshal(body)
	if err != nil {
		return err
	}

	request, err := http.NewRequestWithContext(ctx, http.MethodPost, "https://api.resend.com/emails", bytes.NewReader(encoded))
	if err != nil {
		return err
	}

	request.Header.Set("Authorization", "Bearer "+s.apiKey)
	request.Header.Set("Content-Type", "application/json")

	response, err := s.httpClient.Do(request)
	if err != nil {
		return err
	}
	defer response.Body.Close()

	if response.StatusCode >= 300 {
		body, _ := io.ReadAll(response.Body)
		details := strings.TrimSpace(string(body))
		if details == "" {
			return fmt.Errorf("resend returned status %d", response.StatusCode)
		}
		return fmt.Errorf("resend returned status %d: %s", response.StatusCode, details)
	}

	return nil
}

// formatFromAddress adds the Trading Signal display name when the address is bare.
func formatFromAddress(from string) string {
	trimmed := strings.TrimSpace(from)
	if trimmed == "" {
		return trimmed
	}

	if strings.Contains(trimmed, "<") {
		return trimmed
	}

	return fmt.Sprintf("%s <%s>", appName, trimmed)
}
