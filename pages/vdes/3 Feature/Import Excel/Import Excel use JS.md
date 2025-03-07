# Tutorial Mengimpor Data Excel ke Database Menggunakan SheetJS

Pada tutorial ini, kita akan mempelajari cara mengubah data dari file Excel (XLSX) menjadi format tabel di database menggunakan SheetJS. Metode ini lebih modern dan efisien dibandingkan dengan menggunakan PHPExcel, karena pemrosesan dilakukan di sisi klien (browser) sehingga mengurangi beban server.

## Daftar Isi
1. [Pendahuluan](#1-pendahuluan)
2. [Persiapan](#2-persiapan)
3. [Struktur File Excel](#3-struktur-file-excel)
4. [Implementasi Frontend](#4-implementasi-frontend)
5. [Implementasi Backend](#5-implementasi-backend)
6. [Validasi Data](#6-validasi-data)
7. [Penyimpanan Data ke Database](#7-penyimpanan-data-ke-database)
8. [Tips dan Troubleshooting](#8-tips-dan-troubleshooting)

## 1. Pendahuluan

Mengimpor data dari file Excel ke database adalah fitur yang sangat berguna untuk aplikasi web, terutama untuk memasukkan data dalam jumlah besar dengan cepat dan efisien. Dengan menggunakan SheetJS, kita dapat memproses file Excel langsung di browser pengguna, sehingga:

- Mengurangi beban server
- Memberikan preview data secara instan
- Tidak memerlukan instalasi library tambahan di server
- Mendukung berbagai format file Excel

## 2. Persiapan

Sebelum memulai, pastikan Anda memiliki komponen berikut:

- Library SheetJS (melalui CDN): `https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js`
- Form upload dengan atribut `enctype="multipart/form-data"`
- Controller dengan fungsi untuk memproses data JSON dari SheetJS
- Database untuk menyimpan data yang diimpor

### Menambahkan Library SheetJS

Tambahkan script SheetJS ke file header.php:

```html
<!-- SheetJS - Library untuk membaca file Excel -->
<script src="https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js"></script>
```

## 3. Struktur File Excel

File Excel yang digunakan harus memiliki format tertentu dengan kolom-kolom sesuai struktur tabel di database. Contoh format yang digunakan dalam aplikasi ini:

| Nama Barang | Harga Barang | Stock | Kategori | Supplier |
|-------------|--------------|-------|----------|----------|
| Laptop Asus | 12000000     | 10    | 1        | 2        |
| Mouse Logitech | 150000   | 25    | 3        | 2        |

> **Catatan**: Baris pertama biasanya berisi header dan akan dilewati saat proses impor.

## 4. Implementasi Frontend

### Form Upload File

Pertama, buat form untuk upload file Excel:

```html
<!-- Button untuk membuka modal import Excel -->
<a href="#" class="btn bg-success-400 btn-sx btn-labeled" id="importExcelButton" data-toggle="modal" data-target="#modal_import_excel" title="Import from Excel">
  <b><i class="icon-file-excel"></i></b> Import Excel
</a>

<?php if(isset($_SESSION['flash_message'])): ?>
<div class="alert alert-<?php echo $_SESSION['flash_message']['type']; ?> alert-dismissible mt-10">
  <button type="button" class="close" data-dismiss="alert"><span>&times;</span></button>
  <?php echo $_SESSION['flash_message']['message']; ?>
  <?php unset($_SESSION['flash_message']); ?>
</div>
<?php endif; ?>
```
```html
<!-- Modal Import Excel -->
<div id="modal_import_excel" class="modal fade">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header bg-success">
        <button type="button" class="close" data-dismiss="modal">&times;</button>
        <h6 class="modal-title"><i class="icon-file-excel" title="Import Excel"></i>&nbsp; Import Data dari Excel</h6>
      </div>
      <form action="<?php echo $data['curl'] ?>/import_excel" method="post" enctype="multipart/form-data" id="excelUploadForm">
        <div class="modal-body">
          <div class="form-group">
            <label>Pilih File Excel (*.xlsx):</label>
            <input type="file" name="excel_file" class="form-control" accept=".xlsx" required>
          </div>
          <!-- // ----------- Disesuaikan kembali sesuai dengan stuktur table ----------- -->
          <div class="alert alert-info">
            <strong>Catatan:</strong> Format Excel harus sesuai dengan kolom berikut:
            <ul>
              <li>Nama Barang</li>
              <li>Harga Barang</li>
              <li>Stock</li>
              <li>Kategori (ID)</li>
              <li>Supplier (ID)</li>
            </ul>
            <a href="<?php echo $data['curl'] ?>/generate_template_excel" class="btn btn-xs bg-slate">Download Template</a>
          </div>
          <!-- // ----------- ----------------------------------------------- ----------- -->
           <div id="import-warning" style="display:none;"></div>
          <div id="preview-container" style="display:none;">
            <h6 class="text-semibold">Preview Data:</h6>
            <div class="table-responsive">
              <table class="table table-bordered table-striped" id="preview-table">
                <thead>
                  <tr>
                    <!-- // ----------- Disesuaikan kembali sesuai dengan stuktur table ----------- -->
                    <th>Nama Barang</th>
                    <th>Harga</th>
                    <th>Stock</th>
                    <th>Kategori</th>
                    <th>Supplier</th>
                  </tr>
                  <!-- // ----------- ----------------------------------------------- ----------- -->
                </thead>
                <tbody>
                  <!-- Preview data akan ditampilkan di sini -->
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-default" data-dismiss="modal">Batal</button>
          <button type="submit" class="btn btn-success" id="btn-import-excel" disabled>Import Data</button>
        </div>
      </form>
    </div>
  </div>
</div>
```

### JavaScript untuk Membaca dan Preview Data Excel

Berikut kode JavaScript untuk membaca file Excel menggunakan SheetJS dan menampilkan preview data sebelum diimpor:

```javascript
//Diletakkan dalam document.ready
$(document).ready(function(){
  //---- Code Lain

  // Fungsi untuk file upload excel (menggunakan SheetJS)
  $('input[name="excel_file"]').on('change', function() {
    var fileInput = this;
    if (fileInput.files && fileInput.files[0]) {
      var file = fileInput.files[0];

      // Disable tombol import terlebih dahulu sampai validasi selesai
      $('#btn-import-excel').prop('disabled', true);
      
      // Baca file Excel menggunakan SheetJS
      var reader = new FileReader();
      reader.onload = function(e) {
        try {
          var data = e.target.result;
          var workbook = XLSX.read(data, {type: 'binary'});
          var firstSheet = workbook.SheetNames[0];
          var worksheet = workbook.Sheets[firstSheet];
          
          // Konversi ke array JSON
          var jsonData = XLSX.utils.sheet_to_json(worksheet, {header: 'A'});
          
          // ----------- Disesuaikan kembali sesuai dengan stuktur table -----------
          // Proses data untuk format yang diharapkan
          var processedData = [];
          for (var i = 1; i < jsonData.length; i++) { // Skip header row (index 0)
            var row = jsonData[i];
            processedData.push({
              'nama_barang': row.A || '',
              'harga_barang': row.B || '',
              'stock': row.C || '',
              'kategori': row.D || '',
              'supplier': row.E || '',
              'excel_row': i + 1
            });
          }
          // ----------- ----------------------------------------------- -----------
          
          // Kirim data ke server untuk preview
          $.ajax({
            url: url + 'preview_excel',
            type: 'POST',
            data: JSON.stringify({data: processedData}),
            contentType: 'application/json',
            success: function(response) {
              try {
                var result = (typeof response === 'string') ? JSON.parse(response) : response;
                if (result.status == 'success') {

                  // Tampilkan data valid di preview untuk data valid
                  $('#preview-container').show();
                  var tableBody = $('#preview-table tbody');
                  tableBody.empty();
                  
                  // ----------- Disesuaikan kembali sesuai dengan stuktur table -----------
                  // Tampilkan maksimal 5 baris data preview
                  var previewData = result.data.slice(0, 5);
                  $.each(previewData, function(i, row) {
                    tableBody.append('<tr>' +
                      '<td>' + row.nama_barang + '</td>' +
                      '<td>Rp ' + parseFloat(row.harga_barang).toLocaleString('id-ID') + '</td>' +
                      '<td>' + row.stock + '</td>' +
                      '<td>' + row.kategori + '</td>' +
                      '<td>' + row.supplier + '</td>' +
                      '</tr>');
                  });
                  // ----------- ----------------------------------------------- -----------
                  
                  if (result.data.length > 5) {
                    tableBody.append('<tr><td colspan="5" class="text-center">... dan ' + (result.data.length - 5) + ' data lainnya</td></tr>');
                  }

                  // Jika ada data invalid, tampilkan pop-up dan disable tombol import
                  if (result.has_invalid_data) {
                    showInvalidDataModal(result.invalid_data);
                    $('#btn-import-excel').prop('disabled', true);
                    
                    // Tambahkan pesan warning di atas tombol import
                    $('#import-warning').html(
                      '<div class="alert alert-warning">' +
                      '<i class="icon-warning2"></i> Terdapat ' + result.invalid_data.length + ' data yang bermasalah. ' +
                      'Silakan perbaiki data di file Excel Anda sebelum melakukan import.' +
                      '</div>'
                    ).show();
                  } else {
                    // Jika semua data valid, enable tombol import
                    $('#btn-import-excel').prop('disabled', false);
                    $('#import-warning').hide();
                  }
                } else {
                  alert(result.message);
                  $('#preview-container').hide();
                  $('#btn-import-excel').prop('disabled', true);
                }
              } catch (e) {
                console.error(e);
                alert('Terjadi kesalahan saat memproses file');
                $('#btn-import-excel').prop('disabled', true);
              }
            },
            error: function() {
              alert('Gagal mengunggah file untuk preview');
              $('#btn-import-excel').prop('disabled', true);
            }
          });
        } catch (e) {
          console.error(e);
          alert('Terjadi kesalahan saat membaca file Excel');
          $('#btn-import-excel').prop('disabled', true);
        }
      };
      
      // Baca file sebagai binary string
      reader.readAsBinaryString(file);
    }
  });
});
```
### JavaScript untuk Tempat dan Preview Data Excel Yang gagal

Berikut kode JavaScript untuk membaca file Excel menggunakan SheetJS dan menampilkan preview data yang gagal:

```javascript
  // Fungsi untuk menampilkan modal data invalid
  function showInvalidDataModal(invalidData) {
    // Buat modal jika belum ada
    if ($('#modal_invalid_data').length === 0) {
      var modalHtml = `
        <div id="modal_invalid_data" class="modal fade">
          <div class="modal-dialog modal-lg">
            <div class="modal-content">
              <div class="modal-header bg-warning">
                <button type="button" class="close" data-dismiss="modal">&times;</button>
                <h6 class="modal-title"><i class="icon-warning2"></i>&nbsp; Data Yang Bermasalah</h6>
              </div>
              <div class="modal-body">
                <div class="alert alert-warning">
                  <strong>Perhatian!</strong> Beberapa data tidak dapat diproses karena terdapat kesalahan.
                  Silakan periksa data berikut dan perbaiki file Excel Anda.
                </div>
                <div class="table-responsive">
                  <table class="table table-bordered table-striped">
                    <thead>
                      <tr>
                        <th>Baris Excel</th>
                        <th>Nama Barang</th>
                        <th>Harga</th>
                        <th>Stock</th>
                        <th>Kategori</th>
                        <th>Supplier</th>
                        <th>Keterangan Error</th>
                      </tr>
                    </thead>
                    <tbody id="invalid-data-table">
                    </tbody>
                  </table>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-link" data-dismiss="modal">Tutup</button>
              </div>
            </div>
          </div>
        </div>
      `;
      $('body').append(modalHtml);
    }

    // Isi tabel dengan data invalid
    var tableBody = $('#invalid-data-table');
    tableBody.empty();
    
    $.each(invalidData, function(i, row) {
      tableBody.append('<tr class="' + (row.error_type === 'kategori' ? 'bg-danger-100' : (row.error_type === 'supplier' ? 'bg-warning-100' : '')) + '">' +
        '<td><strong>' + row.excel_row + '</strong></td>' +
        '<td>' + (row.nama_barang || '-') + '</td>' +
        '<td>' + (row.harga_barang ? 'Rp ' + parseFloat(row.harga_barang).toLocaleString('id-ID') : '-') + '</td>' +
        '<td>' + (row.stock || '-') + '</td>' +
        '<td>' + (row.kategori || '-') + '</td>' +
        '<td>' + (row.supplier || '-') + '</td>' +
        '<td>' + row.error_message + '</td>' +
        '</tr>');
    });

    // Tampilkan modal
    $('#modal_invalid_data').modal('show');
  }
```

### JavaScript untuk Submit Form

Berikut kode JavaScript untuk mengirim data Excel ke server saat form disubmit:

```javascript
$(document).ready(function(){
  //-------Code Lain

  // Override form submit untuk menggunakan SheetJS
  $('#excelUploadForm').on('submit', function(e) {
    e.preventDefault();
    
    if(!confirm('Apakah Anda yakin akan mengimpor data dari file Excel ini?')) {
      return false;
    }
    
    var fileInput = $('input[name="excel_file"]')[0];
    if (fileInput.files && fileInput.files[0]) {
      var file = fileInput.files[0];
      
      // Baca file Excel menggunakan SheetJS
      var reader = new FileReader();
      reader.onload = function(e) {
        try {
          var data = e.target.result;
          var workbook = XLSX.read(data, {type: 'binary'});
          var firstSheet = workbook.SheetNames[0];
          var worksheet = workbook.Sheets[firstSheet];
          
          // Konversi ke array JSON
          var jsonData = XLSX.utils.sheet_to_json(worksheet, {header: 'A'});
          
          // ----------- Disesuaikan kembali sesuai dengan stuktur table -----------
          // Proses data untuk format yang diharapkan
          var processedData = [];
          for (var i = 1; i < jsonData.length; i++) { // Skip header row (index 0)
            var row = jsonData[i];
            processedData.push({
              'nama_barang': row.A || '',
              'harga_barang': row.B || '',
              'stock': row.C || '',
              'kategori': row.D || '',
              'supplier': row.E || ''
            });
          }
          // ----------- ----------------------------------------------- -----------
          
          // Kirim data ke server untuk proses import
          $.ajax({
            url: url + 'import_excel',
            type: 'POST',
            data: JSON.stringify({data: processedData}),
            contentType: 'application/json',
            success: function(response) {
              try {
                // Redirect ke halaman produk setelah selesai
                window.location.href = url;
              } catch (e) {
                console.error(e);
                alert('Terjadi kesalahan saat memproses file');
              }
            },
            error: function() {
              alert('Gagal mengimpor data');
            }
          });
        } catch (e) {
          console.error(e);
          alert('Terjadi kesalahan saat membaca file Excel');
        }
      };
      
      // Baca file sebagai binary string
      reader.readAsBinaryString(file);
    }
  });
});
```

## 5. Implementasi Backend

### Fungsi Preview Excel

Fungsi ini menerima data JSON dari SheetJS dan mengembalikan preview data dalam format JSON:

```php
/**
 * Fungsi untuk preview data Excel sebelum diimport
 */
public function preview_excel()
{
    // Cek apakah request menggunakan format JSON (SheetJS) atau form data (PHPExcel)
    $contentType = isset($_SERVER["CONTENT_TYPE"]) ? trim($_SERVER["CONTENT_TYPE"]) : '';
    
    if (strpos($contentType, 'application/json') !== false) {
        // Proses data JSON dari SheetJS
        $json = file_get_contents('php://input');
        $requestData = json_decode($json, true);
        
        if (json_last_error() !== JSON_ERROR_NONE || !isset($requestData['data']) || !is_array($requestData['data'])) {
            echo json_encode(['status' => 'error', 'message' => 'Format data tidak valid']);
            exit;
        }
        
        // Data preview langsung dari request JSON
        $data = $requestData['data'];
        echo json_encode(['status' => 'success', 'data' => $data]);
        exit;
    } else {
        // Untuk kompatibilitas dengan form upload tradisional
        // Cek apakah file telah diupload
        if (!isset($_FILES['excel_file']) || empty($_FILES['excel_file']['name'])) {
            echo json_encode(['status' => 'error', 'message' => 'File tidak ditemukan']);
            exit;
        }

        // Cek tipe file
        $ext = pathinfo($_FILES['excel_file']['name'], PATHINFO_EXTENSION);
        if ($ext != 'xlsx') {
            echo json_encode(['status' => 'error', 'message' => 'File harus berformat .xlsx']);
            exit;
        }
        
        // Pesan untuk mengarahkan pengguna menggunakan SheetJS
        echo json_encode([
            'status' => 'error', 
            'message' => 'Browser Anda tidak mendukung fitur modern. Silakan gunakan browser terbaru untuk mengimpor data Excel.'
        ]);
        exit;
    }
}
```

### Fungsi Import Excel

Fungsi ini menerima data JSON dari SheetJS dan mengimpor data ke database:

```php
/**
 * Fungsi untuk mengimport data Excel ke database
 */
public function import_excel()
{
    // Cek apakah request menggunakan format JSON (SheetJS) atau form data (PHPExcel)
    $contentType = isset($_SERVER["CONTENT_TYPE"]) ? trim($_SERVER["CONTENT_TYPE"]) : '';
    
    // Load model
    $model = $this->loadModel($this->model);
    
    if (strpos($contentType, 'application/json') !== false) {
        // Proses data JSON dari SheetJS
        $json = file_get_contents('php://input');
        $requestData = json_decode($json, true);
        
        if (json_last_error() !== JSON_ERROR_NONE || !isset($requestData['data']) || !is_array($requestData['data'])) {
            $this->setFlashData('error', 'Format data tidak valid');
            echo json_encode(['status' => 'error', 'message' => 'Format data tidak valid']);
            exit;
        }
        
        $berhasil = 0;
        $gagal = 0;
        foreach ($requestData['data'] as $rowData) {
          // ----------- Disesuaikan kembali sesuai dengan stuktur table -----------
          // Data yang akan disimpan
            $data = array(
                'nama_barang' => $rowData['nama_barang'],
                'harga_barang' => str_replace(',', '', $rowData['harga_barang']),
                'stock' => $rowData['stock'],
                'kategori' => $rowData['kategori'],
                'supplier' => $rowData['supplier'],
                'autocode' => $model->autocode($this->table, "PROD-")
            );
            
            // Validasi data
            if (empty($data['nama_barang']) || empty($data['harga_barang']) || empty($data['stock']))) {
                $gagal++;
                continue;
            }
            // ----------- Untuk Bagian ini, disesuaikan dengan Model karena memanggil data table lain (biasanyanya ComboBox) -----------
            // Validasi kategori dan supplier
            $data['kategori'] = $model->validate_kategori($data['kategori']);
            $data['supplier'] = $model->validate_supplier($data['supplier']);
            // ----------- ----------------------------------------------- -----------
            
            // Simpan ke database
            $result = $model->msave($this->table, $data, $this->title);
            if ($result) {
                $berhasil++;
            } else {
                $gagal++;
            }
        }
        
        $this->setFlashData('success', "Import Excel berhasil. Data berhasil diimport: $berhasil, Gagal: $gagal");
        echo json_encode(['status' => 'success', 'message' => "Import Excel berhasil. Data berhasil diimport: $berhasil, Gagal: $gagal"]);
        exit;
    } else {
        // Untuk kompatibilitas dengan form upload tradisional
        // Cek apakah file telah diupload
        if (!isset($_FILES['excel_file']) || empty($_FILES['excel_file']['name'])) {
            $this->setFlashData('error', 'File tidak ditemukan');
            $this->redirect('product');
            exit;
        }

        // Cek tipe file
        $ext = pathinfo($_FILES['excel_file']['name'], PATHINFO_EXTENSION);
        if ($ext != 'xlsx') {
            $this->setFlashData('error', 'File harus berformat .xlsx');
            $this->redirect('product');
            exit;
        }
        
        // Pesan untuk mengarahkan pengguna menggunakan SheetJS
        $this->setFlashData('error', 'Browser Anda tidak mendukung fitur modern. Silakan gunakan browser terbaru untuk mengimpor data Excel.');
        $this->redirect('product');
        exit;
    }
}
```

### Fungsi Flash Message

Fungsi untuk menyimpan pesan flash ke session:

```php
/**
 * Method untuk menyimpan flash message ke session
 */
private function setFlashData($type, $message)
{
    $_SESSION['flash_message'] = [
        'type' => $type,
        'message' => $message
    ];
}
```

## 6. Validasi Data

Validasi data sangat penting untuk memastikan hanya data yang valid yang dimasukkan ke database. Berikut contoh fungsi validasi yang digunakan:

```php
/**
 * Metode untuk validasi dan mencari kategori berdasarkan ID atau nama
 * 
 * @param mixed $kategori_input ID atau nama kategori
 * @return int ID kategori yang valid atau 0 jika tidak ditemukan
 */
public function validate_kategori($kategori_input)
{
    // Jika input berupa angka, coba cari berdasarkan ID
    if (is_numeric($kategori_input)) {
        $exists = $this->getval('m_categories', 'autono', 'autono', $kategori_input);
        if ($exists) {
            return $kategori_input;
        }
    }
    
    // Jika bukan angka atau ID tidak ditemukan, cari berdasarkan nama
    $kategori_id = $this->getval('m_categories', 'autono', 'nama_kategori', $kategori_input);
    return $kategori_id ? $kategori_id : 0;
}

/**
 * Metode untuk validasi dan mencari supplier berdasarkan ID atau nama
 * 
 * @param mixed $supplier_input ID atau nama supplier
 * @return int ID supplier yang valid atau 0 jika tidak ditemukan
 */
public function validate_supplier($supplier_input)
{
    // Jika input berupa angka, coba cari berdasarkan ID
    if (is_numeric($supplier_input)) {
        $exists = $this->getval('m_supplier', 'autono', 'autono', $supplier_input);
        if ($exists) {
            return $supplier_input;
        }
    }
    
    // Jika bukan angka atau ID tidak ditemukan, cari berdasarkan nama
    $supplier_id = $this->getval('m_supplier', 'autono', 'nama_supplier', $supplier_input);
    return $supplier_id ? $supplier_id : 0;
}
```

## 7. Penyimpanan Data ke Database

Data yang telah divalidasi kemudian disimpan ke database menggunakan fungsi `msave()`:

```php
// Simpan ke database
$result = $model->msave($this->table, $data, $this->title);
```

## 8. Tips dan Troubleshooting

### Keuntungan Menggunakan SheetJS

1. **Pemrosesan di Sisi Klien**:
   - Mengurangi beban server
   - Preview data lebih cepat
   - Tidak perlu menginstal library tambahan di server

2. **Dukungan Format yang Luas**:
   - Mendukung berbagai format Excel (.xlsx, .xls, .csv, dll)
   - Kompatibel dengan semua browser modern

3. **Kemudahan Penggunaan**:
   - API yang sederhana dan mudah dipahami
   - Dokumentasi yang lengkap

### Penanganan Error

Beberapa tips untuk menangani error umum:

1. **File Format Tidak Cocok**:
   - Pastikan file Excel menggunakan format yang didukung
   - Berikan template yang bisa diunduh pengguna

2. **Data Tidak Valid**:
   - Implementasikan validasi data untuk setiap kolom
   - Tampilkan pesan error yang jelas

3. **Masalah Browser**:
   - Pastikan browser pengguna mendukung FileReader API
   - Berikan fallback untuk browser lama

4. **Masalah Keamanan**:
   - Validasi data di sisi server sebelum disimpan ke database
   - Gunakan prepared statements untuk mencegah SQL injection

### Contoh Template Excel

Sediakan template Excel yang bisa diunduh pengguna untuk memudahkan pengisian data dengan format yang benar. Template ini harus memiliki header yang sesuai dengan struktur tabel di database.

### Keamanan

Selalu validasi data yang diterima dari klien untuk mencegah serangan:
- Validasi format dan struktur data
- Bersihkan input sebelum disimpan ke database
- Gunakan prepared statements untuk query database

---
