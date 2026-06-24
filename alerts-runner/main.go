package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/redis/go-redis/v9"

	"github.com/trading-signal/alerts-runner/internal/config"
	"github.com/trading-signal/alerts-runner/internal/db"
	"github.com/trading-signal/alerts-runner/internal/runner"
)

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
	alertRunner.Start(ctx)

	os.Exit(0)
}

func redisAddress(redisURL string) string {
	prefix := "redis://"
	if len(redisURL) > len(prefix) && redisURL[:len(prefix)] == prefix {
		return redisURL[len(prefix):]
	}

	return redisURL
}
