// Package db loads enabled alerts and persists triggered notifications in PostgreSQL.
package db

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

const alertRedisChannel = "alert:notifications"

// ErrAlertAlreadyTriggered is returned when another worker disabled the alert first.
var ErrAlertAlreadyTriggered = errors.New("alert already triggered")

// PriceAlert is an enabled user alert loaded from PostgreSQL.
type PriceAlert struct {
	ID               string
	UserID           string
	UserEmail        string
	Symbol           string
	ThresholdPercent float64
	BaselinePrice    float64
	EmailEnabled     bool
	LastTriggeredAt  *time.Time
}

// NotificationRecord is a persisted triggered alert.
type NotificationRecord struct {
	ID            string
	UserID        string
	AlertID       string
	Symbol        string
	ChangePercent float64
	Price         float64
	BaselinePrice float64
	CreatedAt     time.Time
}

// Store wraps PostgreSQL access for alert processing.
type Store struct {
	pool *pgxpool.Pool
}

// Connect opens a PostgreSQL connection pool.
func Connect(ctx context.Context, databaseURL string) (*Store, error) {
	pool, err := pgxpool.New(ctx, databaseURL)
	if err != nil {
		return nil, err
	}

	if err := pool.Ping(ctx); err != nil {
		pool.Close()
		return nil, err
	}

	return &Store{pool: pool}, nil
}

// Close releases the connection pool.
func (s *Store) Close() {
	s.pool.Close()
}

// ListEnabledAlerts returns all enabled alerts with user emails.
func (s *Store) ListEnabledAlerts(ctx context.Context) ([]PriceAlert, error) {
	rows, err := s.pool.Query(ctx, `
		SELECT
			pa.id,
			pa."userId",
			u.email,
			pa.symbol,
			pa."thresholdPercent",
			pa."baselinePrice",
			pa."emailEnabled",
			pa."lastTriggeredAt"
		FROM "PriceAlert" pa
		INNER JOIN "User" u ON u.id = pa."userId"
		WHERE pa.enabled = true
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	alerts := make([]PriceAlert, 0)

	for rows.Next() {
		var alert PriceAlert
		if err := rows.Scan(
			&alert.ID,
			&alert.UserID,
			&alert.UserEmail,
			&alert.Symbol,
			&alert.ThresholdPercent,
			&alert.BaselinePrice,
			&alert.EmailEnabled,
			&alert.LastTriggeredAt,
		); err != nil {
			return nil, err
		}
		alerts = append(alerts, alert)
	}

	return alerts, rows.Err()
}

// TriggerAlert atomically inserts a notification and disables the alert.
// Returns ErrAlertAlreadyTriggered when the alert was already disabled (e.g. concurrent workers).
func (s *Store) TriggerAlert(
	ctx context.Context,
	alert PriceAlert,
	changePercent float64,
	currentPrice float64,
	emailSent bool,
) (NotificationRecord, error) {
	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return NotificationRecord{}, err
	}
	defer tx.Rollback(ctx)

	now := time.Now().UTC()
	notificationID := newNotificationID()

	var notification NotificationRecord
	err = tx.QueryRow(ctx, `
		INSERT INTO "AlertNotification" (
			id,
			"alertId",
			"userId",
			symbol,
			"changePercent",
			price,
			"baselinePrice",
			"emailSent",
			"createdAt"
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING id, "userId", "alertId", symbol, "changePercent", price, "baselinePrice", "createdAt"
	`,
		notificationID,
		alert.ID,
		alert.UserID,
		alert.Symbol,
		changePercent,
		currentPrice,
		alert.BaselinePrice,
		emailSent,
		now,
	).Scan(
		&notification.ID,
		&notification.UserID,
		&notification.AlertID,
		&notification.Symbol,
		&notification.ChangePercent,
		&notification.Price,
		&notification.BaselinePrice,
		&notification.CreatedAt,
	)
	if err != nil {
		return NotificationRecord{}, err
	}

	updateResult, err := tx.Exec(ctx, `
		UPDATE "PriceAlert"
		SET
			enabled = false,
			"lastTriggeredAt" = $2,
			"updatedAt" = $2
		WHERE id = $1 AND enabled = true
	`, alert.ID, now)
	if err != nil {
		return NotificationRecord{}, err
	}

	if updateResult.RowsAffected() == 0 {
		return NotificationRecord{}, ErrAlertAlreadyTriggered
	}

	if err := tx.Commit(ctx); err != nil {
		return NotificationRecord{}, err
	}

	return notification, nil
}

// MarkNotificationEmailSent sets emailSent on a persisted alert notification.
func (s *Store) MarkNotificationEmailSent(ctx context.Context, notificationID string) error {
	_, err := s.pool.Exec(ctx, `
		UPDATE "AlertNotification"
		SET "emailSent" = true
		WHERE id = $1
	`, notificationID)
	return err
}

// RedisChannel returns the pub/sub channel used by the API server.
func RedisChannel() string {
	return alertRedisChannel
}

// newNotificationID generates a cuid-style identifier for AlertNotification rows.
func newNotificationID() string {
	buffer := make([]byte, 12)
	_, _ = rand.Read(buffer)
	return "cm" + hex.EncodeToString(buffer)
}
