// Package main boots the price-alert background worker: PostgreSQL, Redis, and the evaluation loop.
package main

import (
	"context"
	"log"
	"os/signal"
	"strings"
	"syscall"

	"github.com/redis/go-redis/v9"

	"github.com/trading-signal/alerts-runner/internal/config"
	"github.com/trading-signal/alerts-runner/internal/db"
	"github.com/trading-signal/alerts-runner/internal/devhttp"
	"github.com/trading-signal/alerts-runner/internal/runner"
)

// main loads configuration, connects dependencies, optionally starts the dev HTTP trigger, and runs until shutdown.
func main() {
	settings := config.Load()
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	store, err := db.Connect(ctx, settings.DatabaseURL)
	if err != nil {
		log.Fatalf("database connection failed: %v", err)
	}
	defer store.Close()

	redisClient := redis.NewClient(&redis.Options{Addr: redisAddress(settings.RedisURL)})
	defer redisClient.Close()

	if err := redisClient.Ping(ctx).Err(); err != nil {
		log.Fatalf("redis connection failed: %v", err)
	}

	alertRunner := runner.New(settings, store, redisClient)

	if settings.DevHTTPEnabled {
		devServer := devhttp.New(alertRunner, settings.DevHTTPPort)
		go devServer.Start(ctx)
	}

	alertRunner.Start(ctx)
}

// redisAddress returns the host:port portion of a redis:// connection URL.
func redisAddress(redisURL string) string {
	if strings.HasPrefix(redisURL, "redis://") {
		return strings.TrimPrefix(redisURL, "redis://")
	}

	return redisURL
}
