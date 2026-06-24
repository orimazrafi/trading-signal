package config

import (
	"os"
	"strconv"
	"time"
)

// Settings loaded from environment variables.
type Settings struct {
	DatabaseURL          string
	RedisURL             string
	TwelveDataAPIKey     string
	ResendAPIKey         string
	EmailFrom            string
	CheckInterval        time.Duration
	StockCacheTTLSeconds int
}

// Load reads alert runner configuration from the environment.
func Load() Settings {
	checkIntervalMs := envInt("ALERT_CHECK_INTERVAL_MS", 300_000)

	return Settings{
		DatabaseURL:          envString("DATABASE_URL", "postgresql://trading:trading@postgres:5432/trading_signal"),
		RedisURL:             envString("REDIS_URL", "redis://redis:6379"),
		TwelveDataAPIKey:     envString("TWELVE_DATA_API_KEY", ""),
		ResendAPIKey:         envString("RESEND_API_KEY", ""),
		EmailFrom:            envString("EMAIL_FROM", ""),
		CheckInterval:        time.Duration(checkIntervalMs) * time.Millisecond,
		StockCacheTTLSeconds: envInt("STOCK_CACHE_TTL_SECONDS", 60),
	}
}

func envString(key, fallback string) string {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}
	return value
}

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
