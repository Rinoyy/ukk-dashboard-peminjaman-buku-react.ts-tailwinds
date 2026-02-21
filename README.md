# Dashboard Perpustakaan Digital 📚

Selamat datang di repositori Dashboard Perpustakaan Digital. Aplikasi ini merupakan pusat kendali (Back-Office) yang digunakan oleh **Admin** dan **Petugas** untuk mengelola seluruh operasional perpustakaan secara efisien.

## 🚀 Gambaran Umum
Dashboard ini dirancang untuk memudahkan manajemen buku, peminjaman, hingga monitoring kunjungan anggota. Semua data terintegrasi secara real-time dengan backend untuk memastikan akurasi informasi.

## 🛠 Fitur Utama

### 📖 Manajemen Literasi (Buku & Kategori)
- **Katalog Buku:** Menambah, mengubah, dan menghapus data buku beserta informasi detail seperti penulis dan deskripsi.
- **Kategori:** Mengelompokkan buku ke dalam kategori tertentu untuk memudahkan pencarian.
- **Copy Buku & QR Code:** Setiap buku dapat memiliki beberapa salinan (copies), masing-masing dengan nomor unik dan sistem pelacakan berbasis QR Code.

### 🔄 Sirkulasi (Peminjam & Pengembalian)
- **Peminjaman:** Melacak status peminjaman siswa mulai dari pengajuan (pending + reservasi copy) hingga status dipinjam.
- **Pengembalian:** Memproses pengembalian buku dan mencatat kondisi buku (Baik/Rusak/Hilang).
- **Anti Double-Booking:** Copy buku otomatis direservasi (`RESERVED`) saat pengajuan, mencegah konflik peminjaman.

### 💰 Pengelola Keuangan (Denda)
- **Kalkulasi Denda:** Sistem secara otomatis menghitung denda jika terjadi keterlambatan pengembalian atau kerusakan buku.
- **Pembayaran:** Memproses pembayaran denda oleh siswa dan mencatat riwayat transaksi.

### 👥 Manajemen Pengguna
- **Data Siswa:** Mengelola daftar anggota perpustakaan (Siswa).
- **Petugas:** Admin memiliki kemampuan untuk menambah akun Petugas baru ke dalam sistem.

### 📊 Monitoring & Statistik
- **Statistik Cepat:** Melihat ringkasan jumlah buku, peminjaman aktif, dan denda melalui Dashboard Overview.
- **Log Kunjungan:** Memantau riwayat kunjungan siswa ke perpustakaan.

### 📥 Export Data (CSV)
Semua data penting dapat didownload dalam format CSV melalui tombol **Export CSV** yang tersedia di setiap halaman:
- **Buku** — Data buku lengkap dengan status setiap copy
- **Kategori** — Daftar kategori + jumlah buku per kategori
- **Peminjaman** — Data peminjaman aktif (Pending/Borrowed/Return Pending)
- **Pengembalian** — Riwayat pengembalian dengan denda
- **Pengguna** — Daftar siswa terdaftar
- **Barang Rusak/Hilang** — Copy buku berstatus DAMAGED/LOST
- **Kunjungan** — Log kunjungan siswa ke perpustakaan

## 💻 Pengembangan (Development)
Dashboard ini dibangun menggunakan teknologi modern:
- **Framework:** React 19 (Vite)
- **Bahasa:** TypeScript
- **Styling:** Tailwind CSS

### Cara Menjalankan
1. Pastikan dependencies sudah terinstal:
   ```bash
   npm install
   ```
2. Jalankan server pengembangan:
   ```bash
   npm run dev
   ```

---
*Dokumentasi ini dibuat untuk memberikan gambaran global mengenai fungsionalitas Dashboard.*
