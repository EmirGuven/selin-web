# ─────────────────────────────────────────────
# Stage 1 — Builder
# better-sqlite3 native add-on derlenmesi için
# python3 + make + g++ gerekir
# ─────────────────────────────────────────────
FROM node:22-alpine AS builder

# Native build araçları
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Önce sadece bağımlılıkları kopyala (cache için)
COPY package*.json ./
RUN npm ci

# Kaynak kodun tamamını kopyala
COPY . .

# Nuxt production build
RUN npm run build


# ─────────────────────────────────────────────
# Stage 2 — Runner (minimal imaj)
# ─────────────────────────────────────────────
FROM node:22-alpine AS runner

# Çalışma zamanında da native .node dosyası yüklenir
RUN apk add --no-cache libstdc++

WORKDIR /app

# Build çıktısını kopyala
COPY --from=builder /app/.output ./.output

# node_modules içinden sadece better-sqlite3 native add-on'unu taşı
# (Nuxt .output/server/node_modules altında bundlar, ama better-sqlite3
#  externals listesinde olduğu için ayrıca kopyalanması gerekir)
COPY --from=builder /app/node_modules/better-sqlite3 ./node_modules/better-sqlite3
COPY --from=builder /app/node_modules/bindings       ./node_modules/bindings
COPY --from=builder /app/node_modules/file-uri-to-path ./node_modules/file-uri-to-path

# Kalıcı veri dizinleri (volume mount noktaları)
RUN mkdir -p /app/data-db /app/public/uploads

# Uygulama portu
EXPOSE 3000

# Ortam değişkenleri (docker-compose veya -e ile override edilir)
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

CMD ["node", ".output/server/index.mjs"]
