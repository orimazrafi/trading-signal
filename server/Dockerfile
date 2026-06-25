# syntax=docker/dockerfile:1

FROM node:22-alpine AS base

WORKDIR /app

COPY package.json package-lock.json* ./
COPY packages/contracts/package.json packages/contracts/tsconfig.json ./packages/contracts/
COPY packages/contracts/src ./packages/contracts/src
COPY server/package.json server/package-lock.json* ./server/
COPY server/prisma ./server/prisma

RUN --mount=type=cache,target=/root/.npm \
    npm ci

WORKDIR /app/server

FROM base AS builder

COPY server/prisma ./prisma
COPY server/tsconfig.json ./
COPY server/src ./src
RUN npm run build

FROM base AS dev

COPY server/prisma ./prisma
COPY server/tsconfig.json ./
COPY server/src ./src

EXPOSE 3000

CMD ["npm", "run", "dev"]

FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY package.json package-lock.json* ./
COPY packages/contracts ./packages/contracts
COPY server/package.json server/package-lock.json* ./server/
COPY server/prisma ./server/prisma

RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev --ignore-scripts

WORKDIR /app/server

COPY server/docker-entrypoint.sh ./
RUN sed -i 's/\r$//' docker-entrypoint.sh && chmod +x docker-entrypoint.sh
COPY --from=builder /app/server/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/server/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/server/dist ./dist
COPY --from=builder /app/packages/contracts/dist /app/packages/contracts/dist

EXPOSE 3000

ENTRYPOINT ["sh", "./docker-entrypoint.sh"]
CMD ["node", "dist/server.js"]
