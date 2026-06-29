# Oracle Cloud deploy ($0)

Deploy **Trading Signal** to an Oracle Always Free ARM VM using GHCR images and Caddy (free TLS).

## Architecture

```
Internet → Caddy :443 → client (nginx) → server :3000
                              ↓
                    postgres, redis, rabbitmq, worker, alerts-runner
```

## 1. Create the VM (Oracle Console)

1. **Compute → Instances → Create instance**
2. **Shape:** Ampere — `VM.Standard.A2.1` (1 OCPU, 6GB) or larger Always Free shape
3. **Image:** Ubuntu 22.04 or 24.04 **aarch64**
4. **Networking:** assign a **public IPv4**
5. **SSH key:** paste your public key
6. Open **Security List / NSG:** allow inbound **22, 80, 443**

Note the **public IP**.

## 2. Free domain (DNS)

Point a free hostname to the VM IP, for example:

- [DuckDNS](https://www.duckdns.org/) → `your-app.duckdns.org`

You need this for HTTPS and Google OAuth.

## 3. Bootstrap the VM

```bash
ssh ubuntu@YOUR_VM_IP
git clone https://github.com/YOUR_USER/trading-signal.git ~/trading-signal
cd ~/trading-signal
bash deploy/oracle-bootstrap.sh
# log out and back in for docker group
```

## 4. Configure env files on the VM

```bash
cd ~/trading-signal
cp deploy/env.deploy.example .env.deploy
cp server/.env.example server/.env
nano .env.deploy   # GHCR_IMAGE_PREFIX, POSTGRES_PASSWORD, SITE_DOMAIN, CLIENT_URL, GOOGLE_CALLBACK_URL
nano server/.env   # JWT_SECRET, FINNHUB_API_KEY, RESEND, Google OAuth, etc.
```

`.env.deploy` example:

```env
GHCR_IMAGE_PREFIX=ghcr.io/your-user/trading-signal
IMAGE_TAG=latest
POSTGRES_PASSWORD=long-random-password
SITE_DOMAIN=your-app.duckdns.org
CLIENT_URL=https://your-app.duckdns.org
GOOGLE_CALLBACK_URL=https://your-app.duckdns.org/api/v1/auth/google/callback
```

## 5. GHCR login on the VM

Create a GitHub **fine-grained PAT** with **read access to packages**.

```bash
echo YOUR_PAT | docker login ghcr.io -u YOUR_GITHUB_USER --password-stdin
```

## 6. First manual deploy (before GitHub Actions)

After the first CI deploy pushes images to GHCR:

```bash
cd ~/trading-signal
docker compose --env-file .env.deploy -f docker-compose.deploy.yml pull
docker compose --env-file .env.deploy -f docker-compose.deploy.yml up -d
curl -fsS "https://your-app.duckdns.org/health"
```

## 7. GitHub Actions auto-deploy

Workflow: `.github/workflows/deploy.yml` — runs after **CI succeeds on `main`**, or manually.

Create a GitHub **environment** named `production` with secrets:

| Secret | Value |
|--------|--------|
| `SSH_HOST` | VM public IP |
| `SSH_USER` | `ubuntu` (or your user) |
| `SSH_PRIVATE_KEY` | private SSH key (PEM) |
| `GHCR_READ_TOKEN` | PAT with `read:packages` |
| `SITE_DOMAIN` | `your-app.duckdns.org` |

Make GHCR packages **visible** to the repo (Settings → Packages → package → Connect repository).

## 8. Google OAuth

In [Google Cloud Console](https://console.cloud.google.com/apis/credentials):

- **Authorized JavaScript origins:** `https://your-app.duckdns.org`
- **Redirect URI:** `https://your-app.duckdns.org/api/v1/auth/google/callback`

## Cost

Oracle Always Free VM + DuckDNS + Let's Encrypt + GHCR + GitHub Actions = **$0/month** within free-tier limits.

## Local production-style (no cloud)

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Use `docker-compose.deploy.yml` only on the VM with GHCR images.
