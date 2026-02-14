# syntax=docker/dockerfile:1

# ==========================================
# BUILDER STAGE
# ==========================================
FROM oven/bun:1-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
ENV NODE_ENV=production
RUN bun run build

# ==========================================
# RUNNER STAGE
# ==========================================
FROM oven/bun:1-slim AS runner

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN groupadd -r appgroup && useradd -r -g appgroup appuser

# Copy built app and source (needed for migrations)
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package.json ./
COPY --from=builder /app/bun.lock ./
COPY --from=builder /app/src/db ./src/db
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/node_modules ./node_modules

# Create data directory
RUN mkdir -p /app/data && chown -R appuser:appgroup /app

USER appuser

EXPOSE 3000

CMD ["bun", ".output/server/index.mjs"]
