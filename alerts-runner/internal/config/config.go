// Package config loads alert-runner settings from environment variables.
package config

import (
	"os"
	"strconv"
	"strings"
	"time"
)

// Settings holds runtime configuration for the alert evaluation worker.
type Settings struct {
	DatabaseURL          string
	RedisURL             string
	MarketDataProvider   string
	MarketDataAPIKey     string
	ResendAPIKey         string
	EmailFrom            string
	ClientURL            string
	CheckInterval        time.Duration
	StockCacheTTLSeconds int
	DevHTTPEnabled       bool
	DevHTTPPort          int
}

// Load reads alert runner configuration from the environment with documented defaults.
func Load() Settings {
	checkIntervalMs := envInt("ALERT_CHECK_INTERVAL_MS", 300_000)
	provider := strings.ToLower(strings.TrimSpace(envString("MARKET_DATA_PROVIDER", "finnhub")))

	return Settings{
		DatabaseURL:          envString("DATABASE_URL", "postgresql://trading:trading@postgres:5432/trading_signal"),
		RedisURL:             envString("REDIS_URL", "redis://redis:6379"),
		MarketDataProvider:   provider,
		MarketDataAPIKey:     resolveMarketDataAPIKey(provider),
		ResendAPIKey:         envString("RESEND_API_KEY", ""),
		EmailFrom:            envString("EMAIL_FROM", ""),
		ClientURL:            envString("CLIENT_URL", "http://localhost:5173"),
		CheckInterval:        time.Duration(checkIntervalMs) * time.Millisecond,
		StockCacheTTLSeconds: envInt("STOCK_CACHE_TTL_SECONDS", 60),
		DevHTTPEnabled:       envBool("ALERT_RUNNER_DEV_HTTP", false),
		DevHTTPPort:          envInt("ALERT_RUNNER_DEV_HTTP_PORT", 8081),
	}
}

// envBool parses a boolean environment variable; unrecognized values fall back to the default.
func envBool(key string, fallback bool) bool {
	value := strings.ToLower(strings.TrimSpace(os.Getenv(key)))
	if value == "" {
		return fallback
	}

	switch value {
	case "1", "true", "yes", "on":
		return true
	case "0", "false", "no", "off":
		return false
	default:
		return fallback
	}
}

// resolveMarketDataAPIKey returns the API key env var for the selected market-data provider.
func resolveMarketDataAPIKey(provider string) string {
	switch provider {
	case "twelvedata", "twelve_data", "twelve-data":
		return envString("TWELVE_DATA_API_KEY", "")
	default:
		return envString("FINNHUB_API_KEY", "")
	}
}

// envString returns a trimmed env value or the fallback when unset.
func envString(key, fallback string) string {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}
	return value
}

// envInt parses an integer environment variable; invalid values fall back to the default.
func envInt(key string, fallback int) int {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}

	parsed, err := strconv.Atoi(value)
	if err != nil {
		return fallback
	}

	return parsed
}
