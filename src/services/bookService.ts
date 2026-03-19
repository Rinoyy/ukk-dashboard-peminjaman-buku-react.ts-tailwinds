import { API_URL, forceLogout, isUnauthorized } from './api';
import type { Book, BookCopy, BookCopyStatus } from '../types/index';

class BookService {
    async getBooks(params?: { search?: string; categoryId?: number }): Promise<Book[]> {
        const query = new URLSearchParams();
        if (params?.search) query.set('search', params.search);
        if (params?.categoryId) query.set('categoryId', String(params.categoryId));
        const qs = query.toString();

        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/books${qs ? `?${qs}` : ''}`, {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
            },
        });

        if (isUnauthorized(response.status)) {
            forceLogout();
            throw new Error('Unauthorized');
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Gagal mengambil data buku');
        }

        return response.json();
    }

    async getBookById(id: number): Promise<Book> {
        if (!id || id <= 0) {
            throw new Error('ID buku tidak valid');
        }

        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/books/${id}`, {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
            },
        });

        if (isUnauthorized(response.status)) {
            forceLogout();
            throw new Error('Unauthorized');
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Gagal mengambil detail buku');
        }

        return response.json();
    }

    async createBook(bookData: Partial<Book> & { stock?: number }, imageFile?: File): Promise<Book> {
        if (!bookData.title || !bookData.title.trim()) {
            throw new Error('Judul buku wajib diisi');
        }
        if (!bookData.author || !bookData.author.trim()) {
            throw new Error('Penulis buku wajib diisi');
        }

        const token = localStorage.getItem('token');
        const formData = new FormData();
        if (bookData.title) formData.append('title', bookData.title);
        if (bookData.author) formData.append('author', bookData.author);
        if (bookData.categoryId) formData.append('categoryId', String(bookData.categoryId));
        if (bookData.description) formData.append('description', bookData.description);
        if (bookData.stock) formData.append('stock', String(bookData.stock));
        if (imageFile) formData.append('image', imageFile);

        const response = await fetch(`${API_URL}/books`, {
            method: 'POST',
            headers: {
                ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: formData,
        });

        if (isUnauthorized(response.status)) {
            forceLogout();
            throw new Error('Unauthorized');
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Gagal menambah buku');
        }

        return response.json();
    }

    async updateBook(id: number, bookData: Partial<Book>, imageFile?: File): Promise<Book> {
        if (!id || id <= 0) {
            throw new Error('ID buku tidak valid');
        }
        if (!bookData || Object.keys(bookData).length === 0) {
            throw new Error('Data buku yang akan diubah wajib diisi');
        }

        const token = localStorage.getItem('token');
        const formData = new FormData();
        if (bookData.title) formData.append('title', bookData.title);
        if (bookData.author) formData.append('author', bookData.author);
        if (bookData.categoryId) formData.append('categoryId', String(bookData.categoryId));
        if (bookData.description !== undefined) formData.append('description', bookData.description || '');
        if (imageFile) formData.append('image', imageFile);

        const response = await fetch(`${API_URL}/books/${id}`, {
            method: 'PUT',
            headers: {
                ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: formData,
        });

        if (isUnauthorized(response.status)) {
            forceLogout();
            throw new Error('Unauthorized');
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Gagal mengubah buku');
        }

        return response.json();
    }

    async deleteBook(id: number) {
        if (!id || id <= 0) {
            throw new Error('ID buku tidak valid');
        }

        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/books/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
            },
        });

        if (isUnauthorized(response.status)) {
            forceLogout();
            throw new Error('Unauthorized');
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Gagal menghapus buku');
        }

        return response.json();
    }

    async updateCopyStatus(id: number, status: BookCopyStatus) {
        if (!id || id <= 0) {
            throw new Error('ID copy tidak valid');
        }
        if (!status || !status.trim()) {
            throw new Error('Status wajib diisi');
        }

        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/book-copies/${id}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: JSON.stringify({ status }),
        });

        if (isUnauthorized(response.status)) {
            forceLogout();
            throw new Error('Unauthorized');
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Gagal mengubah status copy');
        }

        return response.json();
    }

    async getBookCopies(bookId: number): Promise<BookCopy[]> {
        if (!bookId || bookId <= 0) {
            throw new Error('ID buku tidak valid');
        }

        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/book-copies/${bookId}`, {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
            },
        });

        if (isUnauthorized(response.status)) {
            forceLogout();
            throw new Error('Unauthorized');
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Gagal mengambil data copy');
        }

        return response.json();
    }

    async addBookCopy(bookId: number): Promise<BookCopy> {
        if (!bookId || bookId <= 0) {
            throw new Error('ID buku tidak valid');
        }

        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/book-copies`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: JSON.stringify({ bookId }),
        });

        if (isUnauthorized(response.status)) {
            forceLogout();
            throw new Error('Unauthorized');
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Gagal menambah copy');
        }

        return response.json();
    }

    async deleteBookCopy(copyId: number) {
        if (!copyId || copyId <= 0) {
            throw new Error('ID copy tidak valid');
        }

        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/book-copies/${copyId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
            },
        });

        if (isUnauthorized(response.status)) {
            forceLogout();
            throw new Error('Unauthorized');
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Gagal menghapus copy');
        }

        return response.json();
    }
}

export const bookService = new BookService();
