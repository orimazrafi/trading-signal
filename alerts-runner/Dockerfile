FROM golang:1.22-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /alerts-runner .

FROM alpine:3.20

RUN apk add --no-cache tzdata

WORKDIR /app

COPY --from=builder /alerts-runner /app/alerts-runner

CMD ["/app/alerts-runner"]
