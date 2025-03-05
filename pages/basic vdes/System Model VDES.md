# **File Tree View**
* [Dasar VDES](Basic%20VDES.md)
  * [Create VDES](Create%20in%20VDES.md)
  * [Read VDES](Read%20VDES.md)
  * [Update VDES](Update%20VDES.md)
  * [System Model VDES](System%20Model%20VDES.md)

# **System Model VDES**

## **Fungsi `mgetjoin()`**

Berikut adalah contoh format penggunaan fungsi `mgetjoin()` beserta penjelasan untuk setiap parameter:

```php
$result = $this->mgetjoin($request, $table, $primaryKey, $columns, $tablejoin, $entitas, $orders);
```

---

**Penjelasan Parameter:**

1. **`$request`**  
   Berisi data permintaan (biasanya dari DataTables atau form) yang berisi parameter seperti limit, offset, filter, dan lainnya.

2. **`$table`**  
   Nama tabel utama tempat data diambil.

3. **`$primaryKey`**  
   Kolom yang digunakan sebagai primary key untuk menghitung jumlah total dan record yang terfilter.

4. **`$columns`**  
   Array yang mendefinisikan kolom yang akan diambil, dengan penamaan:
   - `db`: Nama kolom pada database.
   - `dt`: Indeks kolom untuk output (misalnya penempatan kolom di DataTables).

5. **`$tablejoin`** (opsional)  
   Bagian JOIN dari query. Jika tidak diperlukan, biarkan `null`.

6. **`$entitas`** (opsional)  
   String tambahan untuk kondisi filter yang spesifik, seperti status aktif atau filter entitas lainnya.

7. **`$orders`** (opsional)  
   Urutan pengurutan hasil query. Jika tidak disediakan, fungsi akan membuat urutan secara dinamis berdasarkan `$request`.

---

**Algoritma Fungsi Bekerja**

```php
public function mgetjoin($request, $table, $primaryKey, $columns, $tablejoin = null, $entitas = null, $orders = null)
{
    // Inisialisasi array untuk binding parameter pada query
    $bindings = array();

    // Mendapatkan koneksi database yang telah diset di properti $this->connection
    $db = $this->connection;

    // Membuat batas (limit) untuk query berdasarkan parameter request dan kolom yang tersedia
    $limit = self::limit($request, $columns);

    // Jika parameter $orders kosong, buat query order secara dinamis berdasarkan request
    // Jika tidak, gunakan nilai $orders yang diberikan
    if (empty($orders)) {
        $order = self::order($request, $columns);
    } else {
        $order = $orders;
    }

    // Membuat kondisi filter untuk query (bagian WHERE) berdasarkan parameter request dan kolom
    // Parameter $bindings akan terisi sesuai dengan filter yang digunakan
    $where = self::filter($request, $columns, $bindings);

    // Membuat bagian JOIN dari query jika parameter $tablejoin disediakan
    $join = self::join($tablejoin);

    // Menentukan string kondisi tambahan untuk WHERE
    // Jika terdapat filter ($where tidak kosong), tambahkan "AND 1=1" diikuti entitas
    // Jika tidak ada filter, gunakan "WHERE 1=1" diikuti entitas
    if (!empty($where)) {
        $sWhere = "AND 1=1 $entitas";
    } else {
        $sWhere = "WHERE 1=1 $entitas";
    }

    // Menjalankan query utama untuk mengambil data berdasarkan kolom yang dipilih
    // Menggabungkan SELECT, FROM, JOIN, kondisi WHERE, ORDER, dan LIMIT
    $data = $this->query(
        "SELECT `" . implode("`, `", $this->pluck($columns, 'db')) . "`
        FROM `$table` t1
        $join
        $where
        $sWhere
        $order
        $limit"
    );

    // Menjalankan query untuk menghitung jumlah record yang sesuai dengan filter (recordsFiltered)
    $resFilterLength = $this->query(
        "SELECT COUNT(`{$primaryKey}`)
        FROM   `$table` t1 $join
        $where  $sWhere"
    );

    // Mengambil nilai recordsFiltered dari hasil query filter
    $recordsFiltered = $resFilterLength[0][0];

    // Menjalankan query untuk menghitung total record dalam tabel tanpa filter (recordsTotal)
    $resTotalLength = $this->query(
        "SELECT COUNT(`{$primaryKey}`)
        FROM   `$table`"
    );

    // Mengambil nilai recordsTotal dari hasil query total
    $recordsTotal = $resTotalLength[0][0];

    // Mengembalikan array hasil yang berisi:
    // - draw: nilai dari request untuk sinkronisasi client-server
    // - recordsTotal: jumlah total record dalam tabel
    // - recordsFiltered: jumlah record setelah diterapkan filter
    // - data: hasil data output yang telah diformat sesuai kolom
    return array(
        "draw"            => isset($request['draw']) ? intval($request['draw']) : 0,
        "recordsTotal"    => intval($recordsTotal),
        "recordsFiltered" => intval($recordsFiltered),
        "data"            => self::data_output($columns, $data)
    );
}
```

---

**Penjelasan Algoritma:**

1. **Inisialisasi Binding Parameter**  
   Array `$bindings` digunakan untuk menyimpan parameter yang akan di-binding ke query.

2. **Limit Query**  
   Fungsi `limit()` membuat klausa `LIMIT` berdasarkan parameter `$request` (misalnya, `LIMIT 10 OFFSET 0`).

3. **Order Query**  
   Fungsi `order()` membuat klausa `ORDER BY` secara dinamis berdasarkan parameter `$request`. Jika `$orders` disediakan, klausa ini akan digunakan.

4. **Filter Query**  
   Fungsi `filter()` membuat klausa `WHERE` berdasarkan parameter `$request` dan kolom yang tersedia. Hasilnya disimpan di `$where`.

5. **Join Query**  
   Fungsi `join()` membuat klausa `JOIN` jika parameter `$tablejoin` disediakan.

6. **Kondisi Tambahan (WHERE)**  
   Jika ada filter, klausa `WHERE` ditambahkan dengan `AND 1=1` dan `$entitas`. Jika tidak, klausa `WHERE` dimulai dengan `1=1` dan `$entitas`.

7. **Query Utama**  
   Query utama dijalankan dengan menggabungkan klausa `SELECT`, `FROM`, `JOIN`, `WHERE`, `ORDER BY`, dan `LIMIT`.

8. **Query Filtered Records**  
   Query dijalankan untuk menghitung jumlah record yang sesuai dengan filter (`recordsFiltered`).

9. **Query Total Records**  
   Query dijalankan untuk menghitung total record dalam tabel tanpa filter (`recordsTotal`).

10. **Return Hasil**  
    Fungsi mengembalikan array yang berisi:
    - `draw`: Nilai dari request untuk sinkronisasi client-server.
    - `recordsTotal`: Jumlah total record dalam tabel.
    - `recordsFiltered`: Jumlah record setelah diterapkan filter.
    - `data`: Hasil data output yang telah diformat sesuai kolom.

---

**Contoh Penggunaan:**

```php
$request = $_REQUEST; // Data request dari DataTables
$table = 'm_akun'; // Tabel utama
$primaryKey = 'autono'; // Primary key tabel
$columns = [
    ['db' => 'autono', 'dt' => 0],
    ['db' => 'nama_bank', 'dt' => 1],
    ['db' => 'nomor_rekening', 'dt' => 2],
    ['db' => 'nama_rekening', 'dt' => 3]
];
$tablejoin = [
    ['table' => 'm_bank', 'field' => 'bank', 'fieldkey' => 'autono', 'fieldname' => 'nama_bank']
];
$entitas = "AND status = 'active'"; // Kondisi tambahan
$orders = "ORDER BY autono DESC"; // Urutan pengurutan

$result = $this->mgetjoin($request, $table, $primaryKey, $columns, $tablejoin, $entitas, $orders);
```

---

**Kesimpulan**

Fungsi `mgetjoin()` adalah fungsi yang sangat fleksibel untuk mengambil data dari database dengan dukungan fitur seperti:
- **Filtering**: Berdasarkan input pengguna.
- **Pagination**: Menggunakan `LIMIT` dan `OFFSET`.
- **Sorting**: Berdasarkan kolom yang dipilih.
- **Join Table**: Untuk menggabungkan data dari beberapa tabel.
- **Kondisi Tambahan**: Seperti filter entitas atau status.


Berikut adalah penjelasan tentang fungsi `get_combo()` dalam format Markdown (`.md`) yang telah diperbaiki dan diperindah tampilannya. Anda bisa langsung menyalinnya:


## **Fungsi `get_combo()`**

Fungsi `get_combo()` digunakan untuk mengambil data dari tabel master dan memeriksa apakah data tersebut sudah dipilih atau belum berdasarkan tabel referensi. Fungsi ini sering digunakan untuk membuat combo box (dropdown) dengan opsi yang sudah dipilih (selected) atau belum.

---

**Format Penggunaan Fungsi**

```php
public function get_combo($id = null, $table, $tablemaster, $fieldtable, $fieldmaster1, $fieldmaster2)
{
    $result = $this->query("
        SELECT a.$fieldmaster1, a.$fieldmaster2, IF(b.$fieldtable IS NULL, '', 'selected') AS pselct 
        FROM $tablemaster a 
        LEFT JOIN (
            SELECT $fieldtable 
            FROM $table 
            WHERE autono = '$id'
        ) b 
        ON a.$fieldmaster1 = b.$fieldtable 
        ORDER BY a.$fieldmaster1 ASC
    ");
    return $result;
}
```

---

**Penjelasan Parameter:**

1. **`$id`** (opsional)  
   ID dari record yang sedang diproses. Jika `null`, fungsi akan mengabaikan filter berdasarkan ID.

2. **`$table`**  
   Nama tabel referensi yang digunakan untuk memeriksa apakah data sudah dipilih atau belum.

3. **`$tablemaster`**  
   Nama tabel master yang berisi daftar opsi untuk combo box.

4. **`$fieldtable`**  
   Nama kolom pada tabel referensi yang digunakan untuk join dengan tabel master.

5. **`$fieldmaster1`**  
   Nama kolom pada tabel master yang digunakan sebagai nilai (value) untuk combo box.

6. **`$fieldmaster2`**  
   Nama kolom pada tabel master yang digunakan sebagai teks (label) untuk combo box.

---

**Algoritma Fungsi Bekerja**

1. **Query Utama**  
   Fungsi menjalankan query SQL dengan struktur berikut:
   ```sql
   SELECT 
       a.$fieldmaster1, 
       a.$fieldmaster2, 
       IF(b.$fieldtable IS NULL, '', 'selected') AS pselct 
   FROM $tablemaster a 
   LEFT JOIN (
       SELECT $fieldtable 
       FROM $table 
       WHERE autono = '$id'
   ) b 
   ON a.$fieldmaster1 = b.$fieldtable 
   ORDER BY a.$fieldmaster1 ASC
   ```

2. **Join Tabel**  
   - Tabel master (`$tablemaster`) di-join dengan subquery yang mengambil data dari tabel referensi (`$table`) berdasarkan `autono = '$id'`.
   - Join dilakukan menggunakan kolom `$fieldmaster1` (dari tabel master) dan `$fieldtable` (dari tabel referensi).

3. **Kondisi IF**  
   - Kolom `pselct` akan bernilai `'selected'` jika data dari tabel master sudah dipilih (ada di tabel referensi).
   - Jika tidak, kolom `pselct` akan bernilai `''` (string kosong).

4. **Pengurutan Data**  
   Data diurutkan berdasarkan kolom `$fieldmaster1` secara ascending (`ASC`).

5. **Return Hasil**  
   Fungsi mengembalikan hasil query dalam bentuk array.

---

**Contoh Penggunaan:**

```php
$id = 123; // ID record yang sedang diproses
$table = 'm_akun'; // Tabel referensi
$tablemaster = 'm_bank'; // Tabel master
$fieldtable = 'bank'; // Kolom pada tabel referensi
$fieldmaster1 = 'autono'; // Kolom nilai (value) pada tabel master
$fieldmaster2 = 'nama_bank'; // Kolom teks (label) pada tabel master

$result = $this->get_combo($id, $table, $tablemaster, $fieldtable, $fieldmaster1, $fieldmaster2);
```

---

**Output Hasil Query**

Hasil query akan berupa array dengan struktur seperti berikut:
```php
[
    [
        'autono' => 1,
        'nama_bank' => 'Bank A',
        'pselct' => 'selected'
    ],
    [
        'autono' => 2,
        'nama_bank' => 'Bank B',
        'pselct' => ''
    ],
    [
        'autono' => 3,
        'nama_bank' => 'Bank C',
        'pselct' => ''
    ]
]
```

- **`autono`**: Nilai (value) untuk combo box.
- **`nama_bank`**: Teks (label) untuk combo box.
- **`pselct`**: Status selected (`'selected'` jika dipilih, `''` jika tidak).

---

**Implementasi di View (Combo Box)**

Hasil dari fungsi `get_combo()` dapat digunakan untuk membuat combo box di view. Contoh:

```php
<select name="bank">
    <option value="">Pilih Bank</option>
    <?php foreach ($data['bank'] as $row): ?>
        <option value="<?php echo $row['autono']; ?>" <?php echo $row['pselct']; ?>>
            <?php echo $row['nama_bank']; ?>
        </option>
    <?php endforeach; ?>
</select>
```

---

**Kesimpulan**

Fungsi `get_combo()` sangat berguna untuk:
- Membuat combo box dengan opsi yang sudah dipilih atau belum.
- Mengambil data dari tabel master dan memeriksa relasinya dengan tabel referensi.
- Menyederhanakan pembuatan dropdown yang dinamis.