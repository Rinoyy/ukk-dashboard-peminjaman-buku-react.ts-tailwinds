import { useState, useEffect, useCallback } from 'react';
import { bookService } from '../services/book.service';
import type { Book } from '../types/index';

export const useBooks = () => {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const fetchBooks = useCallback(async (params?: any) => {
        setLoading(true);
        try {
            const data = await bookService.getBooks(params);
            setBooks(data);
            setError(null);
        } catch (error) {
            console.error(error);
            setError(error);
        } finally {
            setLoading(false);
        }
    }, []);

    const addBook = async (bookData: any) => {
        setError(null);
        try {
            await bookService.createBook(bookData);
            fetchBooks();
            return true;
        } catch (error) {
            console.error(error);
            setError(error);
            return false;
        }
    };

    const editBook = async (id: number, bookData: any) => {
        setError(null);
        try {
            await bookService.updateBook(id, bookData);
            fetchBooks();
            return true;
        } catch (error) {
            console.error(error);
            setError(error);
            return false;
        }
    };

    const removeBook = async (id: number) => {
        setError(null);
        try {
            await bookService.deleteBook(id);
            fetchBooks();
            return true;
        } catch (error) {
            console.error(error);
            setError(error);
            return false;
        }
    };

    const addCopy = async (bookId: number) => {
        setError(null);
        try {
            await bookService.addBookCopy(bookId);
            fetchBooks();
            return true;
        } catch (error) {
            console.error(error);
            setError(error);
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
            setError(err);
            return false;
        }
    };

    const updateCopyStatus = async (id: number, status: string) => {
        setError(null);
        try {
            await bookService.updateCopyStatus(id, status);
            fetchBooks();
            return true;
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to update status');
            setError(err);
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
