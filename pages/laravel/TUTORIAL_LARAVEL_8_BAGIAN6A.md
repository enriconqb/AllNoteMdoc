# TUTORIAL LARAVEL 8 - BAGIAN 6A: PERSIAPAN DEPLOYMENT

## 🚀 Persiapan Deployment Laravel

Sebelum men-deploy aplikasi Laravel ke server produksi, ada beberapa persiapan yang perlu dilakukan untuk memastikan aplikasi berjalan dengan optimal dan aman.

### 1. Optimasi Aplikasi

Laravel menyediakan beberapa perintah artisan untuk mengoptimasi aplikasi:

```bash
# Mengoptimasi autoloader Composer
composer install --optimize-autoloader --no-dev

# Mengoptimasi konfigurasi
php artisan config:cache

# Mengoptimasi route
php artisan route:cache

# Mengoptimasi view
php artisan view:cache

# Mengoptimasi semua sekaligus
php artisan optimize
```

> ⚠️ **Perhatian**: Jangan menggunakan `config:cache` dan `route:cache` saat development, karena perubahan pada file konfigurasi dan route tidak akan terdeteksi.

### 2. Konfigurasi Environment

Pastikan file `.env` di server produksi sudah dikonfigurasi dengan benar:

```
APP_NAME=Laravel
APP_ENV=production
APP_KEY=base64:your-app-key
APP_DEBUG=false
APP_URL=https://your-domain.com

LOG_CHANNEL=stack
LOG_LEVEL=error

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_database
DB_USERNAME=your_username
DB_PASSWORD=your_password

BROADCAST_DRIVER=log
CACHE_DRIVER=file
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120

MEMCACHED_HOST=127.0.0.1

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=smtp
MAIL_HOST=mailhog
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS=null
MAIL_FROM_NAME="${APP_NAME}"
```

Poin penting untuk diperhatikan:
- `APP_ENV=production` - Mengatur aplikasi dalam mode produksi
- `APP_DEBUG=false` - Menonaktifkan debug mode untuk keamanan
- `APP_URL` - URL lengkap aplikasi Anda

### 3. Keamanan

Beberapa langkah keamanan yang perlu diperhatikan:

1. **Generate App Key**
   ```bash
   php artisan key:generate
   ```

2. **Atur Izin File dan Folder**
   ```bash
   # Folder storage dan bootstrap/cache harus writable oleh web server
   chmod -R 775 storage bootstrap/cache
   
   # Pastikan file .env tidak dapat diakses publik
   chmod 600 .env
   ```

3. **Lindungi Folder Sensitif**
   Pastikan folder berikut tidak dapat diakses langsung dari web:
   - `.git`
   - `vendor`
   - `node_modules`
   - `storage`
   - `tests`

4. **Gunakan HTTPS**
   Selalu gunakan HTTPS di lingkungan produksi untuk mengenkripsi data yang dikirim antara server dan client.

### 4. Struktur Folder Server

Struktur folder yang direkomendasikan di server:

```
/var/www/your-app/
├── current/ (symlink ke rilis terbaru)
├── releases/
│   ├── 20230101120000/
│   ├── 20230201120000/
│   └── 20230301120000/ (rilis terbaru)
└── storage/ (shared storage)
    ├── app/
    ├── framework/
    └── logs/
```

Dengan struktur ini, Anda dapat dengan mudah melakukan rollback ke versi sebelumnya jika terjadi masalah.

### 5. Checklist Deployment

Berikut adalah checklist yang perlu diperhatikan sebelum deployment:

- [ ] Semua dependensi sudah diinstal (`composer install --no-dev`)
- [ ] File `.env` sudah dikonfigurasi dengan benar
- [ ] Database sudah dimigrasi (`php artisan migrate`)
- [ ] Aplikasi sudah dioptimasi (`php artisan optimize`)
- [ ] Izin file dan folder sudah diatur dengan benar
- [ ] HTTPS sudah dikonfigurasi
- [ ] Cron job untuk `php artisan schedule:run` sudah diatur (jika diperlukan)
- [ ] Queue worker sudah diatur (jika menggunakan queue)

## 🔍 Langkah Selanjutnya

Pada bagian berikutnya (6B), kita akan membahas tentang:
- Deployment ke shared hosting
- Deployment ke VPS
- Deployment dengan Git dan CI/CD

---

[⬅️ Kembali ke Bagian 5](TUTORIAL_LARAVEL_8_BAGIAN5_AUTH.md) | [Lanjut ke Bagian 6B: Metode Deployment ➡️](TUTORIAL_LARAVEL_8_BAGIAN6B.md) 