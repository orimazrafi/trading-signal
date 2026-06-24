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
	httpClient *http.Client
}

// NewSender creates a Resend email sender.
func NewSender(apiKey, from string) *Sender {
	return &Sender{
		apiKey:     apiKey,
		from:       from,
		httpClient: &http.Client{Timeout: 10 * time.Second},
	}
}

// AlertPayload is the content of a triggered price alert email.
type AlertPayload struct {
	To                string
	Symbol            string
	ChangePercent     float64
	Price             float64
	BaselinePrice     float64
	ThresholdPercent  float64
}

// SendAlert sends a price alert email when Resend is configured.
func (s *Sender) SendAlert(ctx context.Context, payload AlertPayload) error {
	if s.apiKey == "" || s.from == "" {
		return fmt.Errorf("email provider is not configured")
	}

	direction := "up"
	absChange := payload.ChangePercent
	if payload.ChangePercent < 0 {
		direction = "down"
		absChange = -payload.ChangePercent
	}

	body := map[string]any{
		"from":    s.from,
		"to":      []string{payload.To},
		"subject": fmt.Sprintf("%s price alert: %+.2f%%", payload.Symbol, payload.ChangePercent),
		"text": fmt.Sprintf(
			"%s is %s %.2f%%\n\nCurrent price: $%.2f\nBaseline price: $%.2f\nYour threshold: %.2f%%\n\nOpen Trading Signal to review your alert history.",
			payload.Symbol,
			direction,
			absChange,
			payload.Price,
			payload.BaselinePrice,
			payload.ThresholdPercent,
		),
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
