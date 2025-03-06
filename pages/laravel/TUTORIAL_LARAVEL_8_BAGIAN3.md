# TUTORIAL LARAVEL 8 - BAGIAN 3: MODEL DAN DATABASE

## 🗄️ Database Migration

Migration adalah cara Laravel untuk mengelola skema database. Dengan migration, Anda dapat dengan mudah membuat, mengubah, dan menghapus tabel database.

### 1. Membuat Migration

```bash
# Membuat migration untuk tabel baru
php artisan make:migration create_categories_table

# Membuat migration untuk mengubah tabel yang sudah ada
php artisan make:migration add_status_to_users_table --table=users
```

### 2. Struktur Migration

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCategoriesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug');
            $table->longText('description');
            $table->tinyInteger('status')->default('0');
            $table->tinyInteger('popular')->default('0');
            $table->string('image')->nullable();
            $table->string('meta_title');
            $table->string('meta_descrip');
            $table->string('meta_keywords');
            $table->enum('status_read', ['0', '1'])->default('1');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('categories');
    }
}
```

### 3. Menjalankan Migration

```bash
# Menjalankan semua migration yang belum dijalankan
php artisan migrate

# Rollback migration terakhir
php artisan migrate:rollback

# Rollback semua migration dan jalankan kembali
php artisan migrate:fresh

# Rollback semua migration, jalankan kembali, dan jalankan seeder
php artisan migrate:fresh --seed
```

## 📊 Model dan Eloquent ORM

Model adalah kelas PHP yang merepresentasikan tabel database. Laravel menggunakan Eloquent ORM untuk berinteraksi dengan database.

### 1. Membuat Model

```bash
# Membuat model saja
php artisan make:model Category

# Membuat model beserta migration
php artisan make:model Category -m

# Membuat model, migration, controller, dan resource
php artisan make:model Category -mcr
```

### 2. Struktur Model Dasar

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    // Nama tabel (opsional, jika nama tabel berbeda dengan nama model)
    protected $table = 'categories';

    // Kolom yang dapat diisi (mass assignment)
    protected $fillable = [
        'name',
        'slug',
        'description',
        'status',
        'popular',
        'image',
        'meta_title',
        'meta_descrip',
        'meta_keywords',
        'status_read',
    ];

    // Kolom yang tidak boleh diisi (alternatif dari $fillable)
    // protected $guarded = [];

    // Kolom yang disembunyikan saat dikonversi ke array/JSON
    protected $hidden = [
        'created_at',
        'updated_at',
    ];

    // Relasi dengan model lain
    public function products()
    {
        return $this->hasMany(Product::class, 'cate_id', 'id');
    }
}
```

### 3. Query Builder dan Eloquent

```php
// Mengambil semua data
$categories = Category::all();

// Mengambil data dengan kondisi
$activeCategories = Category::where('status', 1)->get();

// Mengambil data dengan pagination
$categories = Category::paginate(10);

// Mengambil data dengan relasi
$categoriesWithProducts = Category::with('products')->get();

// Membuat data baru
$category = new Category();
$category->name = 'Electronics';
$category->slug = 'electronics';
$category->save();

// Membuat data dengan mass assignment
Category::create([
    'name' => 'Electronics',
    'slug' => 'electronics',
]);

// Update data
$category = Category::find(1);
$category->name = 'New Name';
$category->save();

// Update dengan mass assignment
Category::where('id', 1)->update(['name' => 'New Name']);

// Hapus data
$category = Category::find(1);
$category->delete();

// Hapus data dengan id
Category::destroy(1);
```

### 4. Custom Query dengan DB Facade

```php
use Illuminate\Support\Facades\DB;

// Query mentah
$categories = DB::select('SELECT * FROM categories WHERE status = 1');

// Query builder
$categories = DB::table('categories')
    ->where('status', 1)
    ->orderBy('name')
    ->get();

// Custom method di model
public static function getCategoriesWithStatusRead(){
    $value = DB::select(
        '
        SELECT *
        FROM categories
        WHERE status_read = 1
        '
    );
    return $value;
}

// Custom method dengan pagination
public static function getCategoriesWithStatusReadPaginate($perPage) {
    return DB::table('categories') 
    -> where('status_read', '1') 
    -> paginate($perPage);
}
```

## 🔄 Relasi Antar Model

Laravel Eloquent menyediakan berbagai jenis relasi antar model:

### 1. One to One

```php
// User memiliki satu Profile
public function profile()
{
    return $this->hasOne(Profile::class);
}

// Profile dimiliki oleh satu User
public function user()
{
    return $this->belongsTo(User::class);
}
```

### 2. One to Many

```php
// Category memiliki banyak Product
public function products()
{
    return $this->hasMany(Product::class, 'cate_id', 'id');
}

// Product dimiliki oleh satu Category
public function category()
{
    return $this->belongsTo(Category::class, 'cate_id', 'id');
}
```

### 3. Many to Many

```php
// Product memiliki banyak Tag
public function tags()
{
    return $this->belongsToMany(Tag::class);
}

// Tag dimiliki oleh banyak Product
public function products()
{
    return $this->belongsToMany(Product::class);
}
```

## 📝 Contoh Implementasi dari Project

Berikut contoh implementasi model dan migration dari project `coba-laravel-8`:

```php
// database/migrations/xxxx_xx_xx_create_products_table.php
public function up()
{
    Schema::create('products', function (Blueprint $table) {
        $table->id();
        $table->bigInteger('cate_id');
        $table->string('name');
        $table->string('slug');
        $table->mediumText('small_description');
        $table->longText('description');
        $table->string('original_price');
        $table->string('selling_price');
        $table->string('image');
        $table->string('qty');
        $table->string('tax');
        $table->tinyInteger('status');
        $table->tinyInteger('trending');
        $table->mediumText('meta_title');
        $table->mediumText('meta_keywords');
        $table->mediumText('meta_description');
        $table->timestamps();
        $table->enum('status_read', ['0', '1'])->default('1');
    });
}
```

```php
// app/Models/Category.php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Category extends Model
{
    use HasFactory;

    protected $table = 'categories';
    protected $fillable = [
        'name',
        'slug',
        'description',
        'status',
        'popular',
        'image',
        'meta_title',
        'meta_descrip',
        'meta_keywords',
        'status_read',
    ];

    public static function getCategoriesWithStatusRead(){
        $value = DB::select(
            '
            SELECT *
            FROM categories
            WHERE status_read = 1
            '
        );
        return $value;
    }

    public static function getCategoriesWithStatusReadPaginate($perPage) {
        return DB::table('categories') 
        -> where('status_read', '1') 
        -> paginate($perPage);
    }
}
```

## 🔍 Langkah Selanjutnya

Pada bagian berikutnya, kita akan membahas tentang:
- View dan Blade Template
- Form dan Validasi
- Upload File

---

[⬅️ Kembali ke Bagian 2](TUTORIAL_LARAVEL_8_BAGIAN2.md) | [Lanjut ke Bagian 4: View dan Blade Template ➡️](TUTORIAL_LARAVEL_8_BAGIAN4.md) 