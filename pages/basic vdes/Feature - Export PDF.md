# Tutorial Lengkap Membuat Export PDF di VDES

## Daftar Isi
1. [Pendahuluan](#pendahuluan)
2. [Persiapan](#persiapan)
3. [Membuat Fungsi Export PDF di Controller](#membuat-fungsi-export-pdf-di-controller)
4. [Menambahkan Tombol Export PDF di View](#menambahkan-tombol-export-pdf-di-view)
5. [Fungsi Helper untuk PDF](#fungsi-helper-untuk-pdf)
6. [Contoh Implementasi Lengkap](#contoh-implementasi-lengkap)
7. [Tips dan Trik](#tips-dan-trik)

## Pendahuluan

Export PDF adalah fitur penting dalam aplikasi web yang memungkinkan pengguna untuk mengunduh data dalam format PDF. Dalam tutorial ini, kita akan mempelajari cara membuat fitur export PDF di sistem VDES menggunakan library FPDF dan PDF_MC_Table.

## Persiapan

Sebelum memulai, pastikan Anda memiliki:

1. **Library FPDF** - VDES menggunakan library FPDF untuk membuat dokumen PDF dasar
2. **Library PDF_MC_Table** - Ekstensi FPDF untuk membuat tabel multi-cell yang lebih kompleks
3. **Controller dan Model** - Controller dan model yang berisi data yang akan diekspor ke PDF
4. **View** - Tampilan yang akan menampilkan tombol export PDF

## Membuat Fungsi Export PDF di Controller

Langkah pertama adalah membuat fungsi export PDF di controller. Berikut adalah langkah-langkahnya:

### 1. Buat Fungsi Export PDF

```php
function export_pdf_saya()
{
    // ====================================================
    // INISIALISASI FPDF - Menggunakan kelas turunan PDF_MC_Table 
    // yang memungkinkan pembuatan tabel multi-sel
    // ====================================================
    
    // Memuat library PDF_MC_Table untuk membantu pembuatan dan manipulasi PDF
    $pdf = $this->loadLibrary('pdf_mc_table');
    $pdf = new PDF_MC_Table();
    
    // Memuat model yang dibutuhkan
    $model = $this->loadModel($this->model);
    
    // ==============================================
    // DATA - Berisi semua informasi yang akan ditampilkan di PDF
    // ==============================================
    $data = [
        // Data yang diperlukan untuk PDF
        'judul' => 'Laporan Data',
        'tanggal' => date('d F Y'),
        'items' => [
            // Data item yang akan ditampilkan
        ]
    ];
    
    // ====================================================
    // PENGATURAN DASAR PDF
    // ====================================================
    // Mengatur margin kiri dan atas, font default
    $pdf->SetMargins(5, 5);
    $pdf->SetFont('Arial', '', 10);
    $pdf->AddPage('P', 'a4');  // P = Portrait, L = Landscape
    $spasi = 5; // Variabel untuk mengatur spasi antar elemen
    
    // Lanjutkan dengan membuat konten PDF
    // ...
    
    // ========================================
    // OUTPUT FILE - Menampilkan PDF langsung di browser
    // ========================================
    $pdf->Output('I', 'Laporan_Saya.pdf');  // 'I' = Inline (tampil di browser), 'D' = Download
}
```

### 2. Membuat Header Dokumen

```php
// Header Left - Logo atau Nama Instansi
$xPos = $pdf->GetX();
$yPos = $pdf->GetY();
$pdf->Cell(80, $spasi, 'NAMA PERUSAHAAN', 0, 1, 'C');
$pdf->Cell(80, $spasi, 'DIVISI / DEPARTEMEN', 'B', 1, 'C');
$pdf->SetXY($xPos, $yPos);

// Header Right - Kode Dokumen
$this->HeaderTop($pdf, $spasi, 'Kode Dokumen: DOC-001');

// Judul Dokumen
$pdf->Ln($spasi);
$pdf->Ln($spasi);
$pdf->SetFont('Arial', 'U', 12);
$pdf->Cell(0, $spasi, 'LAPORAN DATA PRODUK', 0, 1, 'C');
$pdf->SetFont('Arial', '', 9);
```

### 3. Membuat Tabel Data dengan PDF_MC_Table

```php
// Header tabel
$pdf->Ln($spasi);
$pdf->SetFont('Arial', 'B', 10);

// Mengatur lebar kolom dan alignment
$pdf->SetWidths(array(15, 80, 15, 19, 19, 20, 50));
$pdf->SetAligns(array('C', 'L', 'C', 'C', 'R', 'R', 'L'));
$pdf->SetLineHeight($spasi);

// Header tabel
$pdf->Cell(15, $spasi * 2, "No", 1, 0, 'C');
$pdf->Cell(80, $spasi * 2, "Nama Produk", 1, 0, 'C');
$pdf->Cell(15, $spasi * 2, "Satuan", 1, 0, 'C');
$pdf->Cell(19, $spasi * 2, "Jumlah", 1, 0, 'C');
$pdf->Cell(19, $spasi * 2, "Harga", 1, 0, 'C');
$pdf->Cell(20, $spasi * 2, "Total", 1, 0, 'C');
$pdf->Cell(50, $spasi * 2, "Keterangan", 1, 1, 'C');

// Isi tabel dengan data
$pdf->SetFont('Arial', '', 10);
foreach ($data['items'] as $row) {
    $pdf->Row(array(
        $row['no'],
        $row['nama_produk'],
        $row['satuan'],
        $row['jumlah'],
        number_format($row['harga'], 0, ',', '.'),
        number_format($row['jumlah'] * $row['harga'], 0, ',', '.'),
        $row['keterangan']
    ));
}

// Baris total
$pdf->SetFont('Arial', 'B', 10);
$pdf->Cell(129, $spasi, "Total", 1, 0, 'R');
$pdf->Cell(39, $spasi, "Rp " . number_format($total, 0, ',', '.'), 1, 0, 'R');
$pdf->Cell(50, $spasi, "", 1, 1, 'L');
```

### 4. Menambahkan Tanda Tangan

```php
$pdf->Ln($spasi);

// Kolom tanda tangan kiri
$xPos = $pdf->GetX();
$yPos = $pdf->GetY();
$pdf->Cell(95, $spasi, "", 'LTR', 1, 'L');
$pdf->Cell(95, $spasi, "YANG MEMBUAT :", 'LR', 1, 'L');
$pdf->Cell(95, $spasi, "MANAGER PRODUK", 'LR', 1, 'L');
$pdf->Cell(95, $spasi, "", 'LR', 1, 'L');

$pdf->Cell(25, $spasi, 'Tanda Tangan', 'L', 0, 'L');
$pdf->Cell(5, $spasi, ':', 0, 0, 'L');
$pdf->Cell(65, $spasi, '', 'R', 1, 'L');
$pdf->Cell(25, $spasi, 'Nama', 'L', 0, 'L');
$pdf->Cell(5, $spasi, ':', 0, 0, 'L');
$pdf->Cell(65, $spasi, 'NAMA PEMBUAT', 'R', 1, 'L');
$pdf->Cell(25, $spasi, 'Jabatan', 'L', 0, 'L');
$pdf->Cell(5, $spasi, ':', 0, 0, 'L');
$pdf->Cell(65, $spasi, 'Manager Produk', 'R', 1, 'L');
$pdf->Cell(95, $spasi, "", 'LBR', 1, 'L');

// Kolom tanda tangan kanan
$totalWidthColumnSebelumnya = 95;
$yPosTemp = 0;
$pdf->SetXY($xPos + $totalWidthColumnSebelumnya, $yPos + $yPosTemp);

$pdf->Cell(95, $spasi, "", 'LTR', 1, 'L');
$yPosTemp += $spasi;
$pdf->SetXY($xPos + $totalWidthColumnSebelumnya, $yPos + $yPosTemp);
$pdf->Cell(95, $spasi, "YANG MENYETUJUI :", 'LR', 1, 'L');
$yPosTemp += $spasi;
$pdf->SetXY($xPos + $totalWidthColumnSebelumnya, $yPos + $yPosTemp);
$pdf->Cell(95, $spasi, "DIREKTUR OPERASIONAL", 'LR', 1, 'L');
$yPosTemp += $spasi;
$pdf->SetXY($xPos + $totalWidthColumnSebelumnya, $yPos + $yPosTemp);
$pdf->Cell(95, $spasi, "", 'LR', 1, 'L');
$yPosTemp += $spasi;
$pdf->SetXY($xPos + $totalWidthColumnSebelumnya, $yPos + $yPosTemp);

$pdf->Cell(25, $spasi, 'Tanda Tangan', 'L', 0, 'L');
$pdf->Cell(5, $spasi, ':', 0, 0, 'L');
$pdf->Cell(65, $spasi, '', 'R', 1, 'L');
$yPosTemp += $spasi;
$pdf->SetXY($xPos + $totalWidthColumnSebelumnya, $yPos + $yPosTemp);
$pdf->Cell(25, $spasi, 'Nama', 'L', 0, 'L');
$pdf->Cell(5, $spasi, ':', 0, 0, 'L');
$pdf->Cell(65, $spasi, 'NAMA PENYETUJU', 'R', 1, 'L');
$yPosTemp += $spasi;
$pdf->SetXY($xPos + $totalWidthColumnSebelumnya, $yPos + $yPosTemp);
$pdf->Cell(25, $spasi, 'Jabatan', 'L', 0, 'L');
$pdf->Cell(5, $spasi, ':', 0, 0, 'L');
$pdf->Cell(65, $spasi, 'Direktur Operasional', 'R', 1, 'L');
$yPosTemp += $spasi;
$pdf->SetXY($xPos + $totalWidthColumnSebelumnya, $yPos + $yPosTemp);
$pdf->Cell(95, $spasi, "", 'LBR', 1, 'L');
```

## Menambahkan Tombol Export PDF di View

Setelah membuat fungsi export PDF di controller, langkah selanjutnya adalah menambahkan tombol export PDF di view:

```html
<div class="panel-body">
    <a href="<?php echo $data['curl'] ?>/add/<?php echo $data['encode']; ?>" class="btn btn-primary btn-sx btn-add">
        <i class="icon-plus-circle2 position-left"></i> Tambah
    </a>
    <a href="<?php echo $data['curl'] ?>/export_pdf_saya" class="btn-pdf btn bg-indigo-400 btn-sx btn-labeled" id="pdfButton" title="Export to PDF">
        <b><i class="icon-printer"></i></b> Export PDF Laporan
    </a>
    <!-- Tombol lainnya -->
</div>
```

## Fungsi Helper untuk PDF

Untuk mempermudah pembuatan PDF, Anda dapat membuat fungsi helper seperti berikut:

### 1. Fungsi untuk Cell dengan Teks Panjang

```php
function CellBanyak($pdf, $width, $heightPerLine, $value, $border, $align)
{
    $xPos = $pdf->GetX();
    $yPos = $pdf->GetY();
    $pdf->MultiCell($width, $heightPerLine, $value, $border, $align);
    $pdf->SetXY($xPos + $width, $yPos);
}
```

### 2. Fungsi untuk Cell dengan Teks Panjang dan Opsi Enter

```php
function CellBanyakAuto($pdf, $width, $heightPerLine, $value, $border, $enter=null, $align)
{
    if($enter == 1){
        $pdf->MultiCell($width, $heightPerLine, $value, $border, $align);
    }
    else if($enter == 0 || $enter == null || $enter == ''){
        $xPos = $pdf->GetX();
        $yPos = $pdf->GetY();
        $pdf->MultiCell($width, $heightPerLine, $value, $border, $align);
        $pdf->SetXY($xPos + $width, $yPos);
    }
}
```

### 3. Fungsi untuk Header Standar

```php
function JudulA4($pdf, $spasi)
{
    $xPos = $pdf->GetX();
    $yPos = $pdf->GetY();
    $pdf->Cell(70, $spasi, 'NAMA PERUSAHAAN', 'B', 1, 'C');
    $pdf->Cell(70, $spasi, 'DIVISI / DEPARTEMEN', 0, 1, 'C');
    $pdf->SetXY($xPos, $yPos);
}
```

### 4. Fungsi untuk Header Kanan

```php
function HeaderTop($pdf, $spasi, $kalimat)
{
    $xPos = $pdf->GetX();
    $yPos = $pdf->GetY();
    $pdf->Cell(0, $spasi, $kalimat, '', 1, 'R');
    $pdf->SetXY($xPos, $yPos);
}
```

## Contoh Implementasi Lengkap

Berikut adalah contoh implementasi lengkap untuk membuat export PDF laporan produk berdasarkan fungsi export_pdf_40510:

```php
function export_pdf_produk()
{
    // ====================================================
    // INISIALISASI FPDF - Menggunakan kelas turunan PDF_MC_Table 
    // ====================================================
    $pdf = $this->loadLibrary('pdf_mc_table');
    $pdf = new PDF_MC_Table();
    $model = $this->loadModel($this->model);
    
    // ==============================================
    // DATA - Ambil dari database atau gunakan data dummy untuk testing
    // ==============================================
    $products = $model->getAllProducts(); // Ganti dengan fungsi model yang sesuai
    
    // Jika ingin menggunakan data dummy untuk testing
    $dummy_data = [
        'products' => [
            [
                'no' => '1',
                'nama_produk' => 'Laptop Asus ROG Strix G15',
                'satuan' => 'UNIT',
                'jumlah' => '5',
                'harga' => '15000000',
                'keterangan' => 'Stok Baru',
            ],
            [
                'no' => '2',
                'nama_produk' => 'Monitor LG 24 Inch',
                'satuan' => 'UNIT',
                'jumlah' => '10',
                'harga' => '2500000',
                'keterangan' => 'Stok Lama',
            ],
            // Tambahkan data lainnya
        ]
    ];
    
    // Gunakan data dari model atau data dummy
    $data = [
        'products' => $products ?? $dummy_data['products']
    ];
    
    // ====================================================
    // PENGATURAN DASAR PDF
    // ====================================================
    $pdf->SetMargins(5, 5);
    $pdf->SetFont('Arial', '', 10);
    $pdf->AddPage('L', 'a4'); // Landscape untuk tabel yang lebar
    $spasi = 5;
    
    // Header Left - Logo atau Nama Instansi
    $xPos = $pdf->GetX();
    $yPos = $pdf->GetY();
    $pdf->Cell(80, $spasi, 'PT. NAMA PERUSAHAAN', 0, 1, 'C');
    $pdf->Cell(80, $spasi, 'DIVISI PRODUK', 'B', 1, 'C');
    $pdf->SetXY($xPos, $yPos);
    
    // Header Right - Kode Dokumen
    $this->HeaderTop($pdf, $spasi, 'Form Produk');
    
    // Judul Dokumen
    $pdf->Ln($spasi);
    $pdf->Ln($spasi);
    $pdf->SetFont('Arial', 'U', 12);
    $pdf->Cell(0, $spasi, 'LAPORAN DATA PRODUK', 0, 1, 'C');
    $pdf->SetFont('Arial', '', 9);
    $pdf->Cell(0, $spasi, 'Per Tanggal: ' . date('d F Y'), 0, 1, 'C');
    
    // Header tabel
    $pdf->Ln($spasi);
    
    // Mengatur lebar kolom dan alignment
    $pdf->SetWidths(array(15, 80, 20, 20, 30, 30, 50));
    $pdf->SetAligns(array('C', 'L', 'C', 'C', 'R', 'R', 'L'));
    $pdf->SetLineHeight($spasi);
    
    // Header tabel
    $pdf->SetFont('Arial', 'B', 10);
    $pdf->Cell(15, $spasi * 2, "No", 1, 0, 'C');
    $pdf->Cell(80, $spasi * 2, "Nama Produk", 1, 0, 'C');
    $pdf->Cell(20, $spasi * 2, "Satuan", 1, 0, 'C');
    $pdf->Cell(20, $spasi * 2, "Jumlah", 1, 0, 'C');
    $pdf->Cell(30, $spasi * 2, "Harga (Rp)", 1, 0, 'C');
    $pdf->Cell(30, $spasi * 2, "Total (Rp)", 1, 0, 'C');
    $pdf->Cell(50, $spasi * 2, "Keterangan", 1, 1, 'C');
    
    // Isi tabel dengan data
    $pdf->SetFont('Arial', '', 10);
    $total = 0;
    
    foreach ($data['products'] as $product) {
        $subtotal = $product['jumlah'] * $product['harga'];
        $total += $subtotal;
        
        $pdf->Row(array(
            $product['no'],
            $product['nama_produk'],
            $product['satuan'],
            $product['jumlah'],
            number_format($product['harga'], 0, ',', '.'),
            number_format($subtotal, 0, ',', '.'),
            $product['keterangan']
        ));
    }
    
    // Baris total
    $pdf->SetFont('Arial', 'B', 10);
    $pdf->Cell(165, $spasi, "Total", 1, 0, 'R');
    $pdf->Cell(30, $spasi, "Rp " . number_format($total, 0, ',', '.'), 1, 0, 'R');
    $pdf->Cell(50, $spasi, "", 1, 1, 'L');
    
    // Tanda tangan
    $pdf->Ln($spasi);
    
    // Kolom tanda tangan kiri
    $xPos = $pdf->GetX();
    $yPos = $pdf->GetY();
    $pdf->Cell(95, $spasi, "", 'LTR', 1, 'L');
    $pdf->Cell(95, $spasi, "YANG MEMBUAT :", 'LR', 1, 'L');
    $pdf->Cell(95, $spasi, "MANAGER PRODUK", 'LR', 1, 'L');
    $pdf->Cell(95, $spasi, "", 'LR', 1, 'L');
    
    $pdf->Cell(25, $spasi, 'Tanda Tangan', 'L', 0, 'L');
    $pdf->Cell(5, $spasi, ':', 0, 0, 'L');
    $pdf->Cell(65, $spasi, '', 'R', 1, 'L');
    $pdf->Cell(25, $spasi, 'Nama', 'L', 0, 'L');
    $pdf->Cell(5, $spasi, ':', 0, 0, 'L');
    $pdf->Cell(65, $spasi, 'NAMA PEMBUAT', 'R', 1, 'L');
    $pdf->Cell(25, $spasi, 'Jabatan', 'L', 0, 'L');
    $pdf->Cell(5, $spasi, ':', 0, 0, 'L');
    $pdf->Cell(65, $spasi, 'Manager Produk', 'R', 1, 'L');
    $pdf->Cell(95, $spasi, "", 'LBR', 1, 'L');
    
    // Kolom tanda tangan kanan
    $totalWidthColumnSebelumnya = 95;
    $yPosTemp = 0;
    $pdf->SetXY($xPos + $totalWidthColumnSebelumnya, $yPos + $yPosTemp);
    
    $pdf->Cell(95, $spasi, "", 'LTR', 1, 'L');
    $yPosTemp += $spasi;
    $pdf->SetXY($xPos + $totalWidthColumnSebelumnya, $yPos + $yPosTemp);
    $pdf->Cell(95, $spasi, "YANG MENYETUJUI :", 'LR', 1, 'L');
    $yPosTemp += $spasi;
    $pdf->SetXY($xPos + $totalWidthColumnSebelumnya, $yPos + $yPosTemp);
    $pdf->Cell(95, $spasi, "DIREKTUR OPERASIONAL", 'LR', 1, 'L');
    $yPosTemp += $spasi;
    $pdf->SetXY($xPos + $totalWidthColumnSebelumnya, $yPos + $yPosTemp);
    $pdf->Cell(95, $spasi, "", 'LR', 1, 'L');
    $yPosTemp += $spasi;
    $pdf->SetXY($xPos + $totalWidthColumnSebelumnya, $yPos + $yPosTemp);
    
    $pdf->Cell(25, $spasi, 'Tanda Tangan', 'L', 0, 'L');
    $pdf->Cell(5, $spasi, ':', 0, 0, 'L');
    $pdf->Cell(65, $spasi, '', 'R', 1, 'L');
    $yPosTemp += $spasi;
    $pdf->SetXY($xPos + $totalWidthColumnSebelumnya, $yPos + $yPosTemp);
    $pdf->Cell(25, $spasi, 'Nama', 'L', 0, 'L');
    $pdf->Cell(5, $spasi, ':', 0, 0, 'L');
    $pdf->Cell(65, $spasi, 'NAMA PENYETUJU', 'R', 1, 'L');
    $yPosTemp += $spasi;
    $pdf->SetXY($xPos + $totalWidthColumnSebelumnya, $yPos + $yPosTemp);
    $pdf->Cell(25, $spasi, 'Jabatan', 'L', 0, 'L');
    $pdf->Cell(5, $spasi, ':', 0, 0, 'L');
    $pdf->Cell(65, $spasi, 'Direktur Operasional', 'R', 1, 'L');
    $yPosTemp += $spasi;
    $pdf->SetXY($xPos + $totalWidthColumnSebelumnya, $yPos + $yPosTemp);
    $pdf->Cell(95, $spasi, "", 'LBR', 1, 'L');
    
    // ========================================
    // OUTPUT FILE - Menampilkan PDF langsung di browser
    // ========================================
    $pdf->Output('I', 'Laporan_Produk.pdf'); // 'I' berarti inline (tampil di browser)
}
```

## Tips dan Trik

### 1. Mengatur Orientasi Halaman

```php
// Portrait (default)
$pdf->AddPage('P', 'a4');

// Landscape
$pdf->AddPage('L', 'a4');
```

### 2. Mengatur Font

```php
// Format: SetFont(family, style, size)
$pdf->SetFont('Arial', '', 11);    // Normal
$pdf->SetFont('Arial', 'B', 12);   // Bold
$pdf->SetFont('Arial', 'I', 10);   // Italic
$pdf->SetFont('Arial', 'BI', 10);  // Bold Italic
```

### 3. Mengatur Warna

```php
// Warna teks
$pdf->SetTextColor(0, 0, 0);       // Hitam (RGB)
$pdf->SetTextColor(255, 0, 0);     // Merah

// Warna latar belakang
$pdf->SetFillColor(220, 220, 220); // Abu-abu muda
$pdf->Cell(30, 7, 'Teks', 1, 0, 'C', true); // Parameter terakhir true = fill
```

### 4. Membuat Tabel dengan Baris Bergantian

```php
$no = 1;
$fill = false;
foreach ($products as $product) {
    // Warna latar belakang bergantian
    $fill = !$fill;
    if ($fill) {
        $pdf->SetFillColor(240, 240, 240);
    } else {
        $pdf->SetFillColor(255, 255, 255);
    }
    
    $pdf->Row(array(
        $no,
        $product['nama_produk'],
        $product['satuan'],
        $product['jumlah'],
        number_format($product['harga'], 0, ',', '.'),
        number_format($product['jumlah'] * $product['harga'], 0, ',', '.'),
        $product['keterangan']
    ), $fill);
    $no++;
}
```

### 5. Menambahkan Gambar

```php
// Format: Image(file, x, y, w, h)
$pdf->Image('path/to/logo.png', 10, 10, 30);
```

### 6. Menambahkan Nomor Halaman

```php
// Tambahkan ini di akhir setiap halaman
$pdf->SetY(-15);
$pdf->SetFont('Arial', 'I', 8);
$pdf->Cell(0, 10, 'Halaman ' . $pdf->PageNo() . ' dari {nb}', 0, 0, 'C');

// Dan tambahkan ini di awal dokumen
$pdf->AliasNbPages();
```

### 7. Mengatur Posisi Elemen dengan SetXY

```php
// Simpan posisi saat ini
$xPos = $pdf->GetX();
$yPos = $pdf->GetY();

// Lakukan operasi lain
$pdf->Cell(0, 5, 'Teks di posisi lain', 0, 1, 'C');

// Kembali ke posisi sebelumnya
$pdf->SetXY($xPos, $yPos);
```

## Kesimpulan

Dengan mengikuti tutorial ini, Anda sekarang dapat membuat fitur export PDF di sistem VDES. Fitur ini sangat berguna untuk menghasilkan laporan, dokumen, dan data lainnya dalam format PDF yang dapat diunduh oleh pengguna.

Ingatlah untuk selalu menyesuaikan kode dengan kebutuhan spesifik aplikasi Anda dan memastikan data yang ditampilkan dalam PDF sudah benar dan terformat dengan baik.

Selamat mencoba!
