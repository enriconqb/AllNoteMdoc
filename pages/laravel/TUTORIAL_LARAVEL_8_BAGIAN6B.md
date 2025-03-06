# TUTORIAL LARAVEL 8 - BAGIAN 6B: METODE DEPLOYMENT

## 🌐 Metode Deployment Laravel

Ada beberapa metode untuk men-deploy aplikasi Laravel ke server produksi. Pada bagian ini, kita akan membahas tiga metode umum: shared hosting, VPS, dan deployment dengan Git.

### 1. Deployment ke Shared Hosting

Shared hosting adalah opsi paling ekonomis untuk men-deploy aplikasi Laravel, meskipun memiliki beberapa keterbatasan.

#### Langkah-langkah:

1. **Persiapan Lokal**
   ```bash
   # Optimasi aplikasi
   composer install --optimize-autoloader --no-dev
   php artisan optimize
   ```

2. **Upload File**
   - Upload semua file ke server menggunakan FTP/SFTP
   - Struktur folder di shared hosting biasanya seperti ini:
     ```
     public_html/ (document root)
     laravel/ (folder aplikasi Laravel)
     ```

3. **Konfigurasi Document Root**
   - Pindahkan semua isi folder `public/` ke `public_html/`
   - Edit file `index.php` di `public_html/` untuk menyesuaikan path:
     ```php
     require __DIR__.'/../laravel/vendor/autoload.php';
     $app = require_once __DIR__.'/../laravel/bootstrap/app.php';
     ```

4. **Konfigurasi .htaccess**
   ```apache
   <IfModule mod_rewrite.c>
       RewriteEngine On
       RewriteRule ^(.*)$ public/$1 [L]
   </IfModule>
   ```

5. **Konfigurasi Database**
   - Buat database di panel hosting
   - Update file `.env` dengan kredensial database
   - Jalankan migrasi melalui panel hosting atau SSH (jika tersedia)

### 2. Deployment ke VPS

VPS (Virtual Private Server) memberikan kontrol lebih besar dan fleksibilitas untuk men-deploy aplikasi Laravel.

#### Langkah-langkah:

1. **Persiapan Server**
   ```bash
   # Update package manager
   sudo apt update && sudo apt upgrade -y
   
   # Install dependensi
   sudo apt install -y nginx mysql-server php8.1-fpm php8.1-cli php8.1-mysql php8.1-mbstring php8.1-xml php8.1-zip php8.1-curl
   
   # Install Composer
   curl -sS https://getcomposer.org/installer | php
   sudo mv composer.phar /usr/local/bin/composer
   ```

2. **Konfigurasi Nginx**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       root /var/www/your-app/public;
   
       add_header X-Frame-Options "SAMEORIGIN";
       add_header X-Content-Type-Options "nosniff";
   
       index index.php;
   
       charset utf-8;
   
       location / {
           try_files $uri $uri/ /index.php?$query_string;
       }
   
       location = /favicon.ico { access_log off; log_not_found off; }
       location = /robots.txt  { access_log off; log_not_found off; }
   
       error_page 404 /index.php;
   
       location ~ \.php$ {
           fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
           fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
           include fastcgi_params;
       }
   
       location ~ /\.(?!well-known).* {
           deny all;
       }
   }
   ```

3. **Deploy Aplikasi**
   ```bash
   # Clone repository (jika menggunakan Git)
   git clone https://github.com/username/your-app.git /var/www/your-app
   
   # Atau upload file menggunakan SCP/SFTP
   
   # Masuk ke direktori aplikasi
   cd /var/www/your-app
   
   # Install dependensi
   composer install --optimize-autoloader --no-dev
   
   # Konfigurasi environment
   cp .env.example .env
   php artisan key:generate
   
   # Edit file .env sesuai kebutuhan
   
   # Optimasi aplikasi
   php artisan optimize
   
   # Migrasi database
   php artisan migrate --force
   
   # Atur izin file dan folder
   sudo chown -R www-data:www-data /var/www/your-app
   sudo chmod -R 755 /var/www/your-app
   sudo chmod -R 775 /var/www/your-app/storage /var/www/your-app/bootstrap/cache
   ```

4. **Konfigurasi SSL dengan Let's Encrypt**
   ```bash
   # Install Certbot
   sudo apt install -y certbot python3-certbot-nginx
   
   # Dapatkan sertifikat SSL
   sudo certbot --nginx -d your-domain.com
   ```

### 3. Deployment dengan Git dan CI/CD

Menggunakan Git dan CI/CD (Continuous Integration/Continuous Deployment) adalah cara modern untuk men-deploy aplikasi Laravel.

#### Langkah-langkah:

1. **Persiapan Repository**
   - Pastikan aplikasi Laravel sudah di-push ke repository Git (GitHub, GitLab, Bitbucket)
   - Buat file `.gitignore` yang sesuai:
     ```
     /node_modules
     /public/hot
     /public/storage
     /storage/*.key
     /vendor
     .env
     .env.backup
     .phpunit.result.cache
     Homestead.json
     Homestead.yaml
     npm-debug.log
     yarn-error.log
     ```

2. **Konfigurasi GitHub Actions (contoh CI/CD)**
   Buat file `.github/workflows/deploy.yml`:
   ```yaml
   name: Deploy
   
   on:
     push:
       branches: [ main ]
   
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v2
         
         - name: Setup PHP
           uses: shivammathur/setup-php@v2
           with:
             php-version: '8.1'
             
         - name: Install dependencies
           run: composer install --no-dev --optimize-autoloader
           
         - name: Deploy to server
           uses: appleboy/ssh-action@master
           with:
             host: ${{ secrets.HOST }}
             username: ${{ secrets.USERNAME }}
             key: ${{ secrets.SSH_PRIVATE_KEY }}
             script: |
               cd /var/www/your-app
               git pull origin main
               composer install --no-dev --optimize-autoloader
               php artisan migrate --force
               php artisan optimize
               php artisan config:cache
               php artisan route:cache
               php artisan view:cache
   ```

3. **Konfigurasi Secrets di GitHub**
   - Tambahkan secrets berikut di repository GitHub:
     - `HOST`: IP atau domain server
     - `USERNAME`: Username SSH
     - `SSH_PRIVATE_KEY`: Private key SSH

4. **Konfigurasi Server untuk CI/CD**
   - Pastikan user yang digunakan untuk deployment memiliki izin yang cukup
   - Konfigurasi SSH key untuk akses tanpa password
   - Pastikan folder aplikasi dapat diakses oleh user deployment

## 📝 Tips Deployment

1. **Zero Downtime Deployment**
   - Gunakan tools seperti [Deployer](https://deployer.org/) atau [Envoyer](https://envoyer.io/) untuk zero downtime deployment
   - Implementasikan strategi blue-green deployment

2. **Monitoring**
   - Gunakan tools seperti [Laravel Telescope](https://laravel.com/docs/8.x/telescope) untuk debugging
   - Implementasikan logging dan monitoring dengan [Laravel Horizon](https://laravel.com/docs/8.x/horizon) (jika menggunakan Redis)

3. **Backup**
   - Lakukan backup database secara berkala
   - Gunakan tools seperti [Spatie Backup](https://github.com/spatie/laravel-backup) untuk backup otomatis

4. **Scaling**
   - Gunakan load balancer untuk mendistribusikan traffic
   - Implementasikan caching untuk meningkatkan performa
   - Gunakan CDN untuk asset statis

## 🔍 Kesimpulan

Deployment Laravel dapat dilakukan dengan berbagai metode, tergantung pada kebutuhan dan anggaran Anda. Shared hosting cocok untuk aplikasi kecil dengan budget terbatas, VPS memberikan kontrol lebih besar, dan CI/CD adalah pendekatan modern yang memudahkan proses deployment.

Dengan mengikuti tutorial ini, Anda sekarang memiliki pemahaman dasar tentang cara men-deploy aplikasi Laravel 8 ke berbagai jenis server.

---

[⬅️ Kembali ke Bagian 6A](TUTORIAL_LARAVEL_8_BAGIAN6A.md) | [Kembali ke Awal 🏠](TUTORIAL_LARAVEL_8_BAGIAN1.md) 