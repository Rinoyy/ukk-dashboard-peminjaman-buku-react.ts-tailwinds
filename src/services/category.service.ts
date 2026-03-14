import { API_URL, getHeaders, handleResponse } from './api';

export interface Category {
    id: number;
    name: string;
    description?: string;
    _count?: { books: number };
}

class CategoryService {
    async getCategories(): Promise<Category[]> {
        const response = await fetch(`${API_URL}/categories`, {
            headers: getHeaders(),
        });
        return handleResponse(response);
    }

    async createCategory(data: { name: string; description?: string }): Promise<Category> {
        if (!data.name || !data.name.trim()) {
            throw new Error('Nama kategori wajib diisi');
        }

        const response = await fetch(`${API_URL}/categories`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    }

    async updateCategory(id: number, data: { name: string; description?: string }): Promise<Category> {
        if (!id || id <= 0) {
            throw new Error('ID kategori tidak valid');
        }
        if (!data.name || !data.name.trim()) {
            throw new Error('Nama kategori wajib diisi');
        }

        const response = await fetch(`${API_URL}/categories/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    }

    async deleteCategory(id: number) {
        if (!id || id <= 0) {
            throw new Error('ID kategori tidak valid');
        }

        const response = await fetch(`${API_URL}/categories/${id}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        return handleResponse(response);
    }
}

export const categoryService = new CategoryService();
