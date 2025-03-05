# **File Tree View**
* [Dasar VDES](Basic%20VDES.md)
  * [Create VDES](Create%20in%20VDES.md)
  * [Read VDES](Read%20VDES.md)
  * [Update VDES](Update%20VDES.md)
  * [System Model VDES](System%20Model%20VDES.md)
  
# **Alur Edit Data dalam Aplikasi**

## 📋 Workflow Utama
1. **Tampilan Tabel** (`nama_view.php`)  
   - Menampilkan data dalam tabel menggunakan DataTables
   - Tombol edit akan membentuk URL: `base_url/edit/ID/encoded_param`

2. **Controller Edit** (`nama.php`)  
   - Menerima ID yang di-encode
   - Mengambil data dari database
   - Menyiapkan dropdown (bank dan entitas)
   - Mengirim data ke view edit

3. **Form Edit** (`nama_edit.php`)  
   - Menampilkan form dengan data yang sudah ada
   - Menggunakan input fields dan dropdown yang terisi

4. **Controller Save** (`nama.php`)  
   - Menerima data dari form
   - Membersihkan input
   - Menyimpan ke database
   - Redirect ke halaman list/detail

---

## 🔍 Penjelasan Kode Kunci

### 1. Inisialisasi DataTable (JS)
```js
{
  "serverSide": true,
  "ajax": {
    "url": url + 'get/<?= $data['encode'] ?>',
    "type": "POST"
  },
  "columns": [
    // Kolom nomor urut
    {
      render: function(data, type, row, meta) {
        return meta.row + meta.settings._iDisplayStart + 1;
      }
    },
    // Tombol aksi
    {
      "render": function(data, type, row) {
        return `<a href="${url}edit/${row}">Edit</a>`;
      }
    }
  ]
}
```

### 2. Fungsi Edit Controller (PHP)
```php
public function edit($x) {
  $id = base64_decode($x);  // Dekripsi ID
  $data['bank'] = $model->get_combo(...);  // Data dropdown
  $data['aadata'] = $model->get('table', 'id', $id);  // Data yang akan diedit
  $this->loadView('edit_view', $data);  // Tampilkan form
}
```

### 3. Form Edit (HTML/PHP)
```html
<select name="bank">
  <?php foreach($data['bank'] as $bank): ?>
    <option value="<?= $bank ?>" <?= $bank ?>>
      <?= $bank ?>
    </option>
  <?php endforeach; ?>
</select>

<input type="text" name="nomor_rekening" 
       value="<?= htmlspecialchars($value['nomor_rekening']) ?>">
```

---

## 🔒 Aspek Keamanan
| Fitur Keamanan | Implementasi | Manfaat |
|----------------|--------------|---------|
| Input Sanitasi | `htmlspecialchars()` | Mencegah XSS |
| ID Encoding | `base64url_decode()` | Hindari ID manipulation |
| Server Validation | Validasi di model | Pasti data valid |

---

## Diagram Alir
```
sequenceDiagram
    participant View
    participant Controller
    participant Database
    
    View       -->>Controller   : Klik tombol edit
    Controller -->>Database     : Ambil data by ID
    Database   -->>Controller   : Return data
    Controller -->>View         : Tampilkan form edit
    View       -->>Controller   : Submit form
    Controller -->>Database     : Update data
    Database   -->>Controller   : Konfirmasi update
    Controller -->>View         : Redirect ke list
```

---

## 💡 Fitur Khusus
1. **Dynamic Dropdown**  
   Dropdown bank dan entitas di-generate otomatis dari database

2. **Switch Button**  
   Menggunakan plugin switchery untuk toggle status internal/supplier

3. **Server-side Processing**  
   DataTables dihandle di server untuk dataset besar

4. **Breadcrumb Navigation**  
   Sistem navigasi hierarkis untuk user experience

---

> **Catatan Penting:**  
> - Seluruh input melewati proses sanitasi sebelum disimpan  
> - ID selalu di-encode untuk keamanan  
> - Validasi dilakukan di server dan client  
> - Error handling sudah terimplementasi di model


---

# Alur Edit Data (Lanjutan)

## 🔄 Workflow Update Data
1. **Submit Form Edit**  
   Setelah pengguna mengisi form di `nama_edit.php`:
   ```html
   <form action="<?= $data['curl'] ?>/update/..." method="post">
   ```
   Data dikirim ke controller `update`

2. **Controller Update** (`nama.php`)
   ```php
   public function update($x) {
     $id = $this->base64url_decode($x); // Dekode ID
     // Sanitasi semua input
     $data['nomor_rekening'] = htmlspecialchars($_REQUEST['nomor_rekening']);
     // Panggil model update
     $result = $model->mupdate($this->table, $data, $this->primaryKey, $id);
   }
   ```

3. **Model Update** (`nama_model.php` → `model.php`)
   ```php
   // nama_model.php
   public function mupdate($table, $data, $primaryKey, $id, $title) {
     return $this->sqlupdate($table, $data, $primaryKey, $id, $title);
   }
   
   // model.php (parent)
   public function sqlupdate($table, $data, $primary, $id, $menu) {
     // Logika update database
     $query = "UPDATE $table SET $sUpdate WHERE $primary = '$id'";
     $this->log($config['db_name'], $menu, 'EDIT', $query, $id);
   }
   ```

---

## 🛠️ Mekanisme Update Database

### Proses Penyusunan Query
```php
array_walk($data, function (&$value, $key) {
  $value = "`$key` = '$value'"; // Format key=value
});

$sUpdate = implode(", ", array_values($data)); 
// Contoh hasil: `bank`='BCA', `nomor_rekening`='123456'
```

### Fitur Keamanan Tambahan
| Fitur | Implementasi | Keterangan |
|-------|--------------|------------|
| Auto-Logging | `$this->log(...)` | Mencatat semua aktivitas update |
| Session Tracking | `$_SESSION['username']` | Melacak user yang melakukan edit |
| Timestamp | `date('Y-m-d H:i:s')` | Pencatatan waktu update |

---

## 🔄 Diagram Alur Update
```
sequenceDiagram
    participant View
    participant Controller
    participant Model
    participant Database
    
    View->>Controller: Submit form edit
    Controller->>Model: mupdate()
    Model->>Database: UPDATE query
    Database-->>Model: Konfirmasi update
    Model-->>Controller: Return status
    Controller-->>View: Redirect + feedback
```

---

## 💻 Struktur Kode Penting

### 1. Controller Update
```php
$data = [
  'bank' => htmlspecialchars($_POST['bank']),
  'entitas' => !empty($_POST['entitas']) ? htmlspecialchars(...) : 0
];

// Contoh hasil array:
// [
//   'bank' => '002',
//   'nomor_rekening' => '123456789',
//   ...
// ]
```

### 2. SQL Update Builder
```php
// Data sebelum diproses
$data = ['nama_akun' => 'Account Receivable'];

// Setelah array_walk
$data = ['nama_akun' => "`nama_akun` = 'Account Receivable'"];

// Hasil akhir query
UPDATE m_akun SET `nama_akun`='Account Receivable' WHERE autono='ACC-001'
```

---

## 🚩 Error Handling
1. **Validasi Level Akses**  
   Menggunakan session untuk membatasi akses:
   ```php
   $fields['level_id'] = $_SESSION['level_id'] ?? 9;
   ```

2. **Backup Parameter**  
   Default value untuk mencegah error:
   ```php
   $fields['location_id'] = $_SESSION['location_id'] ?? 9;
   ```

3. **Logging Otomatis**  
   Mencatat detail update:
   ```php
   $log = $this->log($config['db_name'], $menu, 'EDIT', $query, $id);
   ```

---

## 📌 Best Practices
1. **Chain of Responsibility**  
   Model child (`nama_model.php`) memanggil parent model (`model.php`)

2. **DRY Principle**  
   Reuse fungsi `sqlupdate()` untuk berbagai tabel

3. **Audit Trail**  
   Sistem logging yang mencatat:
   - User yang melakukan update
   - Waktu update
   - Query yang dijalankan
   - ID record yang diubah


---
