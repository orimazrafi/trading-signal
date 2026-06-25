package runner

import "testing"

func TestCalculateChangePercent(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name          string
		baselinePrice float64
		currentPrice  float64
		want          float64
	}{
		{name: "zero baseline", baselinePrice: 0, currentPrice: 100, want: 0},
		{name: "ten percent gain", baselinePrice: 100, currentPrice: 110, want: 10},
		{name: "ten percent loss", baselinePrice: 100, currentPrice: 90, want: -10},
	}

	for _, testCase := range tests {
		t.Run(testCase.name, func(t *testing.T) {
			t.Parallel()
			got := calculateChangePercent(testCase.baselinePrice, testCase.currentPrice)
			if got != testCase.want {
				t.Fatalf("calculateChangePercent() = %v, want %v", got, testCase.want)
			}
		})
	}
}
