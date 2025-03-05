# Pendahuluan

Pada tutorial ini, kita akan mempelajari cara mengubah data dari file Excel (XLSX) menjadi format tabel di aplikasi web. Tutorial ini menggunakan contoh implementasi dari sistem manajemen produk yang sudah ada. Proses ini sangat berguna untuk mengimpor data dalam jumlah besar tanpa harus menginput secara manual satu per satu.

## Daftar Isi
1. [Persiapan](#1-persiapan)
2. [Struktur File Excel](#2-struktur-file-excel)
3. [Implementasi Frontend](#3-implementasi-frontend)
4. [Implementasi Backend](#4-implementasi-backend)
5. [Validasi Data](#5-validasi-data)
6. [Penyimpanan Data ke Database](#6-penyimpanan-data-ke-database)
7. [Tips dan Troubleshooting](#7-tips-dan-troubleshooting)

## 1. Persiapan

Sebelum memulai, pastikan Anda memiliki komponen berikut:

- Library PHPExcel untuk membaca file XLSX (sudah terinstal di direktori `lib/PHPExcel`)
- Form upload dengan atribut `enctype="multipart/form-data"`
- Controller dengan fungsi untuk memproses file Excel
- Database untuk menyimpan data yang diimpor

## 2. Struktur File Excel

File Excel yang digunakan harus memiliki format tertentu dengan kolom-kolom sesuai struktur tabel di database. Contoh format yang digunakan dalam aplikasi ini:

| Nama Barang | Harga Barang | Stock | Kategori | Supplier |
|-------------|--------------|-------|----------|----------|
| Laptop Asus | 12000000     | 10    | 1        | 2        |
| Mouse Logitech | 150000   | 25    | 3        | 2        |

> **Catatan**: Baris pertama biasanya berisi header dan akan dilewati saat proses impor.

## 3. Implementasi Frontend

### Form Upload File

Pertama, buat form untuk upload file Excel:
1. Button View
```html
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

2. Fungsi View
```html
  <!-- Import Excel modal -->
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
            <div class="alert alert-info">
              <strong>Catatan:</strong> Format Excel harus sesuai dengan kolom berikut:
              <ul>
                <!-- Disesuaikan kembali sesuai dengan stuktur table -->
                <li>Nama Barang</li>
                <li>Harga Barang</li>
                <li>Stock</li>
                <li>Kategori (ID)</li>
                <li>Supplier (ID)</li>
                <!-- ------------------------------------------------ -->
              </ul>
              <a href="<?php echo BASE_URL ?>static/files/template/template_product_import.xlsx" class="btn btn-xs bg-slate">Download Template</a>
            </div>
            <div id="preview-container" style="display:none;">
              <h6 class="text-semibold">Preview Data:</h6>
              <div class="table-responsive">
                <table class="table table-bordered table-striped" id="preview-table">
                  <thead>
                    <tr>
                      <!-- Disesuaikan kembali sesuai dengan stuktur table -->
                      <th>Nama Barang</th>
                      <th>Harga</th>
                      <th>Stock</th>
                      <th>Kategori</th>
                      <th>Supplier</th>
                      <!-- ------------------------------------------------ -->
                    </tr>
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
            <button type="submit" class="btn btn-success">Import Data</button>
          </div>
        </form>
      </div>
    </div>
  </div>
  <!-- /Import Excel modal -->
```

### JavaScript untuk Preview Data

Berikut kode JavaScript untuk menampilkan preview data dari file Excel sebelum diimpor:

```javascript
  //Diletakkan dalam document.ready
  $(document).ready(function() {
    
    // Fungsi untuk file upload excel
    $('input[name="excel_file"]').on('change', function() {
      var fileInput = this;
      if (fileInput.files && fileInput.files[0]) {
        var formData = new FormData();
        formData.append('excel_file', fileInput.files[0]);
        
        $.ajax({
          url: url + 'preview_excel',
          type: 'POST',
          data: formData,
          contentType: false,
          processData: false,
          success: function(response) {
            try {
              var data = JSON.parse(response);
              if (data.status == 'success') {
                $('#preview-container').show();
                var tableBody = $('#preview-table tbody');
                tableBody.empty();
                // ----------- Disesuaikan kembali sesuai dengan stuktur table -----------
                // Tampilkan maksimal 5 baris data preview
                var previewData = data.data.slice(0, 5);
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
                
                if (data.data.length > 5) {
                  tableBody.append('<tr><td colspan="5" class="text-center">... dan ' + (data.data.length - 5) + ' data lainnya</td></tr>');
                }
              } else {
                alert(data.message);
                $('#preview-container').hide();
              }
            } catch (e) {
              console.error(e);
              alert('Terjadi kesalahan saat memproses file');
            }
          },
          error: function() {
            alert('Gagal mengunggah file untuk preview');
          }
        });
      }
    });
    
    $('#excelUploadForm').on('submit', function(e) {
      if(!confirm('Apakah Anda yakin akan mengimpor data dari file Excel ini?')) {
        e.preventDefault();
      }
    });

    // Konfirmasi sebelum submit form
    $('#excelUploadForm').on('submit', function(e) {
      if(!confirm('Apakah Anda yakin akan mengimpor data dari file Excel ini?')) {
        e.preventDefault();
      }
    });
  });
```

## 4. Implementasi Backend

### Fungsi Preview Excel

Fungsi ini memproses file Excel yang diupload dan mengembalikan preview data dalam format JSON:

```php
/**
	 * Fungsi untuk preview data Excel sebelum diimport
	 */
public function preview_excel()
{
    // Matikan pesan error untuk mengatasi masalah syntax deprecated di PHPExcel
    error_reporting(E_ALL & ~E_DEPRECATED & ~E_NOTICE);
    ini_set('display_errors', 0);
    
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

    // Load library PHPExcel
    include APP_DIR.'lib/PHPExcel/PHPExcel.php';
    
    try {
        // Upload file sementara
        $file = $_FILES['excel_file']['tmp_name'];
        
        // Baca file Excel
        $excelreader = new PHPExcel_Reader_Excel2007();
        $loadexcel = $excelreader->load($file);
        $sheet = $loadexcel->getActiveSheet()->toArray(null, true, true, true);
        
        // Data preview
        $data = [];
        $numrow = 1;
        
        foreach($sheet as $row) {
            // Lewati baris header (baris ke-1)
            if($numrow > 1) {
                // ----------- Disesuaikan kembali sesuai dengan stuktur table -----------
                // Pastikan format kolom sesuai
                $rowData = [
                    'nama_barang' => $row['A'],
                    'harga_barang' => $row['B'],
                    'stock' => $row['C'],
                    'kategori' => $row['D'],
                    'supplier' => $row['E']
                ];
                // ----------- ----------------------------------------------- -----------
                $data[] = $rowData;
            }
            $numrow++;
        }
        
        echo json_encode(['status' => 'success', 'data' => $data]);
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => 'Error: ' . $e->getMessage()]);
    }
}
```

### Fungsi Import Excel

Fungsi ini mengimpor data dari file Excel ke database:

```php
	/**
	 * Fungsi untuk mengimport data Excel ke database
	 */
public function import_excel()
{
    // Matikan pesan error untuk mengatasi masalah syntax deprecated di PHPExcel
    error_reporting(E_ALL & ~E_DEPRECATED & ~E_NOTICE);
    ini_set('display_errors', 0);
    ob_start(); // Mulai output buffering untuk mencegah error header
    
    // Load model
    $model = $this->loadModel($this->model);
    
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

    // Load library PHPExcel
    include APP_DIR.'lib/PHPExcel/PHPExcel.php';
    
    try {
        // Upload file sementara
        $file = $_FILES['excel_file']['tmp_name'];
        
        // Baca file Excel
        $excelreader = new PHPExcel_Reader_Excel2007();
        $loadexcel = $excelreader->load($file);
        $sheet = $loadexcel->getActiveSheet()->toArray(null, true, true, true);
        
        // Mulai dari baris ke-2 (baris pertama adalah header)
        $numrow = 1;
        $berhasil = 0;
        $gagal = 0;
        
        foreach($sheet as $row) {
            // Lewati baris header (baris ke-1)
            if($numrow > 1) {
                // ----------- Disesuaikan kembali sesuai dengan stuktur table -----------
                // Data yang akan disimpan
                $data = array(
                    'nama_barang' => $row['A'],
                    'harga_barang' => str_replace(',', '', $row['B']), // Hapus koma jika ada
                    'stock' => $row['C'],
                    'kategori' => $row['D'],
                    'supplier' => $row['E'],
                    'autocode' => $model->autocode($this->table, "PROD-")
                );
                
                // Validasi data
                if (empty($data['nama_barang']) || empty($data['harga_barang']) || empty($data['stock'])) {
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
            $numrow++;
        }
        
        $this->setFlashData('success', "Import Excel berhasil. Data berhasil diimport: $berhasil, Gagal: $gagal");
    } catch (Exception $e) {
        $this->setFlashData('error', 'Error: ' . $e->getMessage());
    }
    
    ob_end_flush(); // Flush output buffer
    $this->redirect('product');
}
```

### Fungsi Import Excel
Fungsi setFlashData bila belum ada
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

## 5. Validasi Data

Validasi data sangat penting untuk memastikan hanya data yang valid yang dimasukkan ke database. Berikut contoh fungsi validasi yang digunakan:

```php
	/**
	 * Metode untuk validasi dan mencari kategori berdasarkan ID atau nama
	 * 
	 * @param mixed $kategori_input ID atau nama kategori
	 * @return int ID kategori yang valid atau 0 jika tidak ditemukan
	 */
// Validasi kategori (pastikan ID kategori valid)
public function validate_kategori($kategori_input)
{
    // Cek apakah kategori adalah angka (ID)
    if (is_numeric($kategori_input)) {
        // Cek apakah ID kategori ada di database
        $query = $this->db->prepare("SELECT id FROM kategori WHERE id = :id");
        $query->execute(['id' => $kategori_input]);
        if ($query->rowCount() > 0) {
            return $kategori_input;
        }
    } else {
        // Jika bukan angka, cari berdasarkan nama kategori
        $query = $this->db->prepare("SELECT id FROM kategori WHERE nama_kategori LIKE :nama");
        $query->execute(['nama' => "%$kategori_input%"]);
        if ($query->rowCount() > 0) {
            $result = $query->fetch();
            return $result['id'];
        }
    }
    
    // Default kategori jika tidak ditemukan
    return 1; // ID kategori default
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

## 6. Penyimpanan Data ke Database

Data yang telah divalidasi kemudian disimpan ke database menggunakan fungsi `msave()`:

```php
// Simpan data ke database
$result = $model->msave($this->table, $data, $this->title);
```

Fungsi `msave()` pada model:

```php
public function msave($table, $data = array(), $title = null)
{
  $result = $this->sqlinsert($table, $data, $title);
  return $result;
}
```

## 7. Tips dan Troubleshooting

### Penanganan Error

Beberapa tips untuk menangani error umum:

1. **File Format Tidak Cocok**:
   - Pastikan file Excel menggunakan format `.xlsx` (Excel 2007+)
   - Berikan template yang bisa diunduh pengguna

2. **Data Tidak Valid**:
   - Implementasikan validasi data untuk setiap kolom
   - Tampilkan pesan error yang jelas

3. **Masalah Performance**:
   - Proses file besar secara batch
   - Gunakan transaksi database untuk operasi CRUD massal

4. **Masalah Library PHPExcel**:
   - Library PHPExcel mungkin menampilkan deprecated warnings di PHP 7+
   - Gunakan `error_reporting()` untuk menekan warnings

### Contoh Template Excel

Sediakan template Excel yang bisa diunduh pengguna untuk memudahkan pengisian data dengan format yang benar.

### Keamanan

Selalu validasi file yang diupload untuk mencegah serangan:
- Cek ekstensi file
- Batasi ukuran file
- Validasi format dan struktur data
- Bersihkan input sebelum disimpan ke database

---

Dengan mengikuti tutorial ini, Anda dapat mengimplementasikan fitur impor data dari Excel ke tabel di aplikasi web Anda. Fitur ini sangat berguna untuk memasukkan data dalam jumlah besar dengan cepat dan efisien.

Semoga tutorial ini bermanfaat. Jika ada pertanyaan lebih lanjut, silakan ajukan di kolom komentar.
