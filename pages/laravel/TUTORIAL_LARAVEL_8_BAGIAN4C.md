# TUTORIAL LARAVEL 8 - BAGIAN 4C: COMPONENT, ASSET, DAN SESSION

## 🧩 Component dan Slot di Blade

Blade Components adalah fitur yang memungkinkan Anda membuat komponen yang dapat digunakan kembali di seluruh aplikasi.

### 1. Membuat Component

```bash
# Membuat component class
php artisan make:component Alert

# Membuat component tanpa class (hanya view)
php artisan make:component Alert --inline
```

Perintah di atas akan membuat:
- File class di `app/View/Components/Alert.php`
- File view di `resources/views/components/alert.blade.php`

### 2. Struktur Component Class

```php
<?php

namespace App\View\Components;

use Illuminate\View\Component;

class Alert extends Component
{
    public $type;
    public $message;

    public function __construct($type = 'info', $message = null)
    {
        $this->type = $type;
        $this->message = $message;
    }

    public function render()
    {
        return view('components.alert');
    }
}
```

### 3. Template Component

```html
<!-- resources/views/components/alert.blade.php -->
<div class="alert alert-{{ $type }}">
    @if($message)
        {{ $message }}
    @else
        {{ $slot }}
    @endif
</div>
```

### 4. Menggunakan Component

```html
<!-- Menggunakan component dengan attribute -->
<x-alert type="danger" message="Terjadi kesalahan!" />

<!-- Menggunakan component dengan slot -->
<x-alert type="success">
    Operasi berhasil dilakukan!
</x-alert>

<!-- Menggunakan component dengan named slots -->
<x-card>
    <x-slot name="title">Judul Card</x-slot>
    <p>Isi card...</p>
    <x-slot name="footer">Footer Card</x-slot>
</x-card>
```

## 📁 Upload File dan Pengelolaan Asset

### 1. Upload File

```php
public function store(Request $request)
{
    $request->validate([
        'name' => 'required|string|max:255',
        'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
    ]);

    if ($request->hasFile('image')) {
        // Mendapatkan file
        $file = $request->file('image');
        
        // Mendapatkan ekstensi file
        $extension = $file->getClientOriginalExtension();
        
        // Membuat nama file unik
        $filename = time() . '.' . $extension;
        
        // Menyimpan file ke folder public
        $file->move('assets/uploads/category', $filename);
        
        // Menyimpan nama file ke database
        $category = new Category();
        $category->name = $request->name;
        $category->image = $filename;
        $category->save();
        
        return redirect()->back()->with('success', 'File berhasil diupload');
    }
}
```

### 2. Menampilkan Gambar

```html
<img src="{{ asset('assets/uploads/category/' . $category->image) }}" alt="{{ $category->name }}">
```

### 3. Menghapus File

```php
public function destroy($id)
{
    $category = Category::find($id);
    
    // Hapus file dari storage
    if ($category->image) {
        $path = 'assets/uploads/category/' . $category->image;
        if (file_exists($path)) {
            unlink($path);
        }
    }
    
    // Hapus data dari database
    $category->delete();
    
    return redirect()->back()->with('success', 'Kategori berhasil dihapus');
}
```

### 4. Asset Management

Laravel menyediakan helper untuk mengelola asset:

```html
<!-- CSS -->
<link rel="stylesheet" href="{{ asset('css/app.css') }}">

<!-- JavaScript -->
<script src="{{ asset('js/app.js') }}"></script>

<!-- Gambar -->
<img src="{{ asset('images/logo.png') }}" alt="Logo">
```

## 💾 Session dan Flash Message

### 1. Menyimpan Data ke Session

```php
// Menyimpan data ke session
$request->session()->put('key', 'value');

// Alternatif
session(['key' => 'value']);

// Menyimpan data ke session untuk request berikutnya saja (flash)
$request->session()->flash('status', 'Task was successful!');

// Alternatif dengan helper
session()->flash('status', 'Task was successful!');

// Flash dengan redirect
return redirect('/dashboard')->with('status', 'Profile updated!');
```

### 2. Mengambil Data dari Session

```php
// Mengambil data dari session
$value = $request->session()->get('key');

// Dengan nilai default
$value = $request->session()->get('key', 'default');

// Alternatif dengan helper
$value = session('key');
$value = session('key', 'default');

// Mengambil semua data session
$data = $request->session()->all();
```

### 3. Menampilkan Flash Message

```html
<!-- Menampilkan flash message -->
@if (session('status'))
    <div class="alert alert-success">
        {{ session('status') }}
    </div>
@endif
```

### 4. Menghapus Data Session

```php
// Menghapus satu item
$request->session()->forget('key');

// Menghapus beberapa item
$request->session()->forget(['key1', 'key2']);

// Menghapus semua data session
$request->session()->flush();
```

## 📝 Contoh Implementasi dari Project

Berikut contoh implementasi dari project `coba-laravel-8`:

### 1. Layout Admin dengan Include

```html
<!-- resources/views/layouts/admin.blade.php -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>E-Shop</title>
    
    <link href="{{ asset('admin/css/material-dashboard.css') }}" rel="stylesheet">
    <link href="{{ asset('admin/css/custom.css') }}" rel="stylesheet">
</head>
<body>
    <div class="wrapper">
        @include('layouts.inc.sidebar')
        
        <div class="content">
            @yield('content')
        </div>
        
        @include('layouts.inc.footer')
    </div>
    
    <script src="{{ asset('admin/js/jquery.min.js') }}"></script>
    <script src="{{ asset('admin/js/bootstrap.min.js') }}"></script>
    <script src="{{ asset('admin/js/material-dashboard.js') }}"></script>
</body>
</html>
```

### 2. Menampilkan Flash Message

```html
<!-- resources/views/layouts/inc/flash-message.blade.php -->
@if(session('status'))
    <div class="alert alert-success">
        {{ session('status') }}
    </div>
@endif
```

```html
<!-- Dalam view lain -->
@extends('layouts.admin')

@section('content')
    <div class="card">
        <div class="card-header">
            <h4>Categories</h4>
        </div>
        <div class="card-body">
            @include('layouts.inc.flash-message')
            
            <!-- Konten lainnya -->
        </div>
    </div>
@endsection
```

## 🔍 Langkah Selanjutnya

Pada bagian berikutnya, kita akan membahas tentang:
- Authentication dan Authorization
- Middleware
- Deployment

---

[⬅️ Kembali ke Bagian 4B](TUTORIAL_LARAVEL_8_BAGIAN4B.md) | [Lanjut ke Bagian 5: Authentication dan Authorization ➡️](TUTORIAL_LARAVEL_8_BAGIAN5.md) 