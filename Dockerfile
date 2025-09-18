# --- deps stage ---
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# --- build stage (опционально для TS) ---
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Собираем только если есть tsconfig.json
RUN if [ -f tsconfig.json ]; then npm run build; fi

# --- runner ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
ENV HOST=0.0.0.0

# JS-исходники на случай чистого JS
COPY . .
# Пересобранные артефакты TS перекрывают исходники (если есть)
COPY --from=builder /app/dist ./dist
COPY --from=deps /app/node_modules ./node_modules

EXPOSE 8080

# Если есть dist/server.js — запускаем его, иначе server.js
CMD ["sh", "-c", "if [ -f dist/server.js ]; then node dist/server.js; else node server.js; fi"]