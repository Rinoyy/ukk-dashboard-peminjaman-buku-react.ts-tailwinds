# Dashboard Admin — Alur Bisnis

---

## Gambaran Umum

**Dashboard Admin** adalah antarmuka web untuk Admin dan Petugas perpustakaan. Aplikasi ini menjadi pusat kendali seluruh operasional perpustakaan: mulai dari manajemen koleksi buku, persetujuan peminjaman, verifikasi pengembalian, hingga pemantauan kunjungan siswa.

**Akses:** Pengguna dengan role `ADMIN` atau `PETUGAS`.

**Port development:** `http://localhost:5173`

---

## Status Peminjaman & BookCopy (Referensi Cepat)

### Status Peminjaman yang Perlu Ditindaklanjuti Admin/Petugas

| Status | Aksi yang Tersedia |
|---|---|
| `PENDING` | Approve → BORROWED, atau Reject → REJECTED |
| `RETURN_PENDING` | Verifikasi kondisi → RETURNED (+ hitung denda) |
| `BORROWED` | Tandai pickup (isPickedUp = true) |

### Status BookCopy

| Status | Keterangan |
|---|---|
| `AVAILABLE` | Copy tersedia untuk dipinjam |
| `RESERVED` | Diblok sementara (ada PENDING siswa) |
| `BORROWED` | Sedang dipinjam siswa |
| `DAMAGED` | Dikembalikan rusak |
| `LOST` | Dinyatakan hilang |

---

## Fitur Bisnis

### 1. Manajemen Pengguna

**Tujuan bisnis:** Admin memantau dan mengelola seluruh akun pengguna.

**Alur:**
1. Admin buka tab **Users** di sidebar
2. Lihat daftar siswa terdaftar (username, NISN, status)
3. Tambahkan akun Petugas baru via halaman **Add Petugas**

**Aturan:**
- Siswa mendaftar mandiri via Portal Siswa (butuh NISN di whitelist)
- Hanya Admin yang bisa menambah akun Petugas

---

### 2. Manajemen Kategori Buku

**Tujuan bisnis:** Mengelompokkan koleksi buku untuk memudahkan pencarian siswa.

**Alur:**
1. Admin buka tab **Categories**
2. Tambah kategori baru (contoh: Fiksi, Sains, Pemrograman, Sejarah, dll.)
3. Edit atau hapus kategori yang ada
4. Kategori digunakan sebagai filter di Portal Siswa

---

### 3. Manajemen Buku & Salinan (BookCopy)

**Tujuan bisnis:** Mengelola seluruh koleksi buku beserta salinan fisiknya.

**Alur membuat buku baru:**
```
Admin buka tab Books → klik "Tambah Buku"
     ↓
Isi: judul, pengarang, deskripsi, kategori, stok, gambar cover
     ↓
Sistem buat 1 record Book
     ↓
Sistem otomatis buat N record BookCopy (sesuai nilai stok)
     ↓
Tiap BookCopy mendapat copyNumber urut dan QR Code unik
```

**Pantau status tiap copy:**
- `AVAILABLE` — Siap dipinjam
- `RESERVED` — Ada permintaan PENDING siswa
- `BORROWED` — Sedang dipinjam
- `DAMAGED` — Perlu perbaikan
- `LOST` — Tidak dapat ditemukan

**Aturan:**
- Buku yang semua copynya tidak `AVAILABLE` tidak bisa dipinjam siswa
- Admin bisa menambah copy baru ke buku yang sudah ada
- Status copy `RESERVED` dan `BORROWED` tidak bisa diubah manual

---

### 4. Persetujuan Permintaan Peminjaman

**Tujuan bisnis:** Admin/Petugas memverifikasi dan memutuskan apakah permintaan peminjaman dapat diproses.

**Alur:**
```
Siswa request peminjaman
     ↓
Borrowing: PENDING, BookCopy: RESERVED (otomatis)
     ↓
Admin/Petugas lihat daftar PENDING di tab "Borrowings"
     ↓
Admin/Petugas cek ketersediaan & kondisi buku
     ↓
┌── APPROVE ─────────────────────────────────────────────────────┐
│  Borrowing → BORROWED                                           │
│  BookCopy → BORROWED                                            │
│  DueDate = borrowDate + 7 hari                                  │
│  Notifikasi BORROW_APPROVED dikirim ke siswa                    │
└────────────────────────────────────────────────────────────────┘
     │
┌── REJECT (dengan alasan) ───────────────────────────────────────┐
│  Borrowing → REJECTED + rejectReason                            │
│  BookCopy → AVAILABLE kembali                                   │
│  Notifikasi BORROW_REJECTED dikirim ke siswa                    │
└────────────────────────────────────────────────────────────────┘
```

**Aturan:**
- Permintaan yang tidak diproses dalam **24 jam** akan otomatis `CANCELLED` oleh sistem
- Setelah disetujui, siswa wajib mengambil buku dalam **2 hari**

---

### 5. Tandai Buku Diambil (Pickup)

**Tujuan bisnis:** Konfirmasi bahwa siswa sudah mengambil buku dari perpustakaan.

**Alur:**
1. Siswa datang ke perpustakaan untuk mengambil buku
2. Admin/Petugas klik tombol **Pickup** pada borrowing berstatus `BORROWED`
3. `isPickedUp = true`
4. Siswa sekarang bisa mengajukan pengembalian dari Portal Siswa

---

### 6. Verifikasi Pengembalian Buku

**Tujuan bisnis:** Admin memeriksa kondisi fisik buku yang dikembalikan dan menghitung denda.

**Alur:**
```
Siswa request return → Borrowing: RETURN_PENDING
     ↓
Admin/Petugas lihat daftar RETURN_PENDING di tab "Returns"
     ↓
Admin/Petugas periksa kondisi buku secara fisik
     ↓
Pilih kondisi buku:
  ┌── GOOD (tepat waktu)  → denda = 0, copy: AVAILABLE
  ├── GOOD (terlambat)    → denda = Rp1.000 × hari, copy: AVAILABLE
  ├── DAMAGED             → denda = late fee + damage fee (input manual), copy: DAMAGED
  └── LOST                → denda = late fee + biaya ganti (input manual), copy: LOST
     ↓
Jika ada denda → Siswa wajib bayar sebelum bisa pinjam lagi
```

**Formula denda:**
```
daysLate  = ceil((tanggal kembali - dueDate) / 86_400_000)
lateFee   = max(0, daysLate) × Rp 1.000
totalFine = lateFee + damageFee
```

---

### 7. Manajemen Denda (Fines)

**Tujuan bisnis:** Memantau dan memproses pembayaran denda dari siswa.

**Alur:**
1. Admin buka tab **Fines**
2. Lihat daftar denda yang belum dibayar (dengan detail: siswa, buku, jumlah)
3. Siswa datang membayar denda secara tunai
4. Admin input jumlah nominal yang dibayarkan
5. Sistem hitung kembalian = bayar - totalFine
6. Status denda berubah menjadi PAID (`isPaid = true`)
7. Siswa bisa meminjam buku lagi

---

### 8. Pemantauan Kunjungan (Visits)

**Tujuan bisnis:** Merekam dan memantau kehadiran siswa di perpustakaan setiap hari.

**Alur:**
1. Siswa scan QR Code miliknya di pintu masuk
2. Admin/Petugas proses scan → POST `/api/visits/checkin`
3. Sistem merekam kunjungan dengan timestamp
4. Saat keluar, scan lagi untuk check-out
5. Admin lihat laporan kunjungan di tab **Visits** (bisa filter per tanggal)

**Data kunjungan:**
- Username siswa
- Waktu masuk (visitDate)
- Waktu keluar (checkoutDate, null jika masih di dalam)

---

## Ringkasan Modul Dashboard

| Tab / Halaman | Fungsi | Role |
|---|---|---|
| **Dashboard Overview** | Statistik: total buku, peminjaman aktif, denda, kunjungan hari ini | Admin/Petugas |
| **Users** | Daftar siswa terdaftar | Admin |
| **Add Petugas** | Tambah akun petugas baru | Admin |
| **Categories** | CRUD kategori buku | Admin |
| **Books** | CRUD buku, tambah copy, QR Code | Admin |
| **Borrowings** | Approve/Reject permintaan PENDING | Admin/Petugas |
| **Returns** | Verifikasi RETURN_PENDING + hitung denda | Admin/Petugas |
| **Fines** | Proses pembayaran denda | Admin/Petugas |
| **Visits** | Laporan kunjungan + scan check-in/out | Admin/Petugas |

---

## Perbedaan Hak Akses Admin vs Petugas

| Fitur | PETUGAS | ADMIN |
|---|:---:|:---:|
| Approve/Reject peminjaman | ✓ | ✓ |
| Tandai pickup | ✓ | ✓ |
| Verifikasi pengembalian | ✓ | ✓ |
| Proses pembayaran denda | ✓ | ✓ |
| Scan check-in/out kunjungan | ✓ | ✓ |
| Lihat semua borrowing & denda | ✓ | ✓ |
| CRUD buku & kategori | ✗ | ✓ |
| Kelola NISN whitelist | ✗ | ✓ |
| Tambah akun Petugas | ✗ | ✓ |
| Export data CSV | ✗ | ✓ |
