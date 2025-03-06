# TUTORIAL LARAVEL 8 - BAGIAN 4B: FORM DAN VALIDASI

## 📝 Form di Laravel

Form adalah bagian penting dari aplikasi web untuk mengumpulkan input dari pengguna. Laravel menyediakan berbagai helper untuk membuat dan mengelola form.

### 1. Membuat Form Dasar

```html
<form action="/users" method="POST">
    @csrf
    
    <div class="form-group">
        <label for="name">Nama</label>
        <input type="text" name="name" id="name" class="form-control" value="{{ old('name') }}">
    </div>
    
    <div class="form-group">
        <label for="email">Email</label>
        <input type="email" name="email" id="email" class="form-control" value="{{ old('email') }}">
    </div>
    
    <div class="form-group">
        <label for="password">Password</label>
        <input type="password" name="password" id="password" class="form-control">
    </div>
    
    <button type="submit" class="btn btn-primary">Simpan</button>
</form>
```

> 💡 **Tips**: `@csrf` adalah directive Blade yang menghasilkan token CSRF untuk keamanan form.

### 2. Form untuk Update Data

```html
<form action="/users/{{ $user->id }}" method="POST">
    @csrf
    @method('PUT')
    
    <div class="form-group">
        <label for="name">Nama</label>
        <input type="text" name="name" id="name" class="form-control" value="{{ old('name', $user->name) }}">
    </div>
    
    <div class="form-group">
        <label for="email">Email</label>
        <input type="email" name="email" id="email" class="form-control" value="{{ old('email', $user->email) }}">
    </div>
    
    <button type="submit" class="btn btn-primary">Update</button>
</form>
```

> 💡 **Tips**: `@method('PUT')` adalah directive Blade untuk method spoofing, karena HTML form hanya mendukung GET dan POST.

### 3. Form dengan File Upload

```html
<form action="/categories" method="POST" enctype="multipart/form-data">
    @csrf
    
    <div class="form-group">
        <label for="name">Nama Kategori</label>
        <input type="text" name="name" id="name" class="form-control" value="{{ old('name') }}">
    </div>
    
    <div class="form-group">
        <label for="image">Gambar</label>
        <input type="file" name="image" id="image" class="form-control-file">
    </div>
    
    <button type="submit" class="btn btn-primary">Simpan</button>
</form>
```

> 💡 **Tips**: Jangan lupa menambahkan `enctype="multipart/form-data"` untuk form dengan upload file.

## ✅ Validasi Form

Laravel menyediakan berbagai cara untuk memvalidasi input pengguna.

### 1. Validasi di Controller

```php
public function store(Request $request)
{
    // Validasi input
    $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|email|unique:users',
        'password' => 'required|min:8|confirmed',
        'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
    ]);
    
    // Proses data jika validasi berhasil
    User::create([
        'name' => $request->name,
        'email' => $request->email,
        'password' => bcrypt($request->password),
    ]);
    
    return redirect('/users')->with('success', 'User berhasil ditambahkan!');
}
```

### 2. Menampilkan Error Validasi

```html
<form action="/users" method="POST">
    @csrf
    
    <div class="form-group">
        <label for="name">Nama</label>
        <input type="text" name="name" id="name" class="form-control @error('name') is-invalid @enderror" value="{{ old('name') }}">
        @error('name')
            <div class="invalid-feedback">{{ $message }}</div>
        @enderror
    </div>
    
    <div class="form-group">
        <label for="email">Email</label>
        <input type="email" name="email" id="email" class="form-control @error('email') is-invalid @enderror" value="{{ old('email') }}">
        @error('email')
            <div class="invalid-feedback">{{ $message }}</div>
        @enderror
    </div>
    
    <button type="submit" class="btn btn-primary">Simpan</button>
</form>
```

### 3. Menampilkan Semua Error

```html
@if ($errors->any())
    <div class="alert alert-danger">
        <ul>
            @foreach ($errors->all() as $error)
                <li>{{ $error }}</li>
            @endforeach
        </ul>
    </div>
@endif
```

### 4. Aturan Validasi Umum

| Aturan | Deskripsi |
|--------|-----------|
| `required` | Field harus ada dan tidak boleh kosong |
| `email` | Field harus berformat email |
| `min:8` | Field harus memiliki minimal 8 karakter |
| `max:255` | Field maksimal 255 karakter |
| `unique:users` | Field harus unik di tabel users |
| `confirmed` | Field harus memiliki field konfirmasi (field_confirmation) |
| `image` | Field harus berupa gambar |
| `mimes:jpeg,png,jpg` | Field harus memiliki ekstensi yang ditentukan |
| `numeric` | Field harus berupa angka |
| `integer` | Field harus berupa bilangan bulat |
| `date` | Field harus berupa tanggal |
| `in:1,2,3` | Field harus salah satu dari nilai yang ditentukan |

## 📝 Contoh Implementasi dari Project

Berikut contoh implementasi form dan validasi dari project `coba-laravel-8`:

```html
<!-- resources/views/admin/category/add.blade.php -->
@extends('layouts.admin')

@section('content')
    <div class="card">
        <div class="card-header">
            <h4>Tambah Kategori</h4>
        </div>
        <div class="card-body">
            <form action="{{ url('insert-category') }}" method="POST" enctype="multipart/form-data">
                @csrf
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label for="name">Nama</label>
                        <input type="text" class="form-control" name="name">
                    </div>
                    <div class="col-md-6 mb-3">
                        <label for="slug">Slug</label>
                        <input type="text" class="form-control" name="slug">
                    </div>
                    <div class="col-md-12 mb-3">
                        <label for="description">Deskripsi</label>
                        <textarea name="description" rows="3" class="form-control"></textarea>
                    </div>
                    <div class="col-md-6 mb-3">
                        <label for="status">Status</label>
                        <input type="checkbox" name="status">
                    </div>
                    <div class="col-md-6 mb-3">
                        <label for="popular">Popular</label>
                        <input type="checkbox" name="popular">
                    </div>
                    <div class="col-md-12 mb-3">
                        <label for="meta_title">Meta Title</label>
                        <input type="text" class="form-control" name="meta_title">
                    </div>
                    <div class="col-md-12 mb-3">
                        <label for="meta_keywords">Meta Keywords</label>
                        <textarea name="meta_keywords" rows="3" class="form-control"></textarea>
                    </div>
                    <div class="col-md-12 mb-3">
                        <label for="meta_descrip">Meta Description</label>
                        <textarea name="meta_descrip" rows="3" class="form-control"></textarea>
                    </div>
                    <div class="col-md-12">
                        <input type="file" name="image" class="form-control">
                    </div>
                    <div class="col-md-12">
                        <button type="submit" class="btn btn-primary">Submit</button>
                    </div>
                </div>
            </form>
        </div>
    </div>
@endsection
```

```php
// app/Http/Controllers/Admin/CategoryController.php
public function insert(Request $request)
{
    $category = new Category();
    
    if($request->hasFile('image'))
    {
        $file = $request->file('image');
        $ext = $file->getClientOriginalExtension();
        $filename = time().'.'.$ext;
        $file->move('assets/uploads/category',$filename);
        $category->image = $filename;
    }
    
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

Pada bagian berikutnya (4C), kita akan membahas lebih lanjut tentang:
- Component dan Slot di Blade
- Upload File dan Pengelolaan Asset
- Flash Message dan Session

---

[⬅️ Kembali ke Bagian 4A](TUTORIAL_LARAVEL_8_BAGIAN4A.md) | [Lanjut ke Bagian 4C: Component dan Asset ➡️](TUTORIAL_LARAVEL_8_BAGIAN4C.md) 