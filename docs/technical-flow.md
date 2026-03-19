# Dashboard Admin — Alur Teknis

---

## Tech Stack

| Teknologi | Versi | Kegunaan |
|---|---|---|
| React | 19 | UI Framework |
| TypeScript | ~5.x | Type safety |
| Vite | ~6.x | Build tool & dev server |
| TailwindCSS | ~3.x | Styling |
| React Router | v7 | Client-side routing |
| Fetch API | native | HTTP client untuk API calls |

---

## Struktur Proyek

```
dashboard/
├── src/
│   ├── App.tsx                    # Root component, mounting router
│   ├── main.tsx                   # Entry point React
│   │
│   ├── routes/
│   │   ├── index.tsx              # Definisi semua route
│   │   ├── ProtectedRoute.tsx     # Guard: cek role ADMIN sebelum akses
│   │   └── RootRedirect.tsx       # Redirect / ke halaman yang sesuai
│   │
│   ├── pages/
│   │   ├── Login.tsx              # Halaman login admin/petugas
│   │   ├── AdminDashboard.tsx     # Halaman utama (dengan tab navigasi)
│   │   └── AddPetugas.tsx         # Form tambah akun petugas
│   │
│   ├── components/
│   │   ├── DashboardLayout.tsx    # Layout: sidebar + content area
│   │   ├── DashboardOverview.tsx  # Widget statistik ringkas
│   │   ├── AdminBooks.tsx         # Manajemen buku + copies
│   │   ├── AdminBorrowings.tsx    # Kelola peminjaman + pengembalian
│   │   ├── AdminFines.tsx         # Kelola denda + pembayaran
│   │   ├── SiswaList.tsx          # Daftar siswa
│   │   ├── Visits.tsx             # Data kunjungan + scan
│   │   ├── Categories.tsx         # Manajemen kategori
│   │   └── Pagination.tsx         # Komponen paginasi reusable
│   │
│   ├── hooks/
│   │   ├── useAuth.ts             # State & logic autentikasi
│   │   ├── useBooks.ts            # CRUD buku
│   │   ├── useBorrow.ts           # Approve/reject/verify peminjaman
│   │   └── useFines.ts            # Kelola denda
│   │
│   ├── services/
│   │   ├── authService.ts         # API: login, logout
│   │   ├── bookService.ts         # API: CRUD buku
│   │   └── visitService.ts        # API: data kunjungan
│   │
│   ├── lib/
│   │   └── api.ts                 # Fetch wrapper + auth header + 401 handler
│   │
│   └── types/
│       └── users.ts              #  TypeScript interfaces
│
├── package.json
├── vite.config.ts
├── tsconfig.json
└── tailwind.config.js
```

---

## Alur Teknis: Autentikasi

### Login Flow

```
[Login.tsx]
    │
    ├─(1) Admin/Petugas isi form (username + password)
    │
    ├─(2) Panggil authService.login()
    │        └── POST /api/auth/login
    │              Body: { username, password }
    │
    ├─(3) Response: { token, user: { id, username, role, ... } }
    │
    ├─(4) Simpan token + user ke localStorage
    │
    └─(5) Redirect ke /admin/dashboard
```

### Protected Route

```typescript
// routes/ProtectedRoute.tsx
const ProtectedRoute = () => {
  const token = localStorage.getItem('token')
  const user = token ? JSON.parse(atob(token.split('.')[1])) : null

  if (!token || !['ADMIN', 'PETUGAS'].includes(user?.role)) {
    return <Navigate to="/login" replace />
  }
  return <Outlet />
}
```

### Fetch Wrapper (`lib/api.ts`)

```typescript
// lib/api.ts
const BASE_URL = 'http://localhost:3000/api'

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('token')
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  return headers
}

// Token otomatis disisipkan di setiap request
// Error 401 otomatis hapus token + trigger auth:logout event
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, options)
  if (res.status === 401) {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.dispatchEvent(new Event('auth:logout'))
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { message?: string }
    throw new Error(err.message || 'Request failed')
  }
  return res.json()
}
```

---

## Alur Teknis: Routing

```
/                      → RootRedirect → /login (atau /admin jika sudah login)
/login                 → Login.tsx
/admin                 → ProtectedRoute (cek role ADMIN/PETUGAS)
  └── /admin/dashboard → AdminDashboard.tsx
        ├── Tab: Dashboard  → DashboardOverview
        ├── Tab: Users      → SiswaList
        ├── Tab: Categories → Categories
        ├── Tab: Books      → AdminBooks
        ├── Tab: Borrowings → AdminBorrowings (mode: PENDING requests)
        ├── Tab: Returns    → AdminBorrowings (mode: RETURN_PENDING)
        ├── Tab: Fines      → AdminFines
        └── Tab: Visits     → Visits
/admin/add-petugas     → AddPetugas.tsx (ProtectedRoute)
```

---

## Alur Teknis: Manajemen State

### Custom Hooks Pattern

Setiap fitur menggunakan **custom hook** untuk memisahkan logika dari tampilan:

```
Component (UI)
    ↑↓ data & event handlers
Custom Hook (logika + state)
    ↑↓ HTTP calls
Service (API layer)
    ↑↓ HTTP
Backend API
```

**Contoh: useBorrow.ts (approve peminjaman)**
```typescript
const useBorrow = () => {
  const [borrowings, setBorrowings] = useState<Borrowing[]>([])
  const [loading, setLoading] = useState(false)

  const fetchBorrowings = async () => {
    setLoading(true)
    const data = await api.get('/borrow').then(r => r.data)
    setBorrowings(data)
    setLoading(false)
  }

  const approveBorrow = async (id: number) => {
    await api.patch(`/borrow/${id}/approve`, { status: 'BORROWED' })
    await fetchBorrowings()  // refresh list
  }

  const rejectBorrow = async (id: number, rejectReason: string) => {
    await api.patch(`/borrow/${id}/approve`, { status: 'REJECTED', rejectReason })
    await fetchBorrowings()
  }

  const verifyReturn = async (id: number, condition: string, damageFee: number) => {
    await api.patch(`/borrow/${id}/verify-return`, { status: 'RETURNED', condition, damageFee })
    await fetchBorrowings()
  }

  return { borrowings, loading, fetchBorrowings, approveBorrow, rejectBorrow, verifyReturn }
}
```

---

## Alur Teknis: API Integration

### Service Layer

```typescript
// services/bookService.ts
const bookService = {
  getAll: (params?: { search?: string; categoryId?: number }) =>
    api.get('/books', { params }).then(r => r.data),

  getById: (id: number) =>
    api.get(`/books/${id}`).then(r => r.data),

  create: (data: FormData) =>   // multipart/form-data untuk upload gambar
    api.post('/books', data).then(r => r.data),

  update: (id: number, data: FormData) =>
    api.put(`/books/${id}`, data).then(r => r.data),

  delete: (id: number) =>
    api.delete(`/books/${id}`).then(r => r.data),

  // Tambah copy baru ke buku yang sudah ada
  addCopy: (bookId: number) =>
    api.post('/book-copies', { bookId }).then(r => r.data),
}
```

### Endpoint yang Digunakan Dashboard

| Service | Method | Endpoint | Deskripsi |
|---|---|---|---|
| Auth | POST | `/api/auth/login` | Login admin/petugas |
| Books | GET | `/api/books` | Daftar buku + stok |
| Books | POST | `/api/books` | Tambah buku (form-data) |
| Books | PUT | `/api/books/:id` | Update buku |
| Books | DELETE | `/api/books/:id` | Hapus buku |
| Book Copies | GET | `/api/book-copies/:bookId` | Copy dari buku |
| Book Copies | POST | `/api/book-copies` | Tambah copy |
| Book Copies | PATCH | `/api/book-copies/:id/status` | Update status manual |
| Categories | GET | `/api/categories` | Daftar kategori |
| Categories | POST | `/api/categories` | Tambah kategori |
| Categories | PUT | `/api/categories/:id` | Update kategori |
| Categories | DELETE | `/api/categories/:id` | Hapus kategori |
| Borrowings | GET | `/api/borrow` | Semua peminjaman |
| Borrowings | PATCH | `/api/borrow/:id/approve` | Approve/Reject |
| Borrowings | PATCH | `/api/borrow/:id/pickup` | Tandai diambil |
| Borrowings | PATCH | `/api/borrow/:id/verify-return` | Verifikasi pengembalian |
| Fines | GET | `/api/borrow/fines-recap` | Rekap denda |
| Fines | POST | `/api/borrow/:id/pay-fine` | Proses pembayaran |
| Users | GET | `/api/users` | Daftar pengguna |
| Users | POST | `/api/users` | Tambah petugas |
| Users | DELETE | `/api/users/:id` | Hapus user |
| Visits | GET | `/api/visits` | Data kunjungan |
| Visits | POST | `/api/visits/checkin` | Check-in via QR |
| Visits | POST | `/api/visits/checkout` | Check-out via QR |
| Visits | GET | `/api/visits/today/count` | Jumlah hari ini |
| Export | GET | `/api/export/*` | Export CSV |

---

## Alur Teknis: Komponen UI Utama

### AdminDashboard.tsx
- Komponen induk dengan tab navigasi
- State `activeTab` mengontrol konten yang ditampilkan
- Render komponen yang sesuai berdasarkan tab aktif

### AdminBorrowings.tsx
- Menampilkan daftar peminjaman dengan filter status
- **Mode PENDING:** Tombol Approve dan Reject
- **Mode RETURN_PENDING:** Tombol Verify Return dengan modal kondisi buku
- Modal form input kondisi (GOOD/DAMAGED/LOST) + damageFee

### AdminFines.tsx
- Daftar denda belum bayar beserta detail siswa dan buku
- Form input nominal bayar → sistem hitung kembalian
- Ringkasan total denda lunas vs belum lunas

### Pagination.tsx
- Komponen reusable untuk navigasi halaman
- Props: `total`, `page`, `pageSize`, `onPageChange`

---

## TypeScript Types Utama

```typescript
// types/index.ts

interface User {
  id: number
  username: string
  nisn?: string
  role: 'ADMIN' | 'PETUGAS' | 'SISWA'
  qrCode?: string
  createdAt: string
}

interface BookCopy {
  id: number
  bookId: number
  copyNumber: number
  status: 'AVAILABLE' | 'RESERVED' | 'BORROWED' | 'DAMAGED' | 'LOST'
  qrCode?: string
}

interface Book {
  id: number
  title: string
  author: string
  description?: string
  image?: string
  categoryId?: number
  category?: Category
  copies: BookCopy[]
  stock: number        // jumlah copy AVAILABLE
  totalCopies: number
}

interface Borrowing {
  id: number
  userId: number
  bookCopyId: number
  status: 'PENDING' | 'BORROWED' | 'RETURN_PENDING' | 'RETURNED' | 'REJECTED' | 'CANCELLED'
  borrowDate?: string
  dueDate?: string
  actualReturnDate?: string
  condition?: 'GOOD' | 'DAMAGED' | 'LOST'
  rejectReason?: string
  lateFee: number
  damageFee: number
  totalFine: number
  isPickedUp: boolean
  isPaid: boolean
  user: User
  bookCopy: BookCopy & { book: Book }
  payment?: Payment
}

interface Payment {
  id: number
  borrowingId: number
  amount: number
  amountPaid: number
  change: number
  paidAt: string
}
```

---

## Build & Development

```bash
# Install dependencies
npm install

# Development server
npm run dev
# Buka: http://localhost:5173

# Build untuk production
npm run build

# Preview build hasil
npm run preview
```

### Environment
- Dev server berjalan di `http://localhost:5173`
- API base URL dikonfigurasi di `src/lib/api.ts`
- Target backend: `http://localhost:3000`
