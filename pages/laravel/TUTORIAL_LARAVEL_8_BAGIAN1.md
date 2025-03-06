# TUTORIAL LARAVEL 8 - BAGIAN 1: PERSIAPAN DAN INSTALASI

## 📋 Prasyarat

Sebelum memulai, pastikan sistem Anda memiliki:

- **PHP** versi 8.1 (disarankan)
- **Composer** (versi terbaru)
- **Web Server** (Apache/Nginx)
- **Database** (MySQL/MariaDB)
- **Git** (opsional, untuk version control)

## 🚀 Instalasi Laravel 8

### 1. Membuat Project Baru

Buka terminal/command prompt dan jalankan perintah:

```bash
composer create-project laravel/laravel:^8.* nama-project
```

> 💡 **Tips**: Ganti "nama-project" dengan nama folder project yang diinginkan.

### 2. Masuk ke Direktori Project

```bash
cd nama-project
```

### 3. Konfigurasi Database

Buka file `.env` dan sesuaikan konfigurasi database:

```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=nama_database
DB_USERNAME=root
DB_PASSWORD=
```

### 4. Menjalankan Server Development

```bash
php artisan serve
```

Setelah menjalankan perintah di atas, aplikasi Laravel dapat diakses melalui browser di alamat: `http://localhost:8000`

## ⚙️ Struktur Folder Utama

- **app/** - Berisi kode utama aplikasi (controllers, models, dll)
- **config/** - Berisi file konfigurasi aplikasi
- **database/** - Berisi migrasi dan seeder database
- **public/** - Document root untuk web server
- **resources/** - Berisi view, file CSS/JS mentah, dan asset lainnya
- **routes/** - Berisi definisi route aplikasi
- **storage/** - Berisi file yang dihasilkan aplikasi (logs, cache, dll)

## 🔄 Perintah Artisan Dasar

```bash
# Melihat daftar perintah artisan
php artisan list

# Membuat controller
php artisan make:controller NamaController

# Membuat model
php artisan make:model NamaModel

# Membuat migration
php artisan make:migration create_nama_table

# Menjalankan migration
php artisan migrate

# Membuat controller, model, dan migration sekaligus
php artisan make:model NamaModel -mcr
```

## 🔍 Langkah Selanjutnya

Pada bagian berikutnya, kita akan membahas tentang:
- Membuat dan mengelola route
- Membuat controller dan model
- Implementasi CRUD dasar

---

[Lanjut ke Bagian 2: Route dan Controller ➡️](TUTORIAL_LARAVEL_8_BAGIAN2.md) 