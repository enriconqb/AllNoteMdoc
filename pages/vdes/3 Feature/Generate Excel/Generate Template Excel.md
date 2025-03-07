# Tutorial Membuat Template Excel dengan Dropdown Menggunakan PHP

Tutorial ini akan menjelaskan cara membuat template Excel yang memiliki dropdown untuk kolom kategori dan supplier menggunakan PHP. Template ini akan berguna untuk memudahkan pengguna dalam mengisi data produk dengan format yang benar.

## Daftar Isi
1. [Pendahuluan](#1-pendahuluan)
2. [Persiapan](#2-persiapan)
3. [Struktur Template Excel](#3-struktur-template-excel)
4. [Implementasi Kode](#4-implementasi-kode)
5. [Cara Penggunaan](#5-cara-penggunaan)
6. [Tips dan Troubleshooting](#6-tips-dan-troubleshooting)

## 1. Pendahuluan

Membuat template Excel dengan dropdown sangat berguna untuk:
- Memudahkan pengguna memilih kategori dan supplier yang valid
- Mengurangi kesalahan input data
- Mempercepat proses input data
- Memastikan konsistensi data

## 2. Persiapan

Sebelum memulai, pastikan Anda memiliki:
- PHP versi 7.0 atau lebih tinggi
- Ekstensi ZipArchive terinstall
- Database dengan tabel kategori dan supplier
- Model untuk mengakses data kategori dan supplier

### Struktur Database yang Dibutuhkan:

```sql
-- Tabel Kategori
CREATE TABLE m_categories (
    autono INT PRIMARY KEY,
    nama_kategori VARCHAR(255)
);

-- Tabel Supplier
CREATE TABLE m_supplier (
    autono INT PRIMARY KEY,
    nama_supplier VARCHAR(255)
);
```

## 3. Struktur Template Excel

Template Excel yang dihasilkan akan memiliki 3 sheet:
1. **Data Produk**: Sheet utama untuk input data
   - Nama Barang
   - Harga Barang
   - Stock
   - Kategori (dropdown)
   - Supplier (dropdown)

2. **Referensi Kategori**: Berisi daftar kategori
   - ID
   - Nama Kategori

3. **Referensi Supplier**: Berisi daftar supplier
   - ID
   - Nama Supplier

## 4. Implementasi Kode

### Controller Method

```php
	/**
	 * Fungsi untuk menghasilkan template Excel dengan dropdown
	 * Template ini akan memiliki header di baris 1 dan dropdown untuk kategori dan supplier
	 */
	public function generate_template_excel()
	{
		// Load model
		$model = $this->loadModel($this->model);
		
		// Ambil data kategori dan supplier untuk dropdown
		$kategori_data = $model->get_all_categories();
		$supplier_data = $model->get_all_suppliers();
		
		// Buat file Excel menggunakan ZipArchive dan XML
		$tempFile = tempnam(sys_get_temp_dir(), 'excel_template');
		$zip = new ZipArchive();
		
		if ($zip->open($tempFile, ZipArchive::CREATE) !== TRUE) {
			die("Tidak dapat membuat file Excel");
		}
		
		// Tambahkan file [Content_Types].xml
		$contentTypes = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
		<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
			<Default Extension="xml" ContentType="application/xml"/>
			<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
			<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
			<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
			<Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
			<Override PartName="/xl/worksheets/sheet3.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
		</Types>';
		$zip->addFromString('[Content_Types].xml', $contentTypes);
		
		// Tambahkan file _rels/.rels
		$rels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
		<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
			<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
		</Relationships>';
		$zip->addFromString('_rels/.rels', $rels);
		
		// Tambahkan file xl/workbook.xml
		$workbook = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
		<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
			<sheets>
				<sheet name="Data Produk" sheetId="1" r:id="rId1"/>
				<sheet name="Referensi Kategori" sheetId="2" r:id="rId2"/>
				<sheet name="Referensi Supplier" sheetId="3" r:id="rId3"/>
			</sheets>
		</workbook>';
		$zip->addFromString('xl/workbook.xml', $workbook);
		
		// Tambahkan file xl/_rels/workbook.xml.rels
		$workbookRels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
		<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
			<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
			<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/>
			<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet3.xml"/>
		</Relationships>';
		$zip->addFromString('xl/_rels/workbook.xml.rels', $workbookRels);
		
		// Buat direktori untuk worksheets
		$zip->addEmptyDir('xl/worksheets');
		
		// Tambahkan sheet1.xml (Data Produk)
		$sheet1 = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
		<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
			<sheetData>
				<row r="1">
					<c r="A1" t="s"><v>Nama Barang</v></c>
					<c r="B1" t="s"><v>Harga Barang</v></c>
					<c r="C1" t="s"><v>Stock</v></c>
					<c r="D1" t="s"><v>Kategori (ID)</v></c>
					<c r="E1" t="s"><v>Supplier (ID)</v></c>
				</row>
			</sheetData>
			<dataValidations count="2">
				<dataValidation type="list" allowBlank="1" showInputMessage="1" showErrorMessage="1" sqref="D2:D1048576">
					<formula1>\'Referensi Kategori\'!$B$2:$B$' . (count($kategori_data) + 1) . '</formula1>
				</dataValidation>
				<dataValidation type="list" allowBlank="1" showInputMessage="1" showErrorMessage="1" sqref="E2:E1048576">
					<formula1>\'Referensi Supplier\'!$B$2:$B$' . (count($supplier_data) + 1) . '</formula1>
				</dataValidation>
			</dataValidations>
		</worksheet>';
		$zip->addFromString('xl/worksheets/sheet1.xml', $sheet1);
		
		// Tambahkan sheet2.xml (Referensi Kategori)
		$sheet2 = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
		<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
			<sheetData>
				<row r="1">
					<c r="A1" t="s"><v>ID</v></c>
					<c r="B1" t="s"><v>Nama Kategori</v></c>
				</row>';
		
		$rowNum = 2;
		foreach ($kategori_data as $kategori) {
			$sheet2 .= '
				<row r="' . $rowNum . '">
					<c r="A' . $rowNum . '"><v>' . $kategori['autono'] . '</v></c>
					<c r="B' . $rowNum . '" t="s"><v>' . htmlspecialchars($kategori['nama_kategori']) . '</v></c>
				</row>';
			$rowNum++;
		}
		
		$sheet2 .= '
			</sheetData>
		</worksheet>';
		$zip->addFromString('xl/worksheets/sheet2.xml', $sheet2);
		
		// Tambahkan sheet3.xml (Referensi Supplier)
		$sheet3 = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
		<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
			<sheetData>
				<row r="1">
					<c r="A1" t="s"><v>ID</v></c>
					<c r="B1" t="s"><v>Nama Supplier</v></c>
				</row>';
		
		$rowNum = 2;
		foreach ($supplier_data as $supplier) {
			$sheet3 .= '
				<row r="' . $rowNum . '">
					<c r="A' . $rowNum . '"><v>' . $supplier['autono'] . '</v></c>
					<c r="B' . $rowNum . '" t="s"><v>' . htmlspecialchars($supplier['nama_supplier']) . '</v></c>
				</row>';
			$rowNum++;
		}
		
		$sheet3 .= '
			</sheetData>
		</worksheet>';
		$zip->addFromString('xl/worksheets/sheet3.xml', $sheet3);
		
		// Tutup file zip
		$zip->close();
		
		// Baca file yang telah dibuat
		$fileContent = file_get_contents($tempFile);
		
		// Hapus file temporary
		unlink($tempFile);
		
		// Set header untuk download file
		header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
		header('Content-Disposition: attachment;filename="template_product_import.xlsx"');
		header('Cache-Control: max-age=0');
		header('Content-Length: ' . strlen($fileContent));
		
		// Output file Excel
		echo $fileContent;
		exit;
	}
```

### Model Methods

```php
/**
 * Mengambil semua data kategori
 */
public function get_all_categories()
{
    return $this->db->query("SELECT autono, nama_kategori FROM m_categories ORDER BY nama_kategori")->fetchAll();
}

/**
 * Mengambil semua data supplier
 */
public function get_all_suppliers()
{
    return $this->db->query("SELECT autono, nama_supplier FROM m_supplier ORDER BY nama_supplier")->fetchAll();
}
```

### Tombol untuk Generate Template

Tambahkan tombol berikut di view:

```html
<a href="<?php echo BASE_URL ?>product/generate_template_excel" class="btn btn-success">
    <i class="icon-file-excel"></i> Download Template Excel
</a>
```

## 5. Cara Penggunaan

### Mengunduh Template

1. Buka halaman produk di aplikasi
2. Klik tombol "Download Template Excel"
3. File template akan terunduh dengan nama "template_product_import.xlsx"

### Mengisi Template

1. Buka file template yang sudah diunduh
2. Isi kolom sesuai dengan data yang dibutuhkan:
   - Nama Barang: Isi dengan nama produk
   - Harga Barang: Isi dengan harga (angka)
   - Stock: Isi dengan jumlah stock (angka)
   - Kategori: Pilih dari dropdown yang tersedia
   - Supplier: Pilih dari dropdown yang tersedia

### Tips Pengisian

- Gunakan dropdown untuk memilih Kategori dan Supplier
- Jangan mengubah struktur sheet referensi
- Pastikan format data sesuai (teks/angka)
- Jangan menghapus baris header

## 6. Tips dan Troubleshooting

### Masalah Umum

1. **Dropdown Tidak Muncul**
   - Pastikan sheet referensi tidak diubah/dihapus
   - Cek apakah ada data kategori/supplier di database

2. **File Tidak Bisa Dibuka**
   - Pastikan menggunakan Excel versi 2007 ke atas
   - Cek apakah file rusak saat download

3. **Data Referensi Tidak Muncul**
   - Periksa query di model
   - Pastikan ada data di tabel referensi

### Best Practices

1. **Keamanan**
   - Validasi akses user sebelum generate template
   - Sanitasi data dari database sebelum dimasukkan ke template

2. **Performa**
   - Gunakan index pada kolom yang sering dicari
   - Optimalkan query untuk data referensi

3. **Maintenance**
   - Dokumentasikan struktur template
   - Buat backup template master
   - Update template jika ada perubahan struktur data

### Pengembangan Lebih Lanjut

1. **Tambahan Fitur**
   - Validasi data numerik
   - Multiple sheet untuk berbagai jenis produk
   - Custom format cell untuk tipe data tertentu

2. **Peningkatan UX**
   - Tambahkan petunjuk pengisian
   - Warna untuk membedakan kolom wajib
   - Proteksi cell yang tidak boleh diubah

---

Dengan mengikuti tutorial ini, Anda dapat membuat template Excel yang memudahkan pengguna dalam menginput data produk dengan format yang benar dan konsisten.
