# TUTORIAL LARAVEL 8 - BAGIAN 4A: VIEW DAN BLADE TEMPLATE

## 🖼️ View di Laravel

View adalah bagian dari arsitektur MVC yang bertanggung jawab untuk menampilkan data kepada pengguna. Laravel menggunakan Blade sebagai template engine.

### 1. Lokasi File View

Semua file view Laravel disimpan di direktori `resources/views`. File view memiliki ekstensi `.blade.php`.

### 2. Struktur Folder View

Untuk project yang terorganisir, sebaiknya view dikelompokkan dalam folder:

```
resources/views/
├── admin/
│   ├── dashboard.blade.php
│   ├── category/
│   │   ├── index.blade.php
│   │   ├── add.blade.php
│   │   └── edit.blade.php
│   └── product/
│       ├── index.blade.php
│       └── ...
├── layouts/
│   ├── admin.blade.php
│   ├── app.blade.php
│   └── inc/
│       ├── sidebar.blade.php
│       └── footer.blade.php
└── frontend/
    ├── index.blade.php
    └── ...
```

### 3. Menampilkan View dari Controller

```php
// Menampilkan view sederhana
return view('welcome');

// Menampilkan view dengan data
return view('users.index', ['users' => $users]);

// Alternatif dengan compact()
$users = User::all();
return view('users.index', compact('users'));

// Mengirim beberapa variabel
$users = User::all();
$roles = Role::all();
return view('users.index', compact('users', 'roles'));
```

## 🔪 Blade Template Engine

Blade adalah template engine yang kuat dan intuitif yang disediakan oleh Laravel.

### 1. Sintaks Dasar Blade

```php
{{-- Ini adalah komentar Blade --}}

{{-- Menampilkan variabel --}}
<h1>{{ $title }}</h1>

{{-- Menampilkan variabel tanpa escape HTML --}}
{!! $htmlContent !!}

{{-- Menampilkan variabel dengan default value --}}
{{ $name ?? 'Default Name' }}
```

### 2. Struktur Kontrol

```php
{{-- Kondisional --}}
@if($user->isAdmin)
    <p>Admin User</p>
@elseif($user->isEditor)
    <p>Editor User</p>
@else
    <p>Regular User</p>
@endif

{{-- Unless (kebalikan dari if) --}}
@unless($user->isAdmin)
    <p>Bukan Admin</p>
@endunless

{{-- Perulangan --}}
@foreach($users as $user)
    <p>{{ $user->name }}</p>
@endforeach

@for($i = 0; $i < 10; $i++)
    <p>Iterasi ke-{{ $i }}</p>
@endfor

@while($condition)
    <p>While loop</p>
@endwhile

{{-- Perulangan dengan empty check --}}
@forelse($users as $user)
    <p>{{ $user->name }}</p>
@empty
    <p>Tidak ada user</p>
@endforelse
```

### 3. Layout dengan Blade

Blade memungkinkan Anda membuat layout yang dapat digunakan kembali:

```php
{{-- layouts/app.blade.php --}}
<!DOCTYPE html>
<html>
<head>
    <title>@yield('title', 'Default Title')</title>
    <link rel="stylesheet" href="{{ asset('css/app.css') }}">
    @yield('styles')
</head>
<body>
    <header>
        @include('layouts.inc.header')
    </header>
    
    <div class="container">
        @yield('content')
    </div>
    
    <footer>
        @include('layouts.inc.footer')
    </footer>
    
    <script src="{{ asset('js/app.js') }}"></script>
    @yield('scripts')
</body>
</html>
```

```php
{{-- pages/home.blade.php --}}
@extends('layouts.app')

@section('title', 'Home Page')

@section('content')
    <h1>Welcome to our website!</h1>
    <p>This is the home page content.</p>
@endsection

@section('scripts')
    <script>
        console.log('Home page loaded');
    </script>
@endsection
```

## 🔍 Langkah Selanjutnya

Pada bagian berikutnya (4B), kita akan membahas lebih lanjut tentang:
- Component dan Slot di Blade
- Form dan Validasi
- Upload File

---

[⬅️ Kembali ke Bagian 3](TUTORIAL_LARAVEL_8_BAGIAN3.md) | [Lanjut ke Bagian 4B: Form dan Validasi ➡️](TUTORIAL_LARAVEL_8_BAGIAN4B.md) 