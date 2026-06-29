#!/usr/bin/env bash
# One-time bootstrap for Oracle Cloud Always Free (Ubuntu 22.04/24.04 ARM).
# Run on the VM as a user with sudo: bash deploy/oracle-bootstrap.sh
set -euo pipefail

echo "==> Installing Docker..."
sudo apt-get update
sudo apt-get install -y ca-certificates curl git ufw
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "${VERSION_CODENAME}") stable" |
  sudo tee /etc/apt/sources.list.d/docker.list >/dev/null

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo usermod -aG docker "$USER"

echo "==> Firewall (SSH + HTTP/S only)..."
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

APP_DIR="${HOME}/trading-signal"
mkdir -p "$APP_DIR"

echo "==> Next steps (manual):"
echo "  1. Log out and back in so docker group applies."
echo "  2. Clone this repo to ${APP_DIR} (or copy deploy files + compose only)."
echo "  3. cp deploy/env.deploy.example ${APP_DIR}/.env.deploy && edit values"
echo "  4. cp server/.env.example ${APP_DIR}/server/.env && add API keys"
echo "  5. docker login ghcr.io"
echo "  6. docker compose --env-file .env.deploy -f docker-compose.deploy.yml pull"
echo "  7. docker compose --env-file .env.deploy -f docker-compose.deploy.yml up -d"
echo ""
echo "Point SITE_DOMAIN (free DuckDNS/no-ip) to this VM public IP before step 7."
