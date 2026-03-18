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
| Axios | ~1.x | HTTP client untuk API calls |

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
│   │   ├── ProtectedRoute.tsx     # Guard route berdasarkan role ADMIN
│   │   └── RootRedirect.tsx       # Redirect / ke halaman yang sesuai
│   │
│   ├── pages/
│   │   ├── Login.tsx              # Halaman login admin
│   │   ├── AdminDashboard.tsx     # Halaman utama admin (dengan tab)
│   │   └── AddPetugas.tsx         # Form tambah akun petugas
│   │
│   ├── components/
│   │   ├── DashboardLayout.tsx    # Layout utama (sidebar + content)
│   │   ├── DashboardOverview.tsx  # Widget statistik
│   │   ├── AdminBooks.tsx         # Manajemen buku
│   │   ├── AdminBorrowings.tsx    # Kelola permintaan peminjaman
│   │   ├── AdminFines.tsx         # Kelola denda
│   │   ├── SiswaList.tsx          # Daftar siswa
│   │   ├── Visits.tsx             # Data kunjungan
│   │   ├── Categories.tsx         # Manajemen kategori
│   │   └── Pagination.tsx         # Komponen paginasi reusable
│   │
│   ├── hooks/
│   │   ├── useAuth.ts             # State & logic autentikasi
│   │   ├── useBooks.ts            # CRUD buku
│   │   ├── useBorrow.ts           # Approve/reject peminjaman
│   │   └── useFines.ts            # Kelola denda
│   │
│   ├── services/
│   │   ├── authService.ts         # API calls: login, logout
│   │   ├── bookService.ts         # API calls: CRUD buku
│   │   └── visitService.ts        # API calls: data kunjungan
│   │
│   ├── lib/
│   │   └── api.ts                 # Axios instance (base URL + interceptor token)
│   │
│   └── types/
│       └── index.ts               # Semua TypeScript interfaces
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
    |
    |--(1) User isi form (email + password)
    |
    |--(2) Panggil authService.login()
    |         └── POST /api/auth/login
    |
    |--(3) Response: { token, user }
    |
    |--(4) Simpan token ke localStorage
    |
    |--(5) Redirect ke /admin/dashboard
```

### Protected Route

```typescript
// ProtectedRoute.tsx
// Setiap route admin di-wrap dengan komponen ini
const ProtectedRoute = () => {
  const token = localStorage.getItem('token')
  const user = parseJWT(token)

  if (!token || user.role !== 'ADMIN') {
    return <Navigate to="/login" />
  }
  return <Outlet />
}
```

### Axios Interceptor

```typescript
// lib/api.ts
// Token otomatis disisipkan di setiap request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

---

## Alur Teknis: Manajemen State

### Custom Hooks Pattern

Setiap fitur menggunakan **custom hook** untuk memisahkan logika dari tampilan:

```
Component (UI)
    ↑ ↓ (data & handlers)
Custom Hook (logika + state)
    ↑ ↓ (HTTP calls)
Service (API layer)
    ↑ ↓ (HTTP)
Backend API
```

**Contoh: useBooks.ts**
```typescript
const useBooks = () => {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(false)

  const fetchBooks = async () => {
    setLoading(true)
    const data = await bookService.getAll()
    setBooks(data)
    setLoading(false)
  }

  const createBook = async (payload: CreateBookDto) => {
    await bookService.create(payload)
    await fetchBooks() // refresh list
  }

  return { books, loading, fetchBooks, createBook }
}
```

---

## Alur Teknis: Routing

```
/                      → RootRedirect → /login (atau /admin jika sudah login)
/login                 → Login.tsx
/admin                 → ProtectedRoute (cek role ADMIN)
  └── /admin/dashboard → AdminDashboard.tsx
        ├── Tab: Dashboard  → DashboardOverview
        ├── Tab: Users      → SiswaList
        ├── Tab: Categories → Categories
        ├── Tab: Books      → AdminBooks
        ├── Tab: Borrowings → AdminBorrowings
        ├── Tab: Returns    → AdminBorrowings (mode return)
        ├── Tab: Fines      → AdminFines
        └── Tab: Visits     → Visits
/admin/add-petugas     → AddPetugas.tsx (ProtectedRoute)
```

---

## Alur Teknis: API Integration

### Service Layer Pattern

```typescript
// services/bookService.ts
const bookService = {
  getAll: () => api.get('/books').then(r => r.data),
  getById: (id: string) => api.get(`/books/${id}`).then(r => r.data),
  create: (data: FormData) => api.post('/books', data).then(r => r.data),
  update: (id: string, data: FormData) => api.put(`/books/${id}`, data).then(r => r.data),
  delete: (id: string) => api.delete(`/books/${id}`).then(r => r.data),
}
```

### Endpoint yang Digunakan Dashboard

| Service | Method | Endpoint | Deskripsi |
|---|---|---|---|
| Auth | POST | `/api/auth/login` | Login admin |
| Books | GET | `/api/books` | Ambil daftar buku |
| Books | POST | `/api/books` | Tambah buku baru |
| Books | PUT | `/api/books/:id` | Update buku |
| Books | DELETE | `/api/books/:id` | Hapus buku |
| Borrowings | GET | `/api/borrow` | Semua peminjaman |
| Borrowings | PATCH | `/api/borrow/:id/approve` | Setujui peminjaman |
| Borrowings | PATCH | `/api/borrow/:id/reject` | Tolak peminjaman |
| Borrowings | PATCH | `/api/borrow/:id/verify-return` | Verifikasi pengembalian |
| Fines | POST | `/api/borrow/:id/pay-fine` | Proses pembayaran |
| Users | GET | `/api/users` | Daftar pengguna |
| Categories | GET/POST | `/api/categories` | Manajemen kategori |
| Visits | GET | `/api/visits` | Data kunjungan |

---

## Alur Teknis: Komponen UI Utama

### AdminDashboard.tsx
- Komponen induk yang menampilkan tab navigasi
- Menyimpan state `activeTab` untuk mengontrol konten yang ditampilkan
- Render komponen yang sesuai berdasarkan tab aktif

### DashboardLayout.tsx
- Wrapper layout: sidebar navigasi + area konten utama
- Sidebar berisi link ke semua modul
- Tampilan responsif menggunakan TailwindCSS

### AdminBorrowings.tsx
- Menampilkan daftar peminjaman dengan filter status
- Tombol Approve/Reject untuk PENDING
- Tombol Verify Return untuk RETURN_PENDING
- Modal form untuk input kondisi buku saat pengembalian

### Pagination.tsx
- Komponen reusable untuk paginasi
- Menerima props: `total`, `page`, `pageSize`, `onPageChange`

---

## TypeScript Types Utama

```typescript
// types/index.ts

interface User {
  id: string
  name: string
  nis?: string
  email: string
  role: 'ADMIN' | 'SISWA' | 'PETUGAS'
  qrCode?: string
}

interface Book {
  id: string
  title: string
  author: string
  description: string
  image?: string
  categoryId: string
  category: Category
  copies: BookCopy[]
}

interface BookCopy {
  id: string
  bookId: string
  status: 'AVAILABLE' | 'RESERVED' | 'BORROWED' | 'DAMAGED' | 'LOST'
  qrCode: string
}

interface Borrowing {
  id: string
  userId: string
  bookCopyId: string
  status: 'PENDING' | 'BORROWED' | 'RETURN_PENDING' | 'RETURNED' | 'REJECTED' | 'CANCELLED'
  borrowDate: string
  dueDate: string
  actualReturnDate?: string
  lateFee: number
  damageFee: number
  totalFine: number
  isPaid: boolean
  condition?: 'GOOD' | 'DAMAGED' | 'LOST'
  user: User
  bookCopy: BookCopy & { book: Book }
}
```

---

## Build & Development

```bash
# Install dependencies
npm install

# Development server (port 5174 by default)
npm run dev

# Build untuk production
npm run build

# Preview build hasil
npm run preview
```

### Environment
- Dev server berjalan di `http://localhost:5174`
- API base URL dikonfigurasi di `src/lib/api.ts`
- Target backend: `http://localhost:3000`
