# ==========================================
# Multi-Stage Production Dockerfile for EIMS
# ==========================================

# Stage 1: Build Frontend Assets
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package.json package-lock.json ./

# Install all dependencies including devDependencies for Vite compilation
RUN npm ci

# Copy application source code
COPY . .

# Compile optimized production bundle
RUN npm run build

# Stage 2: Production Server Runtime
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install production dependencies only
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy backend server code and compiled frontend dist
COPY server/ ./server/
COPY --from=builder /app/dist ./dist
COPY ecosystem.config.cjs ./

EXPOSE 5000

USER node

CMD ["node", "server/server.js"]
