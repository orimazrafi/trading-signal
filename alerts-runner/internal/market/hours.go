package market

import "time"

var easternLocation = mustLoadLocation("America/New_York")

func mustLoadLocation(name string) *time.Location {
	location, err := time.LoadLocation(name)
	if err != nil {
		panic(err)
	}
	return location
}

// IsUSMarketOpen returns true during regular US equity trading hours.
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
