# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim AS base

WORKDIR /app

COPY package.json package-lock.json* ./
COPY packages/contracts/package.json packages/contracts/tsconfig.json ./packages/contracts/
COPY packages/contracts/src ./packages/contracts/src
COPY client/package.json client/package-lock.json* ./client/

RUN --mount=type=cache,target=/root/.npm \
    npm ci --ignore-scripts

RUN npm run build:contracts

ARG TARGETARCH
RUN if [ "$TARGETARCH" = "arm64" ]; then \
      npm install @tailwindcss/oxide-linux-arm64-gnu -w client; \
    else \
      npm install @tailwindcss/oxide-linux-x64-gnu -w client; \
    fi

WORKDIR /app/client

FROM base AS builder

COPY client/ ./
RUN npm run build

FROM base AS dev

COPY client/index.html client/vite.config.ts client/pwa.manifest.ts client/tsconfig.json client/tsconfig.app.json client/tsconfig.node.json ./
COPY client/public ./public

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

FROM nginx:alpine AS production

COPY client/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/client/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
