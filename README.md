# Dashboard Perpustakaan Digital

Antarmuka web (Back-Office) untuk **Admin** dan **Petugas** mengelola seluruh operasional perpustakaan digital.

**Port development:** `http://localhost:5173`

---

## Teknologi

| Teknologi | Versi | Kegunaan |
|---|---|---|
| React | 19 | UI Framework |
| TypeScript | ~5.x | Type safety |
| Vite | ~6.x | Build tool |
| TailwindCSS | ~3.x | Styling |
| React Router | v7 | Routing |
| Fetch API | native | HTTP client |

---

## Status Peminjaman & BookCopy

| BorrowStatus | Keterangan |
|---|---|
| `PENDING` | Menunggu approve/reject admin |
| `BORROWED` | Disetujui, sedang dipinjam |
| `RETURN_PENDING` | Siswa minta kembali, tunggu verifikasi |
| `RETURNED` | Selesai |
| `REJECTED` | Ditolak |
| `CANCELLED` | Dibatalkan / auto-cancel |

| CopyStatus | Keterangan |
|---|---|
| `AVAILABLE` | Tersedia |
| `RESERVED` | Diblok (ada PENDING) |
| `BORROWED` | Sedang dipinjam |
| `DAMAGED` | Rusak |
| `LOST` | Hilang |

---

## Fitur Utama

### Manajemen Literasi (Buku & Kategori)
- CRUD buku + upload cover image
- Setiap buku memiliki beberapa **salinan fisik (BookCopy)** dengan QR Code unik
- Pantau status tiap copy: AVAILABLE / RESERVED / BORROWED / DAMAGED / LOST
- Tambah copy baru ke buku yang sudah ada

### Sirkulasi Peminjaman
- Lihat daftar PENDING → Approve atau Reject dengan alasan
- Tandai buku sudah diambil siswa (isPickedUp)
- Copy otomatis di-RESERVED saat ada permintaan, mencegah double-booking
- Auto-cancel PENDING > 24 jam (via cron job backend)

### Verifikasi Pengembalian
- Lihat daftar RETURN_PENDING
- Verifikasi kondisi: GOOD / DAMAGED / LOST
- Denda keterlambatan dihitung otomatis (Rp 1.000/hari)
- Denda kerusakan/hilang diinput manual

### Manajemen Denda
- Rekap total denda lunas vs belum lunas
- Proses pembayaran tunai + hitung kembalian

### Manajemen Pengguna
- Daftar siswa terdaftar
- Tambah akun Petugas (hanya Admin)

### Monitoring
- Statistik dashboard: buku, peminjaman aktif, denda, kunjungan hari ini
- Log kunjungan siswa via scan QR + filter per tanggal

### Export Data (CSV)
Tersedia di setiap halaman:
- Buku, Kategori, Peminjaman Aktif, Pengembalian, Pengguna, Buku Rusak/Hilang, Kunjungan

---

## Menjalankan

```bash
npm install
npm run dev
```

Pastikan backend (`express-qr-backend`) sudah berjalan di port 3000.

---

## Dokumentasi Lengkap

| File | Isi |
|---|---|
| [docs/business-flow.md](./docs/business-flow.md) | Alur bisnis per modul |
| [docs/technical-flow.md](./docs/technical-flow.md) | Detail teknis, routing, types |
