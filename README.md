# selin-web — Klinik Psikolog Selin Asya Bağcı

Bu proje Nuxt tabanli, SSR acik ve SEO modulleri hazir bir Klinik Psikolog web sitesi iskeletidir.

## Ozellikler

- Nuxt SSR ile sunucu tarafinda render
- `@nuxtjs/seo` ile `robots.txt`, `sitemap.xml`, canonical ve teknik SEO altyapisi
- Sayfa bazli `useSeoMeta()` kullanimi
- JSON-LD schema icin `useSchemaOrg()`
- Mobil uyumlu Vue bilesenleri

## Kurulum

Bagimliliklari kurun:

```bash
npm install
```

Gelistirme sunucusunu baslatin:

```bash
npm run dev
```

Uretim onizleme:

```bash
npm run build
npm run preview
```

## Production Persistence & Backup

Bu projede kalici depolama modeli olarak bind mount kullanilir.

- DB container yolu: `/app/data-db` (SQLite dosyasi: `/app/data-db/app.db`)
- Uploads container yolu: `/app/public/uploads`
- Host DB klasoru: `/data/selin-web/db`
- Host uploads klasoru: `/data/selin-web/uploads`

`docker-compose.yml` icinde bu klasorler asagidaki gibi baglanir:

```yaml
volumes:
	- ${APP_DATA_DIR:-/data/selin-web/db}:/app/data-db
	- ${APP_UPLOADS_DIR:-/data/selin-web/uploads}:/app/public/uploads
```

### Sunucu ilk kurulum

1. Proxy network yoksa olusturun:

```bash
docker network create proxy
```

2. Kalici host klasorlerini olusturun:

```bash
mkdir -p /data/selin-web/db
mkdir -p /data/selin-web/uploads
```

3. Klasor sahiplik/izin ayari yapin (ortama gore root veya docker kullanicisi):

```bash
chown -R 1000:1000 /data/selin-web
chmod -R 775 /data/selin-web
```

4. `.env` dosyasini hazirlayin (`docker-compose.yml` ile ayni dizinde):

```env
JWT_SECRET=<uzun-ve-guclu-bir-deger>
NUXT_PUBLIC_SITE_URL=https://klinikpsikologselinasyabagci.com
APP_DATA_DIR=/data/selin-web/db
APP_UPLOADS_DIR=/data/selin-web/uploads
```

### Deploy / Upgrade runbook

1. Yeni surumu build ederek ayaga kaldirin:

```bash
docker compose up -d --build
```

2. Saglik kontrolu:

```bash
docker compose ps
curl -f http://127.0.0.1:3000/api/health
```

3. Traefik + HTTPS dogrulamasi:

```bash
curl -I https://klinikpsikologselinasyabagci.com
curl -I https://www.klinikpsikologselinasyabagci.com
```

4. Kalicilik smoke testi (recreate sonrasi):

- Admin panelden test bir kayit olusturun (ornek not/randevu)
- Bir gorsel yukleyin
- `docker compose down` ve sonra `docker compose up -d`
- Kayit ve gorselin korundugunu dogrulayin

Sunucu tarafinda veri kaybini onlemek icin kritik kurallar:

- Uygulamayi guncellerken `docker compose down -v` kullanmayin (`-v` volume verisini siler).
- `.env` icindeki `APP_DATA_DIR` ve `APP_UPLOADS_DIR` degerleri sabit kalmali, her deployda degismemeli.
- Host klasorleri deploy oncesi var olmali. Compose dosyasi `create_host_path: false` ile calistigi icin klasor yoksa bilerek hata verir.
- Onerilen kalici sunucu yollari:
	- `/data/selin-web/db`
	- `/data/selin-web/uploads`

### Backup plani

Gunluk yedek hedefi:

- SQLite DB: `/data/selin-web/db/app.db`
- Uploads: `/data/selin-web/uploads`

Ornek yedek scripti:

```bash
#!/usr/bin/env bash
set -euo pipefail

TS="$(date +%Y%m%d-%H%M%S)"
BACKUP_ROOT="/data/backups/selin-web"
DB_SRC="/data/selin-web/db/app.db"
UPLOADS_SRC="/data/selin-web/uploads"

mkdir -p "$BACKUP_ROOT"
cp "$DB_SRC" "$BACKUP_ROOT/app-$TS.db"
tar -czf "$BACKUP_ROOT/uploads-$TS.tar.gz" -C "$UPLOADS_SRC" .

# 14 gunden eski yedekleri temizle
find "$BACKUP_ROOT" -type f -mtime +14 -delete
```

Cron ornegi (her gun 03:30):

```bash
30 3 * * * /usr/local/bin/selin-web-backup.sh >> /var/log/selin-web-backup.log 2>&1
```

### Restore ve rollback

1. Uygulamayi durdurun:

```bash
docker compose down
```

2. DB ve uploads geri yukleyin:

```bash
cp /data/backups/selin-web/app-YYYYMMDD-HHMMSS.db /data/selin-web/db/app.db
rm -rf /data/selin-web/uploads/*
tar -xzf /data/backups/selin-web/uploads-YYYYMMDD-HHMMSS.tar.gz -C /data/selin-web/uploads
```

3. Servisi tekrar baslatin ve health kontrolu yapin:

```bash
docker compose up -d
curl -f http://127.0.0.1:3000/api/health
```

### Final checklist

- `docker compose config` hatasiz calisiyor
- `docker compose ps` durumlari saglikli
- API health endpoint `200` donuyor
- Upload testi basarili
- Container recreate sonrasi veri korunuyor
- Yedekten test restore basarili

## Ozellestirme

- Isletme ve iletisim bilgilerini `data/site.ts` dosyasindan degistirin.
- Gercek domaininizi `.env` veya `NUXT_PUBLIC_SITE_URL` ile verin.
- Sayfa metinlerini `pages/` klasorunde duzenleyin.
- Tasarimi `assets/css/main.css` uzerinden gelistirin.
