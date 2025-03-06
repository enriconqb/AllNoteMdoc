# TUTORIAL LARAVEL 8 - BAGIAN 2: ROUTE DAN CONTROLLER

## 🛣️ Memahami Route di Laravel

Route adalah cara untuk menentukan bagaimana aplikasi merespons permintaan ke URL tertentu. Semua route Laravel didefinisikan di folder `routes/`.

### 1. File Route Utama

- **web.php** - Route untuk web dengan session, CSRF protection, dll.
- **api.php** - Route untuk API (tanpa session)
- **console.php** - Route untuk perintah console
- **channels.php** - Route untuk broadcasting

### 2. Membuat Route Dasar

Buka file `routes/web.php` dan tambahkan route:

```php
// Route dasar yang mengembalikan view
Route::get('/', function () {
    return view('welcome');
});

// Route dengan parameter
Route::get('/user/{id}', function ($id) {
    return 'User ID: ' . $id;
});

// Route yang mengarah ke controller
Route::get('/posts', [PostController::class, 'index']);
```

### 3. Route Group dan Middleware

```php
// Route group dengan prefix
Route::prefix('admin')->group(function () {
    Route::get('/dashboard', [AdminController::class, 'dashboard']);
    Route::get('/users', [AdminController::class, 'users']);
});

// Route dengan middleware auth
Route::middleware(['auth'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'index']);
});

// Route dengan middleware auth dan role admin
Route::middleware(['auth', 'isAdmin'])->group(function () {
    Route::get('/admin/dashboard', [AdminController::class, 'index']);
});
```

## 🎮 Controller

Controller adalah kelas PHP yang menangani logika permintaan HTTP dan mengembalikan respons.

### 1. Membuat Controller

```bash
php artisan make:controller UserController
```

Untuk controller dengan resource methods (index, create, store, show, edit, update, destroy):

```bash
php artisan make:controller ProductController --resource
```

### 2. Struktur Controller Dasar

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;

class UserController extends Controller
{
    // Menampilkan daftar user
    public function index()
    {
        $users = User::all();
        return view('users.index', compact('users'));
    }

    // Menampilkan form untuk membuat user baru
    public function create()
    {
        return view('users.create');
    }

    // Menyimpan user baru
    public function store(Request $request)
    {
        // Validasi input
        $request->validate([
            'name' => 'required',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:8',
        ]);

        // Buat user baru
        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => bcrypt($request->password),
        ]);

        return redirect('/users')->with('success', 'User berhasil ditambahkan!');
    }

    // Menampilkan user tertentu
    public function show($id)
    {
        $user = User::findOrFail($id);
        return view('users.show', compact('user'));
    }

    // Menampilkan form untuk edit user
    public function edit($id)
    {
        $user = User::findOrFail($id);
        return view('users.edit', compact('user'));
    }

    // Update user
    public function update(Request $request, $id)
    {
        // Validasi input
        $request->validate([
            'name' => 'required',
            'email' => 'required|email|unique:users,email,'.$id,
        ]);

        $user = User::findOrFail($id);
        $user->update($request->all());

        return redirect('/users')->with('success', 'User berhasil diupdate!');
    }

    // Hapus user
    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return redirect('/users')->with('success', 'User berhasil dihapus!');
    }
}
```

## 🔄 Algoritma Pengerjaan Route dan Controller

1. **Identifikasi Kebutuhan**
   - Tentukan fitur apa saja yang dibutuhkan
   - Tentukan URL/endpoint untuk setiap fitur

2. **Buat Route**
   - Buka file `routes/web.php`
   - Definisikan route sesuai kebutuhan
   - Gunakan route group untuk mengorganisir route

3. **Buat Controller**
   - Buat controller dengan perintah artisan
   - Implementasikan method yang dibutuhkan
   - Hubungkan dengan model jika perlu

4. **Hubungkan Route dengan Controller**
   - Impor controller di file route
   - Tentukan method controller yang akan dipanggil

## 📝 Contoh Implementasi dari Project

Berikut contoh implementasi route dan controller dari project `coba-laravel-8`:

```php
// routes/web.php
Route::middleware(['auth', 'isAdmin'])->group(function () {
    // Categories
    Route::get('categories','Admin\CategoryController@index');
    Route::get('add-category','Admin\CategoryController@add');
    Route::post('insert-category','Admin\CategoryController@insert');
    Route::get('edit-category/{id}',[CategoryController::class,'edit']);
    Route::put('update-category/{id}',[CategoryController::class,'update']);
    Route::get('delete-category/{id}',[CategoryController::class,'delete']);
    Route::get('destroy-category/{id}',[CategoryController::class,'destroy']);
});
```

```php
// app/Http/Controllers/Admin/CategoryController.php
public function index() {
    $category = Category::getCategoriesWithStatusReadPaginate(5);
    return view('admin.category.index',compact('category'));
}

public function add() {
    return view('admin.category.add');
}

public function insert(Request $request){
    $category = new Category();
    // Proses upload gambar jika ada
    if($request->hasFile('image')) {
        $file = $request->file('image');
        $ext = $file->getClientOriginalExtension();
        $filename = time().'.'.$ext;
        $file->move('assets/uploads/category',$filename);
        $category->image = $filename;
    }
    
    // Set nilai-nilai lain
    $category->name = $request->input('name');
    $category->slug = $request->input('slug');
    $category->description = $request->input('description');
    $category->status = $request->input('status') == TRUE ? '1':'0';
    $category->popular = $request->input('popular') == TRUE ? '1':'0';
    $category->meta_title = $request->input('meta_title');
    $category->meta_keywords = $request->input('meta_keywords');
    $category->meta_descrip = $request->input('meta_descrip');
    $category->save();
    
    return redirect('dashboard')->with('status','Category Added Successfully');
}
```

## 🔍 Langkah Selanjutnya

Pada bagian berikutnya, kita akan membahas tentang:
- Model dan Database Migration
- Eloquent ORM
- Relasi antar Model

---

[⬅️ Kembali ke Bagian 1](TUTORIAL_LARAVEL_8_BAGIAN1.md) | [Lanjut ke Bagian 3: Model dan Database ➡️](TUTORIAL_LARAVEL_8_BAGIAN3.md) 