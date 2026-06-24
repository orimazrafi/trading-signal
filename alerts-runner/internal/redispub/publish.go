package redispub

import (
	"context"
	"encoding/json"
	"time"

	"github.com/redis/go-redis/v9"

	"github.com/trading-signal/alerts-runner/internal/db"
)

// Publisher sends alert notifications to Redis pub/sub.
type Publisher struct {
	client *redis.Client
}

// NewPublisher creates a Redis publisher.
func NewPublisher(client *redis.Client) *Publisher {
	return &Publisher{client: client}
}

// NotificationEvent is the payload consumed by the API SSE subscriber.
type NotificationEvent struct {
	UserID        string  `json:"userId"`
	ID            string  `json:"id"`
	AlertID       string  `json:"alertId"`
	Symbol        string  `json:"symbol"`
	ChangePercent float64 `json:"changePercent"`
	Price         float64 `json:"price"`
	BaselinePrice float64 `json:"baselinePrice"`
	CreatedAt     string  `json:"createdAt"`
}

// PublishAlert sends a notification event to subscribed API clients.
func (p *Publisher) PublishAlert(ctx context.Context, notification db.NotificationRecord) error {
	event := NotificationEvent{
		UserID:        notification.UserID,
		ID:            notification.ID,
		AlertID:       notification.AlertID,
		Symbol:        notification.Symbol,
		ChangePercent: notification.ChangePercent,
		Price:         notification.Price,
		BaselinePrice: notification.BaselinePrice,
		CreatedAt:     notification.CreatedAt.UTC().Format(time.RFC3339),
	}

	encoded, err := json.Marshal(event)
	if err != nil {
		return err
	}

	return p.client.Publish(ctx, db.RedisChannel(), encoded).Err()
}
