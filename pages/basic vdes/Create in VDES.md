# **File Tree View**
* [Dasar VDES](Basic%20VDES.md)
  * [Create VDES](Create%20in%20VDES.md)
  * [Read VDES](Read%20VDES.md)
  * [Update VDES](Update%20VDES.md)
  * [System Model VDES](System%20Model%20VDES.md)

# **Alur Kerja Penambahan Data (Create)**

Berikut adalah penjelasan alur kerjanya secara step by step beserta potongan kode (code snippet) dan penjelasan detail untuk masing-masing langkah:

---

## **Langkah 1: Menampilkan Tombol “Add” pada Tampilan (View)**

Pada file `nama_view.php`, terdapat sebuah tombol “Add” yang akan mengarahkan pengguna ke halaman penambahan data ketika diklik.

### *Potongan Kode:*
```ts
<div class="panel-body">
  <a href="<?php echo $data['curl'] ?>/add/<?php echo $data['encode']; ?>" class="btn btn-info btn-sx">
    <i class="icon-plus-circle2 position-left"></i> Add
  </a>
</div>
```

### *Penjelasan:*
- Link tombol mengarahkan ke URL yang dibangun dari `data['curl']` dan `data['encode']` dengan tambahan segmen `/add/`.
- Saat tombol diklik, browser akan membuka halaman dengan URL tersebut, yang kemudian diproses oleh controller.

---

## **Langkah 2: Menangani Permintaan “Add” di Controller**

Controller `nama.php` memiliki fungsi `add` yang bertugas mempersiapkan data yang dibutuhkan untuk tampilan form penambahan.

### *Potongan Kode:*
```php
public function add($x = null)
{
    $model               = $this->loadModel($this->model);
    $data                = array();
    $data['breadcrumb1'] = $this->menu;
    $data['title']       = $this->title;
    $data['action']      = 'Add';
    $data['curl']        = $this->curl;
    $data['encode']      = $x;
    $data['bank']        = $model->get_combo($id, $this->table, 'm_bank', 'bank', 'autono', 'nama_bank');
    $data['entitas']     = $model->get_combo($id, $this->table, 'm_entitas', 'entitas', 'autono', 'nama_perusahaan');

    $template            = $this->loadView('akun_add');
    $template->set('data', $data);
    $template->render();
}
```

### *Penjelasan:*
- Fungsi `add` menerima parameter `$x` yang merupakan nilai enkripsi atau identifier.
- Data seperti judul, action, URL dasar (`curl`), dan data untuk combo box (bank dan entitas) disiapkan dengan memanggil fungsi `get_combo`.
- Setelah data disiapkan, tampilan (view) `akun_add` di-load dan data dikirimkan ke view untuk ditampilkan.

---

## **Langkah 3: Menampilkan Form Penambahan Data pada Tampilan (View: akun_add.php)**

Pada file `nama_add.php`, disediakan form input yang berisi field seperti Bank, Nomor Rekening, Nama Rekening, Nama Akun, Entitas, Status Akun, dan Keterangan.

### *Potongan Kode (Sebagian):*
```html
<form class="form-horizontal" action="<?php echo $data['curl'] . "/save/" . $data['encode']; ?>" method="post" enctype="multipart/form-data">
  <!-- Field Bank -->
  <div class="form-group">
    <label class="control-label col-lg-2">Bank</label>
    <div class="col-lg-10">
      <select data-placeholder="Pilih Bank" class="select" name="bank">
        <option></option>
        <?php foreach ($data['bank'] as $key => $value) {
          echo "<option value=\"" . $value[0] . "\" " . $value[2] . ">" . $value[1] . "</option>" . "\n";
        } ?>
      </select>
    </div>
  </div>
  <!-- Field Nomor Rekening -->
  <div class="form-group">
    <label class="control-label col-lg-2">Nomor rekening</label>
    <div class="col-lg-10">
      <input type="text" class="form-control" name="nomor_rekening">
    </div>
  </div>
  <!-- Field Nama Rekening -->
  <div class="form-group">
    <label class="control-label col-lg-2">Nama rekening</label>
    <div class="col-lg-10">
      <input type="text" class="form-control" name="nama_rekening">
    </div>
  </div>
  <!-- Field Nama Akun -->
  <div class="form-group">
    <label class="control-label col-lg-2">Nama akun</label>
    <div class="col-lg-10">
      <input type="text" class="form-control" name="nama_akun">
    </div>
  </div>
  <!-- Field Entitas -->
  <div class="form-group">
    <label class="control-label col-lg-2">Entitas</label>
    <div class="col-lg-6">
      <select data-placeholder="Pilih Entitas" class="select" name="entitas">
        <option></option>
        <?php foreach ($data['entitas'] as $key => $value) {
          echo "<option value=\"" . $value[0] . "\" " . $value[2] . ">" . $value[1] . "</option>" . "\n";
        } ?>
      </select>
    </div>
    <div class="col-lg-4" style="margin-top: 9px;">
      <a href="javascript:void(0)" title="Information" style="color: black;" data-popup="popover" data-html="true" data-content="<span style='text-align: left !important;'>Jika Untuk Akun Suplier, Entitas Tidak Perlu Diisi.</span>">
        <i class=" icon-question3"></i>
      </a>
    </div>
  </div>
  <!-- Field Status Akun -->
  <div class="form-group">
    <label class="control-label col-lg-2">Status Akun</label>
    <div class="col-lg-10 checkbox checkbox-switchery">
      <input type="checkbox" id="margins" name="internal" class="switch mrgn" data-size="mini" data-off-color="danger" data-on-text="Internal" data-off-text="Supplier">
    </div>
  </div>
  <!-- Field Keterangan -->
  <div class="form-group">
    <label class="control-label col-lg-2">Keterangan</label>
    <div class="col-lg-10">
      <textarea rows="5" cols="5" class="form-control" placeholder="" name="keterangan"></textarea>
    </div>
  </div>
  <!-- Tombol Cancel dan Submit -->
  <div class="text-right">
    <a href="<?php echo $data['curl'] ?>" class="btn btn-danger btn-sx">
      <i class="icon-circle-left2 position-left"></i> Cancel
    </a>
    <button type="submit" class="btn btn-primary">Submit <i class="icon-circle-right2 position-right"></i></button>
  </div>
</form>
```

### *Penjelasan:*
- **Form Action:** Form akan mengirim data ke URL `curl/save/encode` sehingga ketika form disubmit, fungsi `save` di controller yang akan dipanggil.
- **Field Input:** Terdapat beberapa input, seperti:
  - **Select Bank:** Menggunakan data yang diambil dari controller (`$data['bank']`) untuk membuat pilihan bank.
  - **Input Teks:** Untuk nomor rekening, nama rekening, dan nama akun.
  - **Select Entitas:** Menggunakan data `$data['entitas']` untuk pilihan entitas.
  - **Checkbox Status Akun:** Menandakan apakah akun bersifat internal atau untuk supplier.
  - **Textarea Keterangan:** Untuk keterangan tambahan.
- **Tombol:** Ada tombol Cancel yang mengarahkan kembali ke URL dasar dan tombol Submit untuk mengirim data form.

---

## **Langkah 4: Mengirim Data Form (Submit) ke Controller**

Ketika pengguna mengisi form dan mengklik tombol Submit, data form dikirim melalui metode POST ke URL yang telah ditentukan, yaitu `curl/save/encode`.

---

## **Langkah 5: Memproses Data yang Dikirim di Controller (Fungsi save)**

Controller `nama.php` memiliki fungsi `save` yang akan menerima data dari form, melakukan sanitasi (menggunakan `htmlspecialchars`), dan kemudian menyimpan data ke dalam database.

### *Potongan Kode:*
```php
public function save($x = null)
{
    $data               = array();
    $model              = $this->loadModel($this->model);
    
    if ($x == null) {
        $data['parent_id'] = 0;
    } else {
        $data['parent_id'] = $this->base64url_decode($x);
    }
    
    $data['bank']           = htmlspecialchars($_REQUEST['bank']);
    $data['nomor_rekening'] = htmlspecialchars($_REQUEST['nomor_rekening']);
    $data['nama_rekening']  = htmlspecialchars($_REQUEST['nama_rekening']);
    $data['nama_akun']      = htmlspecialchars($_REQUEST['nama_akun']);
    $data['entitas']        = !empty($_REQUEST['entitas']) ? htmlspecialchars($_REQUEST['entitas']) : 0;
    $data['internal']       = htmlspecialchars($_REQUEST['internal']);
    $data['keterangan']     = htmlspecialchars($_REQUEST['keterangan']);

    $data['autocode']       = $model->autocode($this->table, "ACC");
    $result                 = $model->msave($this->table, $data, $this->title);

    if ($x) {
        $this->redirect('akun/detail/' . $x);
    } else {
        $this->redirect('akun');
    }
}
```

### *Penjelasan:*
- **Pengaturan Parent ID:** Jika parameter `$x` kosong, maka `parent_id` diset ke 0; jika tidak, maka didekode terlebih dahulu.
- **Sanitasi Data:** Setiap input dari form diambil dari `$_REQUEST` dan diamankan dengan `htmlspecialchars` untuk menghindari injeksi HTML.
- **Autocode:** Menghasilkan kode otomatis untuk akun menggunakan fungsi `autocode`.
- **Penyimpanan Data:** Data disimpan ke database dengan memanggil fungsi `msave` pada model.
- **Redirect:** Setelah penyimpanan berhasil, pengguna akan diarahkan kembali. Jika ada parameter `$x`, maka diarahkan ke detail akun tertentu; jika tidak, diarahkan ke halaman daftar akun.

---

## **Kesimpulan Alur Kerja**

1. **Klik Tombol Add:** Pengguna mengklik tombol Add pada tampilan utama.
2. **Load Halaman Add:** Controller `add` menyiapkan data (combo bank dan entitas) dan memanggil view `akun_add`.
3. **Form Penambahan Tampil:** Pengguna melihat form untuk menginput data akun baru.
4. **Submit Form:** Setelah mengisi form, data dikirim ke controller melalui aksi form ke URL `save`.
5. **Proses Simpan Data:** Fungsi `save` di controller memproses, sanitasi, dan menyimpan data ke database.
6. **Redirect:** Pengguna diarahkan kembali ke halaman detail akun atau ke daftar akun sesuai kondisi.

Dengan penjelasan dan potongan kode di atas, diharapkan alur program menjadi lebih mudah dipahami dan langkah demi langkah setiap proses dari klik tombol Add hingga data tersimpan di database.