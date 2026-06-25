// Package devhttp exposes development-only HTTP endpoints for manual alert checks.
package devhttp

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/trading-signal/alerts-runner/internal/runner"
)

const runOncePath = "/run-once"

// Server exposes a development-only HTTP trigger for manual alert checks.
type Server struct {
	runner *runner.Runner
	port   int
}

// New creates a development HTTP server bound to the given port.
func New(alertRunner *runner.Runner, port int) *Server {
	return &Server{
		runner: alertRunner,
		port:   port,
	}
}

// Start serves POST /run-once until the context is cancelled, then shuts down gracefully.
func (s *Server) Start(ctx context.Context) {
	mux := http.NewServeMux()
	mux.HandleFunc(runOncePath, s.handleRunOnce)

	server := &http.Server{
		Addr:              ":" + strconv.Itoa(s.port),
		Handler:           mux,
		ReadHeaderTimeout: 5 * time.Second,
	}

	go func() {
		<-ctx.Done()
		shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		if err := server.Shutdown(shutdownCtx); err != nil {
			log.Printf("dev http shutdown failed: %v", err)
		}
	}()

	log.Printf("alerts runner dev http listening on %s", server.Addr)

	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Printf("dev http server failed: %v", err)
	}
}

// handleRunOnce triggers one immediate alert evaluation pass (dev only).
func (s *Server) handleRunOnce(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	log.Println("manual alert check triggered")
	s.runner.RunOnce(r.Context())
	log.Println("manual alert check finished")

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(map[string]bool{"ok": true}); err != nil {
		log.Printf("failed to write dev http response: %v", err)
	}
}
