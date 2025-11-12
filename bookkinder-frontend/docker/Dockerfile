FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Copy dependency files first (para cache de layers)
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN npm install -g pnpm \
    && pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the app
RUN pnpm run build

# ----------------------------
# Stage de producción
# ----------------------------
FROM node:22-alpine

WORKDIR /app

# Copiar solo la build y package.json necesarios
COPY --from=builder /app/.output .output
COPY --from=builder /app/package.json ./

# Expose port
EXPOSE 3000

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Start app
CMD ["node", ".output/server/index.mjs"]
