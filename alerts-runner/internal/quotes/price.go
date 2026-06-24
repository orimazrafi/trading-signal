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

const twelveDataBaseURL = "https://api.twelvedata.com/price"
const stockQuoteCachePrefix = "stock:price:"

// Provider resolves latest stock prices using Redis cache and Twelve Data.
type Provider struct {
	redisClient *redis.Client
	apiKey      string
	cacheTTL    time.Duration
	httpClient  *http.Client
}

// NewProvider creates a quote provider.
func NewProvider(redisClient *redis.Client, apiKey string, cacheTTLSeconds int) *Provider {
	return &Provider{
		redisClient: redisClient,
		apiKey:      apiKey,
		cacheTTL:    time.Duration(cacheTTLSeconds) * time.Second,
		httpClient:  &http.Client{Timeout: 8 * time.Second},
	}
}

type twelveDataPriceResponse struct {
	Price   string `json:"price"`
	Code    int    `json:"code"`
	Message string `json:"message"`
	Status  string `json:"status"`
}

// GetPrice returns a live Twelve Data price for alert evaluation.
// Shared Redis quote cache is intentionally not used because stale or mismatched
// entries caused false triggers when the Node server cached older prices.
func (p *Provider) GetPrice(ctx context.Context, symbol string) (float64, error) {
	normalized := strings.ToUpper(strings.TrimSpace(symbol))

	if p.apiKey == "" {
		return 0, fmt.Errorf("TWELVE_DATA_API_KEY not configured")
	}

	price, err := p.fetchPriceFromAPI(ctx, normalized)
	if err != nil {
		return 0, err
	}

	cacheKey := stockQuoteCachePrefix + normalized
	encoded, _ := json.Marshal(map[string]any{
		"symbol":  normalized,
		"price":   price,
		"name":    normalized,
		"peRatio": 0,
		"sector":  "Unknown",
	})
	_ = p.redisClient.Set(ctx, cacheKey, encoded, p.cacheTTL).Err()

	return price, nil
}

// fetchPriceFromAPI loads the latest trade price from Twelve Data.
func (p *Provider) fetchPriceFromAPI(ctx context.Context, symbol string) (float64, error) {
	requestURL := fmt.Sprintf("%s?symbol=%s&apikey=%s", twelveDataBaseURL, symbol, p.apiKey)
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
