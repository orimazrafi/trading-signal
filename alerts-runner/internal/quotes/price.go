// Package quotes fetches live stock prices from a market-data vendor for alert evaluation.
package quotes

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/redis/go-redis/v9"
)

const (
	stockQuoteCachePrefix = "stock:price:"
	finnhubQuoteURL       = "https://finnhub.io/api/v1/quote"
	twelveDataQuoteURL    = "https://api.twelvedata.com/price"
)

// Provider resolves latest stock prices from a vendor API.
type Provider struct {
	redisClient *redis.Client
	providerID  string
	apiKey      string
	cacheTTL    time.Duration
	httpClient  *http.Client
}

// NewProvider creates a quote provider for the configured market data vendor.
func NewProvider(redisClient *redis.Client, providerID, apiKey string, cacheTTLSeconds int) *Provider {
	return &Provider{
		redisClient: redisClient,
		providerID:  strings.ToLower(strings.TrimSpace(providerID)),
		apiKey:      apiKey,
		cacheTTL:    time.Duration(cacheTTLSeconds) * time.Second,
		httpClient:  &http.Client{Timeout: 8 * time.Second},
	}
}

type finnhubQuoteResponse struct {
	Current       float64 `json:"c"`
	PreviousClose float64 `json:"pc"`
}

type twelveDataPriceResponse struct {
	Price   string `json:"price"`
	Code    int    `json:"code"`
	Message string `json:"message"`
	Status  string `json:"status"`
}

// GetPrice returns a fresh vendor price for alert threshold checks.
// Alert evaluation never reads Redis; after fetch, the price is written for the Node API cache.
func (p *Provider) GetPrice(ctx context.Context, symbol string) (float64, error) {
	normalized := strings.ToUpper(strings.TrimSpace(symbol))

	if p.apiKey == "" {
		return 0, fmt.Errorf("market data API key not configured")
	}

	price, err := p.fetchPriceFromAPI(ctx, normalized)
	if err != nil {
		return 0, err
	}

	p.syncQuoteCacheForAPI(ctx, normalized, price)

	return price, nil
}

// syncQuoteCacheForAPI writes the fetched quote to Redis so the Node server can serve cached prices.
// This cache is not used by alert evaluation, which always requires a live vendor quote.
func (p *Provider) syncQuoteCacheForAPI(ctx context.Context, symbol string, price float64) {
	cacheKey := stockQuoteCachePrefix + symbol
	encoded, err := json.Marshal(map[string]any{
		"symbol":  symbol,
		"price":   price,
		"name":    symbol,
		"peRatio": 0,
		"sector":  "Unknown",
	})
	if err != nil {
		return
	}

	_ = p.redisClient.Set(ctx, cacheKey, encoded, p.cacheTTL).Err()
}

// fetchPriceFromAPI loads the latest trade price from the configured vendor.
func (p *Provider) fetchPriceFromAPI(ctx context.Context, symbol string) (float64, error) {
	switch p.providerID {
	case "twelvedata", "twelve_data", "twelve-data":
		return p.fetchTwelveDataPrice(ctx, symbol)
	default:
		return p.fetchFinnhubPrice(ctx, symbol)
	}
}

// fetchFinnhubPrice loads the latest trade price from Finnhub.
func (p *Provider) fetchFinnhubPrice(ctx context.Context, symbol string) (float64, error) {
	requestURL := fmt.Sprintf("%s?symbol=%s&token=%s", finnhubQuoteURL, symbol, p.apiKey)
	request, err := http.NewRequestWithContext(ctx, http.MethodGet, requestURL, nil)
	if err != nil {
		return 0, err
	}

	response, err := p.httpClient.Do(request)
	if err != nil {
		return 0, err
	}
	defer response.Body.Close()

	body, err := io.ReadAll(response.Body)
	if err != nil {
		return 0, err
	}

	var payload finnhubQuoteResponse
	if err := json.Unmarshal(body, &payload); err != nil {
		return 0, err
	}

	if payload.Current > 0 {
		return payload.Current, nil
	}

	if payload.PreviousClose > 0 {
		return payload.PreviousClose, nil
	}

	return 0, fmt.Errorf("invalid finnhub price for %s", symbol)
}

// fetchTwelveDataPrice loads the latest trade price from Twelve Data.
func (p *Provider) fetchTwelveDataPrice(ctx context.Context, symbol string) (float64, error) {
	requestURL := fmt.Sprintf("%s?symbol=%s&apikey=%s", twelveDataQuoteURL, symbol, p.apiKey)
	request, err := http.NewRequestWithContext(ctx, http.MethodGet, requestURL, nil)
	if err != nil {
		return 0, err
	}

	response, err := p.httpClient.Do(request)
	if err != nil {
		return 0, err
	}
	defer response.Body.Close()

	body, err := io.ReadAll(response.Body)
	if err != nil {
		return 0, err
	}

	var payload twelveDataPriceResponse
	if err := json.Unmarshal(body, &payload); err != nil {
		return 0, err
	}

	if payload.Code != 0 || payload.Status == "error" {
		if payload.Message != "" {
			return 0, fmt.Errorf(payload.Message)
		}
		return 0, fmt.Errorf("twelve data price failed for %s", symbol)
	}

	var price float64
	if _, err := fmt.Sscanf(payload.Price, "%f", &price); err != nil || price <= 0 {
		return 0, fmt.Errorf("invalid price for %s", symbol)
	}

	return price, nil
}
