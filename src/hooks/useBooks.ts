import { useState, useEffect, useCallback } from 'react';
import { bookService } from '../services/bookService';
import type { Book, BookFormData, BookFilterParams, BookCopyStatus } from '../types/index';

export const useBooks = () => {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchBooks = useCallback(async (params?: BookFilterParams) => {
        setLoading(true);
        try {
            const data = await bookService.getBooks(params);
            setBooks(data);
            setError(null);
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Gagal mengambil data buku');
        } finally {
            setLoading(false);
        }
    }, []);

    const addBook = async (bookData: BookFormData, imageFile?: File) => {
        setError(null);
        try {
            await bookService.createBook(bookData, imageFile);
            fetchBooks();
            return true;
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Gagal menambah buku');
            return false;
        }
    };

    const editBook = async (id: number, bookData: Partial<BookFormData>, imageFile?: File) => {
        setError(null);
        try {
            await bookService.updateBook(id, bookData, imageFile);
            fetchBooks();
            return true;
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Gagal mengubah buku');
            return false;
        }
    };

    const removeBook = async (id: number) => {
        setError(null);
        try {
            await bookService.deleteBook(id);
            fetchBooks();
            return true;
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Gagal menghapus buku');
            return false;
        }
    };

    const addCopy = async (bookId: number) => {
        setError(null);
        try {
            await bookService.addBookCopy(bookId);
            fetchBooks();
            return true;
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Gagal menambah eksemplar');
            return false;
        }
    };

    const deleteCopy = async (id: number) => {
        setError(null);
        try {
            await bookService.deleteBookCopy(id);
            fetchBooks();
            return true;
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Gagal menghapus eksemplar');
            return false;
        }
    };

    const updateCopyStatus = async (id: number, status: BookCopyStatus) => {
        setError(null);
        try {
            await bookService.updateCopyStatus(id, status);
            fetchBooks();
            return true;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to update status';
            alert(message);
            setError(message);
            return false;
        }
    };

    useEffect(() => {
        fetchBooks();
    }, [fetchBooks]);

    return {
        books,
        loading,
        error,
        fetchBooks,
        addBook,
        editBook,
        removeBook,
        addCopy,
        deleteCopy,
        updateCopyStatus
    };
};
