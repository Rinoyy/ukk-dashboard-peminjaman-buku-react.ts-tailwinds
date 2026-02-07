import api from './api';
import type { Book, BookCopy } from '../types/index';

export const getBooks = async (params?: { search?: string; categoryId?: number }) => {
    const response = await api.get<Book[]>('/books', { params });
    return response.data;
};

export const getBookById = async (id: number) => {
    const response = await api.get<Book>(`/books/${id}`);
    return response.data;
};

export const createBook = async (bookData: Partial<Book> & { stock?: number }) => {
    const response = await api.post<Book>('/books', bookData);
    return response.data;
};

export const updateBook = async (id: number, bookData: Partial<Book>) => {
    const response = await api.put<Book>(`/books/${id}`, bookData);
    return response.data;
};

export const deleteBook = async (id: number) => {
    const response = await api.delete(`/books/${id}`);
    return response.data;
};

export const updateCopyStatus = async (id: number, status: string) => {
    const response = await api.patch(`/copies/${id}/status`, { status });
    return response.data;
};

// Book Copy Services
export const getBookCopies = async (bookId: number) => {
    const response = await api.get<BookCopy[]>(`/copies/${bookId}`);
    return response.data;
};

export const addBookCopy = async (bookId: number) => {
    const response = await api.post<BookCopy>('/copies', { bookId });
    return response.data;
};

export const deleteBookCopy = async (copyId: number) => {
    const response = await api.delete(`/copies/${copyId}`);
    return response.data;
};
