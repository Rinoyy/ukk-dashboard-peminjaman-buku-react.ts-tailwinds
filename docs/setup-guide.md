# Dashboard — Panduan Setup

Antarmuka back-office untuk **Admin** dan **Petugas** mengelola operasional perpustakaan.

**Port:** `http://localhost:5173`
**Backend yang dibutuhkan:** `express-qr-backend` berjalan di `http://localhost:3000`

---

## Prasyarat

| Kebutuhan | Versi Minimum |
|---|---|
| Node.js | 18.x atau lebih baru |
| npm | 9.x atau lebih baru |
| Backend (`express-qr-backend`) | Sudah berjalan di port 3000 |

---

## Instalasi & Menjalankan

```bash
# 1. Masuk ke folder dashboard
cd dashboard

# 2. Install dependencies
npm install

# 3. Jalankan development server
npm run dev
```

Buka browser di `http://localhost:5173`.

---

## Koneksi ke Backend

Semua request HTTP diarahkan ke `http://localhost:3000/api`. Konfigurasi ini ada di:

```typescript
// src/lib/api.ts
const BASE_URL = 'http://localhost:3000/api'
```

Token JWT dari `localStorage` secara otomatis disisipkan di setiap request melalui fungsi `getAuthHeaders()`. Jika backend berjalan di port berbeda, ubah `BASE_URL` di file tersebut.

---

## Akun Default

Setelah backend di-seed, gunakan akun berikut untuk login:

| Role | Username | Password |
|---|---|---|
| Admin | `admin` | `admin123` |
| Petugas | `petugas1` | `petugas123` |

> Lihat `express-qr-backend/docs/default-accounts.md` untuk detail lengkap.

---

## Scripts

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Jalankan dev server di port 5173 |
| `npm run build` | Build untuk production (`tsc -b && vite build`) |
| `npm run preview` | Preview hasil build secara lokal |
| `npm run lint` | Jalankan ESLint |

---

## Struktur Folder

```
dashboard/
├── src/
│   ├── App.tsx                  # Root component + router setup
│   ├── main.tsx                 # Entry point React
│   │
│   ├── pages/                   # Halaman utama (satu per fitur)
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx        # Statistik & overview
│   │   ├── Books.tsx            # Manajemen buku + kategori
│   │   ├── BookDetail.tsx       # Detail buku + BookCopy
│   │   ├── Borrowings.tsx       # Daftar PENDING → approve/reject
│   │   ├── Returns.tsx          # Daftar RETURN_PENDING → verifikasi
│   │   ├── Fines.tsx            # Manajemen denda
│   │   ├── Users.tsx            # Daftar siswa + tambah petugas
│   │   └── Visits.tsx           # Log kunjungan via QR
│   │
│   ├── components/              # Komponen UI reusable
│   ├── hooks/                   # Custom hooks (state + logika)
│   ├── services/                # HTTP calls ke backend API
│   ├── lib/
│   │   └── api.ts               # Fetch wrapper (base URL + auth header)
│   └── types/                   # TypeScript interfaces
│
├── package.json
├── vite.config.ts               # Port: 5173
├── tsconfig.json
└── tailwind.config.js
```

---

## Tech Stack

| Teknologi | Versi | Kegunaan |
|---|---|---|
| React | ^19.1.0 | UI Framework |
| TypeScript | ~5.8.3 | Type safety |
| Vite | ^6.3.5 | Build tool & dev server |
| TailwindCSS | ^4.1.18 | Styling |
| React Router | ^7.13.0 | Client-side routing |
| Fetch API | native | HTTP client (`lib/api.ts`) |
| Lucide React | ^0.563.0 | Icon library |
| react-qr-barcode-scanner | ^2.1.23 | Scan QR Code siswa saat check-in |

---

## Troubleshooting

**Port 5173 sudah dipakai:**
```bash
# Hentikan proses di port 5173, lalu jalankan ulang
lsof -ti:5173 | xargs kill
npm run dev
```

**`npm install` gagal:**
```bash
# Hapus node_modules dan cache, lalu install ulang
rm -rf node_modules package-lock.json
npm install
```

**API error / tidak bisa login:**
- Pastikan backend berjalan: `curl http://localhost:3000/api/health` (atau coba akses endpoint lain)
- Cek `src/lib/api.ts` — `BASE_URL` harus `http://localhost:3000/api`
- Buka DevTools → Network tab untuk melihat detail error response

**Token expired (401 Unauthorized):**
- Token JWT berlaku 1 jam. Logout dan login kembali.
- Aplikasi otomatis menghapus token dan memicu event `auth:logout` jika menerima 401.
