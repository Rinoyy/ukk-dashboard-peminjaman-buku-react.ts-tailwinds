# Dashboard Admin — Alur Bisnis

---

## Gambaran Umum

**Dashboard Admin** adalah antarmuka web untuk Admin dan Petugas perpustakaan. Aplikasi ini menjadi pusat kendali seluruh operasional perpustakaan: mulai dari manajemen koleksi buku, persetujuan peminjaman, verifikasi pengembalian, hingga pemantauan kunjungan siswa.

**Akses:** Hanya pengguna dengan role `ADMIN` yang dapat masuk ke dashboard ini.

---

## Fitur Bisnis

### 1. Manajemen Pengguna (Siswa & Petugas)

**Tujuan bisnis:** Admin dapat memantau dan mengelola seluruh akun pengguna yang terdaftar di sistem.

**Alur:**
1. Admin membuka tab **Users** di sidebar
2. Melihat daftar siswa yang terdaftar (nama, NIS, status)
3. Dapat menambahkan akun Petugas baru via halaman **Add Petugas**

**Aturan:**
- Siswa mendaftar mandiri via Portal Siswa
- Hanya Admin yang bisa menambah akun Petugas

---

### 2. Manajemen Kategori Buku

**Tujuan bisnis:** Mengelompokkan koleksi buku berdasarkan kategori untuk memudahkan pencarian siswa.

**Alur:**
1. Admin membuka tab **Categories**
2. Menambah kategori baru (contoh: Fiksi, Sains, Sejarah, dll.)
3. Mengedit atau menghapus kategori yang ada
4. Kategori digunakan sebagai filter saat siswa mencari buku

---

### 3. Manajemen Buku & Salinan (Book Copies)

**Tujuan bisnis:** Mengelola seluruh koleksi buku beserta salinan fisiknya yang tersedia di perpustakaan.

**Alur:**
1. Admin membuka tab **Books**
2. Menambah buku baru (judul, pengarang, deskripsi, kategori, gambar cover)
3. Setiap buku bisa memiliki beberapa **salinan fisik (BookCopy)**
4. Setiap salinan mendapat **QR Code unik** secara otomatis
5. Admin dapat memantau status tiap salinan: Tersedia, Dipinjam, Rusak, Hilang

**Aturan:**
- Buku yang semua salinannya tidak tersedia tidak bisa dipinjam siswa
- QR Code salinan dapat digunakan untuk identifikasi fisik buku

---

### 4. Persetujuan Permintaan Peminjaman

**Tujuan bisnis:** Admin memverifikasi dan memutuskan apakah permintaan peminjaman dari siswa dapat diproses.

**Alur:**
```
Siswa request peminjaman
        ↓
Admin lihat daftar PENDING di tab "Borrowings"
        ↓
Admin cek ketersediaan & kondisi buku
        ↓
Admin APPROVE atau REJECT permintaan
        ↓
[Approve] → Status: BORROWED, DueDate: +7 hari
[Reject]  → BookCopy kembali AVAILABLE, notifikasi ke siswa
```

**Aturan:**
- Permintaan yang tidak diproses dalam 24 jam akan otomatis dibatalkan sistem
- Setelah disetujui, siswa wajib mengambil buku dalam **2 hari**
- Jika tidak diambil, permintaan otomatis dibatalkan

---

### 5. Verifikasi Pengembalian Buku

**Tujuan bisnis:** Admin memeriksa kondisi fisik buku yang dikembalikan dan menghitung denda jika diperlukan.

**Alur:**
```
Siswa request return via Portal Siswa
        ↓
Admin lihat daftar RETURN_PENDING di tab "Returns"
        ↓
Admin periksa kondisi buku secara fisik
        ↓
Admin pilih kondisi: GOOD / DAMAGED / LOST
        ↓
[GOOD, tepat waktu] → Selesai, tidak ada denda
[GOOD, terlambat]   → Hitung denda: Rp1.000 × hari terlambat
[DAMAGED]           → Hitung denda kerusakan + keterlambatan
[LOST]              → Hitung biaya penggantian
        ↓
Jika ada denda → Siswa wajib bayar sebelum bisa pinjam lagi
```

**Aturan:**
- Denda keterlambatan: **Rp 1.000 per hari** setelah due date
- Siswa tidak bisa meminjam buku baru jika masih punya denda belum dibayar

---

### 6. Manajemen Denda (Fines)

**Tujuan bisnis:** Memantau dan memproses pembayaran denda dari siswa.

**Alur:**
1. Admin membuka tab **Fines**
2. Melihat daftar denda yang belum dibayar (UNPAID)
3. Siswa datang membayar denda secara tunai
4. Admin memasukkan jumlah bayar
5. Sistem menghitung kembalian dan mencatat pembayaran
6. Status denda berubah menjadi PAID

---

### 7. Pemantauan Kunjungan (Visits)

**Tujuan bisnis:** Merekam dan memantau jumlah siswa yang mengunjungi perpustakaan setiap hari.

**Alur:**
1. Siswa scan QR Code miliknya di pintu masuk perpustakaan
2. Sistem merekam kunjungan dengan timestamp otomatis
3. Admin dapat melihat laporan kunjungan di tab **Visits**
4. Data kunjungan mencakup: nama siswa, waktu masuk, tanggal

---

## Ringkasan Modul Dashboard

| Tab / Halaman | Fungsi |
|---|---|
| **Dashboard Overview** | Statistik ringkas: total buku, peminjaman aktif, denda, kunjungan |
| **Users** | Daftar siswa terdaftar |
| **Add Petugas** | Tambah akun petugas baru |
| **Categories** | CRUD kategori buku |
| **Books** | CRUD buku dan salinan fisik |
| **Borrowings** | Approve/Reject permintaan peminjaman |
| **Returns** | Verifikasi pengembalian buku |
| **Fines** | Proses pembayaran denda |
| **Visits** | Laporan kunjungan siswa via QR |
