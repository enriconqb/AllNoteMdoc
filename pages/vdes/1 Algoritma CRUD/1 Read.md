# **Panduan Membuat CRUD dengan VDES Framework**

## **1. Membuat Struktur Menu di VDES**
- **Navigasi ke Menu Design**:
  - Buka aplikasi VDES.
  - Pilih: `Utility > Development > VDES Framework > Menu Design`.

- **Menambahkan Parent Folder**:
  - Klik *Add Parent* untuk membuat folder utama.
  - Jika perlu, tambahkan sub-menu dengan memilih *Add Sub Menu Folder*.

- **Pilih Mode CRUD**:
  - Saat membuat menu, pastikan untuk memilih mode CRUD agar sistem dapat melakukan operasi Create, Read, Update, dan Delete.

---

## **2. Menambahkan Kolom Tabel**
- **Ketentuan untuk Kolom Input Combo-Box**:
  - **Tabel Acuan**: Pastikan sudah ada tabel acuan yang akan digunakan.
  - **Type**: Harus bertipe `int` karena akan digunakan sebagai acuan `autonos`.
  - **Length**: Tentukan panjang kolom antara 5-11 sesuai kebutuhan.
  
- **Input Lainnya**: Untuk kolom input lainnya, Anda dapat menggunakan tipe data sesuai kebutuhan.

- **Generate CRUD**: Setelah semua kolom ditambahkan, klik *Generate CRUD* untuk membuat operasi dasar.

---

## **3. Penyesuaian Kode di Code Editor**
- **Perbaiki Fungsi Pemanggilan pada Controller**:
  - **Fungsi Get**:
    ```php
    // Konfigurasi kolom DataTables: Mapping kolom database ke index kolom tampilan [[7]]
    // Format: [db: kolom database, dt: index kolom DataTables, formatter: fungsi format opsional]
    $columns = array(
      array( 
          'db' => 'autono', // Primary key tabel (di-encode base64 untuk keamanan) [[6]]
          'dt' => 0, 
          'formatter' => function( $d, $row ) { 
              return $this->base64url_encode($d); // Encode ID untuk parameter URL [[9]]
          } 
      ),
      array( 'db' => 'nama_pelanggan', 'dt' => 1 ), // Kolom 1: Nama pelanggan
      array( 'db' => 'no_telepon',     'dt' => 2 ), // Kolom 2: Nomor telepon
      array( 'db' => 'alamat',         'dt' => 3 ), // Kolom 3: Alamat lengkap
      array( 'db' => 'email',          'dt' => 4 ), // Kolom 4: Alamat email
      array( 'db' => 'nama_pembayaran','dt' => 5 ), // Kolom 5: Metode pembayaran (hasil JOIN)
    );

    // Konfigurasi JOIN TABLE untuk mengambil data metode pembayaran [[10]]
    // Relasikan tabel utama dengan m_metode_pembayaran via foreign key 'autono'
    $tbljoin = array();
    $tbljoin[] = array(
      'table' => 'm_metode_pembayaran',  // Tabel tujuan JOIN
      'field' => 'favorit_metode_pembayaran', // Field relasi di tabel utama
      'fieldkey' => 'autono',            // Primary key di tabel JOIN
      'fieldname' => 'nama_pembayaran'   // Field yang diambil dari tabel JOIN [[1]]
    );
    ```

- **Fungsi Add**:
    Tentu, saya akan memberikan komentar penjelasan untuk baris kode tersebut. Berikut adalah kode dengan komentar penjelasan:

    ```php
    // Mengambil data combo box untuk metode pembayaran favorit
    $data['favorit_metode_pembayaran'] = $model->get_combo(
        $id,                    // ID dari record yang sedang diedit (jika ada)
        $this->table,           // Nama tabel utama yang sedang diproses
        'm_metode_pembayaran',  // Nama tabel referensi untuk metode pembayaran
        'favorit_metode_pembayaran', // Nama kolom yang menyimpan ID metode pembayaran favorit
        'autono',               // Kolom yang digunakan sebagai value dalam combo box
        'nama_pembayaran'       // Kolom yang digunakan sebagai label dalam combo box
    );
    ```

    Penjelasan lebih detail:

    1. `$data['favorit_metode_pembayaran']`: Ini adalah kunci array yang akan menyimpan hasil dari fungsi `get_combo()`. Data ini kemungkinan akan digunakan untuk menampilkan combo box (dropdown) di view.

    2. `$model->get_combo()`: Ini adalah pemanggilan metode `get_combo()` dari objek model. Metode ini sepertinya dirancang untuk mengambil data yang akan digunakan dalam combo box.

    3. Parameter-parameter yang dikirimkan ke `get_combo()`:
      - `$id`: ID dari record yang sedang diedit (jika ada). Ini mungkin digunakan untuk menandai opsi yang sudah dipilih sebelumnya.
      - `$this->table`: Nama tabel utama yang sedang diproses. Ini mungkin digunakan untuk melakukan join atau pengecekan lain.
      - `'m_metode_pembayaran'`: Nama tabel referensi yang berisi daftar metode pembayaran.
      - `'favorit_metode_pembayaran'`: Nama kolom di tabel utama yang menyimpan ID metode pembayaran favorit.
      - `'autono'`: Kolom dari tabel `m_metode_pembayaran` yang akan digunakan sebagai value dalam combo box. Kemungkinan ini adalah primary key atau ID unik untuk setiap metode pembayaran.
      - `'nama_pembayaran'`: Kolom dari tabel `m_metode_pembayaran` yang akan digunakan sebagai label (teks yang ditampilkan) dalam combo box.

    4. Hasil dari `get_combo()` kemungkinan adalah array yang berisi pasangan key-value, di mana key adalah 'autono' dan value adalah 'nama_pembayaran' dari tabel `m_metode_pembayaran`.

    5. Fungsi ini memungkinkan pembuatan combo box yang dinamis berdasarkan data dari database, memudahkan pengguna untuk memilih metode pembayaran favorit mereka.

    Kode ini merupakan bagian dari pola Model-View-Controller (MVC), di mana data disiapkan di controller (atau model) sebelum dikirimkan ke view untuk ditampilkan sebagai combo box.

- **Fungsi Edit**:
    ```php
    $data['favorit_metode_pembayaran'] = $model->get_combo($id, $this->table, 'm_metode_pembayaran', 'favorit_metode_pembayaran', 'autono', 'nama_pembayaran');
    ```

---

# **Catatan Penting**
- Pastikan semua tabel dan kolom yang diperlukan sudah ada sebelum melakukan pengaturan combo-box.
- Selalu lakukan pengujian setelah setiap perubahan untuk memastikan bahwa semua fungsi berjalan dengan baik.

Dengan mengikuti langkah-langkah di atas, Anda dapat dengan mudah membuat dan mengonfigurasi sistem CRUD menggunakan VDES Framework, serta menyesuaikan kode di controller untuk mendukung penggunaan combo-box.
