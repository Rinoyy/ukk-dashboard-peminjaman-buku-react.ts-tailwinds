import { API_URL, getHeaders, handleResponse } from './api';
import type { Book, BookCopy } from '../types/index';

class BookService {
    async getBooks(params?: { search?: string; categoryId?: number }): Promise<Book[]> {
        const query = new URLSearchParams();
        if (params?.search) query.set('search', params.search);
        if (params?.categoryId) query.set('categoryId', String(params.categoryId));
        const qs = query.toString();

        const response = await fetch(`${API_URL}/books${qs ? `?${qs}` : ''}`, {
            headers: getHeaders(),
        });
        return handleResponse(response);
    }

    async getBookById(id: number): Promise<Book> {
        if (!id || id <= 0) {
            throw new Error('ID buku tidak valid');
        }

        const response = await fetch(`${API_URL}/books/${id}`, {
            headers: getHeaders(),
        });
        return handleResponse(response);
    }

    async createBook(bookData: Partial<Book> & { stock?: number }): Promise<Book> {
        if (!bookData.title || !bookData.title.trim()) {
            throw new Error('Judul buku wajib diisi');
        }
        if (!bookData.author || !bookData.author.trim()) {
            throw new Error('Penulis buku wajib diisi');
        }

        const response = await fetch(`${API_URL}/books`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(bookData),
        });
        return handleResponse(response);
    }

    async updateBook(id: number, bookData: Partial<Book>): Promise<Book> {
        if (!id || id <= 0) {
            throw new Error('ID buku tidak valid');
        }
        if (!bookData || Object.keys(bookData).length === 0) {
            throw new Error('Data buku yang akan diubah wajib diisi');
        }

        const response = await fetch(`${API_URL}/books/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(bookData),
        });
        return handleResponse(response);
    }

    async deleteBook(id: number) {
        if (!id || id <= 0) {
            throw new Error('ID buku tidak valid');
        }

        const response = await fetch(`${API_URL}/books/${id}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        return handleResponse(response);
    }

    async updateCopyStatus(id: number, status: string) {
        if (!id || id <= 0) {
            throw new Error('ID copy tidak valid');
        }
        if (!status || !status.trim()) {
            throw new Error('Status wajib diisi');
        }

        const response = await fetch(`${API_URL}/copies/${id}/status`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify({ status }),
        });
        return handleResponse(response);
    }

    // Book Copy Methods
    async getBookCopies(bookId: number): Promise<BookCopy[]> {
        if (!bookId || bookId <= 0) {
            throw new Error('ID buku tidak valid');
        }

        const response = await fetch(`${API_URL}/copies/${bookId}`, {
            headers: getHeaders(),
        });
        return handleResponse(response);
    }

    async addBookCopy(bookId: number): Promise<BookCopy> {
        if (!bookId || bookId <= 0) {
            throw new Error('ID buku tidak valid');
        }

        const response = await fetch(`${API_URL}/copies`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ bookId }),
        });
        return handleResponse(response);
    }

    async deleteBookCopy(copyId: number) {
        if (!copyId || copyId <= 0) {
            throw new Error('ID copy tidak valid');
        }

        const response = await fetch(`${API_URL}/copies/${copyId}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        return handleResponse(response);
    }
}

export const bookService = new BookService();
