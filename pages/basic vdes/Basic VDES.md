# **File Tree View**
* [Dasar VDES](Basic%20VDES.md)
  * [Create VDES](Create%20in%20VDES.md)
  * [Read VDES](Read%20VDES.md)
  * [Update VDES](Update%20VDES.md)
  * [System Model VDES](System%20Model%20VDES.md)


# **Basic VDES**

Selamat datang di **VDES**! Dengan VDES, Anda dapat meningkatkan efisiensi dan produktivitas dalam mengelola data. Sistem ini dirancang untuk mempermudah proses pemanggilan data, memungkinkan Anda bekerja lebih cepat dan akurat. Mari kita eksplorasi bagaimana VDES bekerja dan bagaimana Anda bisa mengoptimalkan penggunaannya.

---

## **Memasuki Akun Administrator Default**
```shell
> username : "root", passowrd : "P@ssw0rd123!@#"
```
atau 
```shell
> username : "root", password : "password : 1234"
```

## **Memahami Alur Panggilan Data**
VDES menggunakan pendekatan berbasis **MVC (Model-View-Controller)** untuk mengelola dan menampilkan data. Mari kita lihat bagaimana setiap komponen berperan dalam proses ini.

### **1. View – Menampilkan Data**
Dalam file `nama_view.php`, terdapat skrip yang bertanggung jawab untuk menampilkan tabel data menggunakan **DataTables**.

#### **Kode View:**
```html
<script type="text/javascript">
  var url = '<?php echo $data['curl'] ?>/';
  var url_file = '<?php echo $config['base_url']; ?>static/files/bahan/';
  $(function () {
    $('.datatable').DataTable({
      ....
      // Konfigurasi DataTable
      "ajax": {
          "url": url + 'get/<?php echo $data['encode'] ?>',
          "type": "POST"
        },
      ....
    });
  });
</script>
```

Kode di atas menampilkan konfigurasi **`"ajax"`** yang berisi **URL** untuk memanggil data dengan metode yang sesuai. Berikut adalah bagian yang bertanggung jawab untuk melakukan pemanggilan data:
```ts
"url": url + 'get/<?php echo $data['encode'] ?>',
```
Kode ini berarti akan memanggil **controller** yang memberikan **`$data`** pada laman view.

---

### **2. Controller – Mengelola Permintaan Data**
Data yang ditampilkan di `view` dipanggil berdasarkan informasi yang diberikan oleh **Controller**. Fungsi utama dalam proses ini adalah **`get`**, yang bertanggung jawab untuk mengambil data akun dari database.

#### **Fungsi `get`**
**Fungsi ini memiliki beberapa tugas utama:**
- **Mengambil data akun dari database** dalam format **JSON**.
- Jika parameter **`$x`** diberikan, akan mengambil data berdasarkan ID yang di-encode dalam **base64**.
- Jika tidak ada parameter, fungsi akan mengambil seluruh data akun dengan **join ke tabel `m_bank` dan `m_entitas`**, serta mengurutkan berdasarkan **kolom `autono` secara descending**.

#### **Kode Controller:**
```php
function get($x = null) {
    $request = $_REQUEST;
    $model = $this->loadModel($this->model);
    $id = $this->base64url_decode($x);
    
    $columns = array(
        array('db' => 'autono', 'dt' => 0, 'formatter' => function ($d, $row) {
            return $this->base64url_encode($d);
        }),
        array('db' => 'nama_bank',  'dt' => 1),
        array('db' => 'nomor_rekening',  'dt' => 2),
        array('db' => 'nama_rekening',  'dt' => 3),
        array('db' => 'nama_akun',  'dt' => 4),
        array('db' => 'nama_perusahaan',  'dt' => 5),
        array('db' => 'internal',  'dt' => 6),
        array('db' => 'keterangan',  'dt' => 7),
    );
    
    $orderby = "ORDER BY autono DESC";
    $tbljoin[] = array('table' => 'm_bank', 'field' => 'bank', 'fieldkey' => 'autono', 'fieldname' => 'nama_bank');
    $tbljoin[] = array('table' => 'm_entitas', 'field' => 'entitas', 'fieldkey' => 'autono', 'fieldname' => 'nama_perusahaan');

    if ($x) {
        $result = $model->mget_detail($request, $this->table, $this->primaryKey, $columns, $id);
    } else {
        $result = $model->mgetjoin($request, $this->table, $this->primaryKey, $columns, $tbljoin, $entitas, $orderby);
    }

    return json_encode($result);
}
```

Kode ini bertugas menentukan **kolom data** yang akan ditampilkan dan bagaimana data diambil berdasarkan parameter yang diberikan.

**Konfigurasi kolom yang akan ditampilkan di `view`:**
```php
$columns = array(
    array('db' => 'autono', 'dt' => 0, 'formatter' => function ($d, $row) {
        return $this->base64url_encode($d);
    }),
    array('db' => 'nama_bank',  'dt' => 1),
    array('db' => 'nomor_rekening',  'dt' => 2),
    array('db' => 'nama_rekening',  'dt' => 3),
    array('db' => 'nama_akun',  'dt' => 4),
    array('db' => 'nama_perusahaan',  'dt' => 5),
    array('db' => 'internal',  'dt' => 6),
    array('db' => 'keterangan',  'dt' => 7),
);
```

**Jika ada perubahan pada tampilan `view`, maka bagian ini perlu disesuaikan dengan data yang ingin ditampilkan.**

---

### **3. Model – Mengambil Data dari Database**
Dalam arsitektur MVC, **Model** bertugas untuk mengambil data dari database dan mengolahnya sebelum dikirim ke **Controller**.

**Jika `$x = null`, maka akan mengambil semua data dan melakukan `JOIN` ke tabel terkait:**
```php
$result = $model->mgetjoin($request, $this->table, $this->primaryKey, $columns, $tbljoin, $entitas, $orderby);
```
**Jika `$x != null`, maka akan mengambil detail data berdasarkan ID yang diberikan:**
```php
$result = $model->mget_detail($request, $this->table, $this->primaryKey, $columns, $id);
```

### **4. System Model Utama**
System Model Utama merupakan model inti yang menyediakan fungsi-fungsi dasar yang dapat digunakan oleh berbagai modul dalam sistem.

**Format implementasi kode untuk fungsi `mgetjoin` dalam model utama:**
```php
$result = $model->mgetjoin(
    $request,        // Parameter request (biasanya berisi data input atau filter)
    $this->table,    // Nama tabel utama
    $this->primaryKey, // Kolom primary key dari tabel utama
    $columns,        // Array kolom yang akan ditampilkan
    $tbljoin,        // Array tabel yang akan di-join
    $entitas,        // Entitas atau kondisi tambahan
    $orderby         // Pengurutan data
);
```
Kode ini memungkinkan fleksibilitas dalam pengambilan data, sehingga dapat digunakan untuk berbagai kebutuhan dalam sistem.

---
## **Mgetjoin (Call Data + Join Table)**
Bila kita melihat pemanggilan pada `controller` sebelumnya yang berisi kode berikut :
```php
$result  = $model->mgetjoin($request, $this->table, $this->primaryKey, $columns, $tbljoin, $entitas, $orderby);
```
Dengan parameter yang diberikan, mari kita jelaskan secara detail apa yang terjadi saat fungsi `mgetjoin` dipanggil dengan parameter tersebut. Berikut adalah penjelasan untuk setiap parameter dan bagaimana mereka digunakan dalam fungsi `mgetjoin`:

---

### 1. **`$request = $_REQUEST`**
- `$_REQUEST` adalah array superglobal di PHP yang berisi data dari `$_GET`, `$_POST`, dan `$_COOKIE`.
- Parameter ini digunakan untuk menentukan:
  - **Filtering**: Kolom mana yang akan difilter dan nilai filternya.
  - **Ordering**: Kolom mana yang akan diurutkan dan arah pengurutannya (ascending/descending).
  - **Pagination**: Halaman yang diminta (`start`) dan jumlah data per halaman (`length`).

Contoh isi `$_REQUEST`:
```php
$_REQUEST = [
    "draw" => 1,
    "start" => 0,
    "length" => 10,
    "search" => ["value" => "keyword"],
    "order" => [["column" => 0, "dir" => "asc"]]
];
```

---

### 2. **`$model = $this->loadModel($this->model)`**
- `$this->loadModel($this->model)` adalah method yang digunakan untuk memuat model tertentu.
- `$model` adalah objek dari model yang dimuat, yang memiliki method `mgetjoin`.

---

### 3. **`$id = $this->base64url_decode($x)`**
- `$this->base64url_decode($x)` adalah method untuk mendecode string yang di-encode dengan Base64 URL-safe.
- `$x` adalah string yang di-decode, dan hasilnya disimpan di `$id`.
- `$id` kemungkinan digunakan untuk filtering tambahan atau keperluan lainnya (tidak terlihat dalam parameter `mgetjoin` di sini).

---

### 4. **`$columns`**
- `$columns` adalah array yang mendefinisikan kolom-kolom yang akan di-select dari database dan bagaimana data tersebut akan diformat.
- Setiap elemen array memiliki:
  - `db`: Nama kolom di database.
  - `dt`: Index kolom di output (biasanya sesuai dengan urutan kolom di frontend, misalnya DataTables).
  - `formatter` (opsional): Fungsi untuk memformat nilai kolom sebelum ditampilkan.

Contoh isi `$columns`:
```php
$columns = [
    array('db' => 'autono', 'dt' => 0, 'formatter' => function ($d, $row) {
        return $this->base64url_encode($d); // Format autono menjadi Base64 URL-safe
    }),
    array('db' => 'nama_bank',  'dt' => 1),       // Kolom nama_bank
    array('db' => 'nomor_rekening',  'dt' => 2),  // Kolom nomor_rekening
    array('db' => 'nama_rekening',  'dt' => 3),   // Kolom nama_rekening
    array('db' => 'nama_akun',  'dt' => 4),       // Kolom nama_akun
    array('db' => 'nama_perusahaan',  'dt' => 5), // Kolom nama_perusahaan
    array('db' => 'internal',  'dt' => 6),        // Kolom internal
    array('db' => 'keterangan',  'dt' => 7),      // Kolom keterangan
];
```

---

### 5. **`$orderby = "ORDER BY autono DESC"`**
- `$orderby` adalah string yang menentukan pengurutan data.
- Dalam kasus ini, data akan diurutkan berdasarkan kolom `autono` secara descending (dari nilai terbesar ke terkecil).

---

### 6. **`$tbljoin`**
- `$tbljoin` adalah array yang mendefinisikan tabel-tabel yang akan di-join dengan tabel utama.
- Setiap elemen array memiliki:
  - `table`: Nama tabel yang akan di-join.
  - `field`: Kolom di tabel utama yang akan di-join.
  - `fieldkey`: Kolom di tabel join yang akan di-join.
  - `fieldname`: Nama kolom hasil join yang akan ditampilkan.

Contoh isi `$tbljoin`:
```php
$tbljoin = [
    array('table' => 'm_bank', 'field' => 'bank', 'fieldkey' => 'autono', 'fieldname' => 'nama_bank'),
    array('table' => 'm_entitas', 'field' => 'entitas', 'fieldkey' => 'autono', 'fieldname' => 'nama_perusahaan')
];
```

- **Join 1**: Tabel `m_bank` di-join dengan tabel utama menggunakan kolom `bank` (tabel utama) dan `autono` (tabel `m_bank`). Hasil join akan menampilkan kolom `nama_bank`.
- **Join 2**: Tabel `m_entitas` di-join dengan tabel utama menggunakan kolom `entitas` (tabel utama) dan `autono` (tabel `m_entitas`). Hasil join akan menampilkan kolom `nama_perusahaan`.

---

### 7. **`$entitas`**
- `$entitas` tidak terlihat dalam kode yang diberikan, tetapi kemungkinan adalah string yang berisi kondisi tambahan untuk query WHERE.
- Misalnya: `$entitas = "AND status = 'active'"`.

---

### 8. **Pemanggilan Fungsi `mgetjoin`**
```php
$result = $model->mgetjoin($request, $this->table, $this->primaryKey, $columns, $tbljoin, $entitas, $orderby);
```

- Fungsi ini akan:
  1. Membangun query SQL berdasarkan parameter yang diberikan.
  2. Menjalankan query untuk mengambil data dari database.
  3. Menghitung total record dan record yang sesuai dengan filter.
  4. Mengembalikan hasil dalam format yang spesifik.

---

### 9. **Hasil yang Diharapkan**
Hasil dari fungsi `mgetjoin` akan berupa array seperti ini:
```php
$result = [
    "draw" => 1, // Nilai dari $_REQUEST['draw']
    "recordsTotal" => 100, // Total record di tabel utama
    "recordsFiltered" => 50, // Total record yang sesuai dengan filter
    "data" => [
        [
            "0" => "encoded_autono", // autono di-encode dengan Base64 URL-safe
            "1" => "Bank ABC", // nama_bank
            "2" => "123456789", // nomor_rekening
            "3" => "John Doe", // nama_rekening
            "4" => "Account 1", // nama_akun
            "5" => "Company XYZ", // nama_perusahaan
            "6" => "Internal", // internal
            "7" => "Keterangan" // keterangan
        ],
        // Data lainnya...
    ]
];
```

---

### 10. **Kesimpulan**
- Kode ini digunakan untuk mengambil data dari database dengan fitur filtering, ordering, pagination, dan join.
- Parameter yang diberikan menentukan:
  - Kolom yang akan di-select (`$columns`).
  - Tabel yang akan di-join (`$tbljoin`).
  - Pengurutan data (`$orderby`).
  - Kondisi tambahan (`$entitas`).
- Hasilnya dikembalikan dalam format yang siap digunakan oleh frontend (misalnya DataTables).