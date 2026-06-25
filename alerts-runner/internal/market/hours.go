// Package market provides US equity trading-hours helpers for scheduled alert checks.
package market

import "time"

var easternLocation = mustLoadLocation("America/New_York")

// mustLoadLocation loads a named IANA timezone or panics at process start.
func mustLoadLocation(name string) *time.Location {
	location, err := time.LoadLocation(name)
	if err != nil {
		panic(err)
	}
	return location
}

// IsUSMarketOpen returns true during regular US equity trading hours (Mon–Fri, 9:30–16:00 ET).
// Exchange holidays and early closes are not modeled; alerts may still run on closed market days.
func IsUSMarketOpen(now time.Time) bool {
	local := now.In(easternLocation)

	switch local.Weekday() {
	case time.Saturday, time.Sunday:
		return false
	default:
		minutes := local.Hour()*60 + local.Minute()
		openMinutes := 9*60 + 30
		closeMinutes := 16 * 60
		return minutes >= openMinutes && minutes < closeMinutes
	}
}
