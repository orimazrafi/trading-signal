package runner

import (
	"context"
	"errors"
	"log"
	"math"
	"sync"
	"time"

	"github.com/redis/go-redis/v9"

	"github.com/trading-signal/alerts-runner/internal/config"
	"github.com/trading-signal/alerts-runner/internal/db"
	"github.com/trading-signal/alerts-runner/internal/email"
	"github.com/trading-signal/alerts-runner/internal/market"
	"github.com/trading-signal/alerts-runner/internal/quotes"
	"github.com/trading-signal/alerts-runner/internal/redispub"
)

// EvaluateOptions controls optional behavior for a single evaluation pass.
type EvaluateOptions struct {
	// IgnoreMarketHours skips the US regular-hours gate (used by the dev manual trigger).
	IgnoreMarketHours bool
}

// Runner evaluates enabled price alerts on a fixed interval.
type Runner struct {
	settings   config.Settings
	store      *db.Store
	quotes     *quotes.Provider
	email      *email.Sender
	publisher  *redispub.Publisher
	mu         sync.Mutex
}

// New wires the alert runner with database, quote, email, and pub/sub dependencies.
func New(
	settings config.Settings,
	store *db.Store,
	redisClient *redis.Client,
) *Runner {
	return &Runner{
		settings:  settings,
		store:     store,
		quotes:    quotes.NewProvider(redisClient, settings.MarketDataProvider, settings.MarketDataAPIKey, settings.StockCacheTTLSeconds),
		email:     email.NewSender(settings.ResendAPIKey, settings.EmailFrom, settings.ClientURL),
		publisher: redispub.NewPublisher(redisClient),
	}
}

// Start runs the alert evaluation loop until the context is cancelled.
// The first check runs immediately; subsequent checks use CheckInterval from config.
func (r *Runner) Start(ctx context.Context) {
	ticker := time.NewTicker(r.settings.CheckInterval)
	defer ticker.Stop()

	log.Printf("alerts runner started (interval=%s)", r.settings.CheckInterval)

	r.evaluate(ctx, EvaluateOptions{})

	for {
		select {
		case <-ctx.Done():
			log.Println("alerts runner stopped")
			return
		case <-ticker.C:
			r.evaluate(ctx, EvaluateOptions{})
		}
	}
}

// RunOnce evaluates all enabled alerts immediately without resetting the scheduled ticker.
// Market-hours checks are bypassed so developers can test alerts outside trading hours.
func (r *Runner) RunOnce(ctx context.Context) {
	r.evaluate(ctx, EvaluateOptions{IgnoreMarketHours: true})
}

// evaluate loads enabled alerts, fetches live prices, and triggers those that crossed their threshold.
// A mutex prevents overlapping runs when the ticker and dev HTTP trigger fire close together.
func (r *Runner) evaluate(ctx context.Context, opts EvaluateOptions) {
	r.mu.Lock()
	defer r.mu.Unlock()

	if !opts.IgnoreMarketHours && !market.IsUSMarketOpen(time.Now()) {
		return
	}

	alerts, err := r.store.ListEnabledAlerts(ctx)
	if err != nil {
		log.Printf("failed to load alerts: %v", err)
		return
	}

	if len(alerts) == 0 {
		return
	}

	priceBySymbol := make(map[string]float64)

	for _, alert := range alerts {
		currentPrice, ok := priceBySymbol[alert.Symbol]
		if !ok {
			currentPrice, err = r.quotes.GetPrice(ctx, alert.Symbol)
			if err != nil {
				log.Printf("failed to fetch price for %s: %v", alert.Symbol, err)
				continue
			}
			priceBySymbol[alert.Symbol] = currentPrice
		}

		changePercent := calculateChangePercent(alert.BaselinePrice, currentPrice)
		if math.Abs(changePercent) < alert.ThresholdPercent {
			continue
		}

		emailSent := false
		notification, err := r.store.TriggerAlert(ctx, alert, changePercent, currentPrice, false)
		if err != nil {
			if errors.Is(err, db.ErrAlertAlreadyTriggered) {
				continue
			}
			log.Printf("failed to persist alert for %s: %v", alert.Symbol, err)
			continue
		}

		if err := r.publisher.PublishAlert(ctx, notification); err != nil {
			log.Printf("failed to publish alert event for %s: %v", alert.Symbol, err)
		}

		if alert.EmailEnabled {
			err = r.email.SendAlert(ctx, email.AlertPayload{
				To:               alert.UserEmail,
				Symbol:           alert.Symbol,
				ChangePercent:    changePercent,
				Price:            currentPrice,
				BaselinePrice:    alert.BaselinePrice,
				ThresholdPercent: alert.ThresholdPercent,
			})
			if err != nil {
				log.Printf("failed to send alert email for %s: %v", alert.Symbol, err)
			} else {
				emailSent = true
				if err := r.store.MarkNotificationEmailSent(ctx, notification.ID); err != nil {
					log.Printf("failed to mark alert email sent for %s: %v", alert.Symbol, err)
				}
			}
		}

		log.Printf(
			"triggered alert user=%s symbol=%s price=%.2f baseline=%.2f threshold=%.2f%% change=%.2f%% at=%s emailSent=%t",
			alert.UserID,
			alert.Symbol,
			currentPrice,
			alert.BaselinePrice,
			alert.ThresholdPercent,
			changePercent,
			notification.CreatedAt.UTC().Format(time.RFC3339),
			emailSent,
		)
	}
}

// calculateChangePercent returns the percentage move from baseline to current price.
// Returns zero when baseline is non-positive to avoid division by zero.
func calculateChangePercent(baselinePrice, currentPrice float64) float64 {
	if baselinePrice <= 0 {
		return 0
	}

	return ((currentPrice - baselinePrice) / baselinePrice) * 100
}
