# TUTORIAL LARAVEL 8 - BAGIAN 5: AUTHENTICATION

## 🔐 Authentication di Laravel

Laravel menyediakan sistem autentikasi yang lengkap dan mudah digunakan. Pada Laravel 8, sistem autentikasi default menggunakan Laravel UI atau Jetstream.

### 1. Instalasi Laravel UI

```bash
# Instalasi Laravel UI
composer require laravel/ui

# Generate scaffolding autentikasi dengan Bootstrap
php artisan ui bootstrap --auth

# Atau dengan Vue.js
php artisan ui vue --auth

# Atau dengan React
php artisan ui react --auth

# Install dependencies dan compile assets
npm install && npm run dev
```

### 2. Instalasi Jetstream (Alternatif)

```bash
# Instalasi Jetstream
composer require laravel/jetstream

# Instalasi dengan Livewire
php artisan jetstream:install livewire

# Atau dengan Inertia
php artisan jetstream:install inertia

# Install dependencies dan compile assets
npm install && npm run dev

# Jalankan migrasi
php artisan migrate
```

### 3. Struktur Autentikasi

Setelah menginstal Laravel UI atau Jetstream, beberapa file akan dibuat:

- **Controllers**: `App\Http\Controllers\Auth\*`
- **Views**: `resources/views/auth/*`
- **Routes**: Ditambahkan di `routes/web.php`
- **Middleware**: `App\Http\Middleware\Authenticate.php`

### 4. Konfigurasi Autentikasi

Konfigurasi autentikasi berada di file `config/auth.php`:

```php
return [
    'defaults' => [
        'guard' => 'web',
        'passwords' => 'users',
    ],

    'guards' => [
        'web' => [
            'driver' => 'session',
            'provider' => 'users',
        ],
        'api' => [
            'driver' => 'token',
            'provider' => 'users',
            'hash' => false,
        ],
    ],

    'providers' => [
        'users' => [
            'driver' => 'eloquent',
            'model' => App\Models\User::class,
        ],
    ],

    'passwords' => [
        'users' => [
            'provider' => 'users',
            'table' => 'password_resets',
            'expire' => 60,
            'throttle' => 60,
        ],
    ],

    'password_timeout' => 10800,
];
```

## 🛡️ Menggunakan Authentication

### 1. Helpers dan Facades

Laravel menyediakan berbagai helper dan facade untuk autentikasi:

```php
// Mengecek apakah user sudah login
if (Auth::check()) {
    // User sudah login
}

// Alternatif dengan helper
if (auth()->check()) {
    // User sudah login
}

// Mendapatkan user yang sedang login
$user = Auth::user();
$user = auth()->user();

// Mendapatkan ID user yang sedang login
$id = Auth::id();
$id = auth()->id();

// Login manual
Auth::login($user);
auth()->login($user);

// Login dan "remember me"
Auth::login($user, true);

// Logout
Auth::logout();
auth()->logout();
```

### 2. Melindungi Route dengan Middleware

```php
// Melindungi satu route
Route::get('/profile', function () {
    // Hanya user yang sudah login yang bisa akses
})->middleware('auth');

// Melindungi group route
Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', 'DashboardController@index');
    Route::get('/profile', 'ProfileController@index');
});

// Melindungi route di controller
public function __construct()
{
    $this->middleware('auth');
    
    // Atau hanya untuk method tertentu
    $this->middleware('auth')->only(['create', 'store', 'edit', 'update', 'destroy']);
    
    // Atau kecuali method tertentu
    $this->middleware('auth')->except(['index', 'show']);
}
```

## 📝 Contoh Implementasi dari Project

Berikut contoh implementasi autentikasi dari project `coba-laravel-8`:

### 1. Middleware Admin

```php
// app/Http/Middleware/AdminMiddleware.php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        if(Auth::check())
        {
            if(Auth::user()->role_as == '1')
            {
                return $next($request);
            }
            else
            {
                return redirect('/home')->with('status','Access Denied! You are not an Admin');
            }
        }
        else
        {
            return redirect('/home')->with('status','Please Login First');
        }
    }
}
```

### 2. Registrasi Middleware

```php
// app/Http/Kernel.php
protected $routeMiddleware = [
    // ...
    'isAdmin' => \App\Http\Middleware\AdminMiddleware::class,
];
```

### 3. Penggunaan di Route

```php
// routes/web.php
Route::middleware(['auth', 'isAdmin'])->group(function () {
    Route::get('dashboard', 'Admin\AdminController@index');
    
    // Categories
    Route::get('categories','Admin\CategoryController@index');
    Route::get('add-category','Admin\CategoryController@add');
    Route::post('insert-category','Admin\CategoryController@insert');
    // ...
});
```

## 🔍 Langkah Selanjutnya

Pada bagian berikutnya, kita akan membahas tentang:
- Authorization dengan Policies dan Gates
- Email Verification
- Deployment Laravel

---

[⬅️ Kembali ke Bagian 4C](TUTORIAL_LARAVEL_8_BAGIAN4C.md) | [Lanjut ke Bagian 6: Deployment ➡️](TUTORIAL_LARAVEL_8_BAGIAN6.md) 