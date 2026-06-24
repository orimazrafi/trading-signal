package runner

import (
	"context"
	"log"
	"math"
	"time"

	"github.com/redis/go-redis/v9"

	"github.com/trading-signal/alerts-runner/internal/config"
	"github.com/trading-signal/alerts-runner/internal/db"
	"github.com/trading-signal/alerts-runner/internal/email"
	"github.com/trading-signal/alerts-runner/internal/market"
	"github.com/trading-signal/alerts-runner/internal/quotes"
	"github.com/trading-signal/alerts-runner/internal/redispub"
)

// Runner evaluates enabled price alerts on a fixed interval.
type Runner struct {
	settings   config.Settings
	store      *db.Store
	quotes     *quotes.Provider
	email      *email.Sender
	publisher  *redispub.Publisher
}

// New creates an alert runner.
func New(
	settings config.Settings,
	store *db.Store,
	redisClient *redis.Client,
) *Runner {
	return &Runner{
		settings:  settings,
		store:     store,
		quotes:    quotes.NewProvider(redisClient, settings.TwelveDataAPIKey, settings.StockCacheTTLSeconds),
		email:     email.NewSender(settings.ResendAPIKey, settings.EmailFrom),
		publisher: redispub.NewPublisher(redisClient),
	}
}

// Start runs the alert evaluation loop until the context is cancelled.
func (r *Runner) Start(ctx context.Context) {
	ticker := time.NewTicker(r.settings.CheckInterval)
	defer ticker.Stop()

	log.Printf("alerts runner started (interval=%s)", r.settings.CheckInterval)

	r.evaluate(ctx)

	for {
		select {
		case <-ctx.Done():
			log.Println("alerts runner stopped")
			return
		case <-ticker.C:
			r.evaluate(ctx)
		}
	}
}

func (r *Runner) evaluate(ctx context.Context) {
	if !market.IsUSMarketOpen(time.Now()) {
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
			}
		}

		notification, err := r.store.TriggerAlert(ctx, alert, changePercent, currentPrice, emailSent)
		if err != nil {
			log.Printf("failed to persist alert for %s: %v", alert.Symbol, err)
			continue
		}

		if err := r.publisher.PublishAlert(ctx, notification); err != nil {
			log.Printf("failed to publish alert event for %s: %v", alert.Symbol, err)
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

func calculateChangePercent(baselinePrice, currentPrice float64) float64 {
	if baselinePrice <= 0 {
		return 0
	}

	return ((currentPrice - baselinePrice) / baselinePrice) * 100
}
