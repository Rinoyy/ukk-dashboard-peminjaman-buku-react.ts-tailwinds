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
        const response = await fetch(`${API_URL}/categories`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    }

    async updateCategory(id: number, data: { name: string; description?: string }): Promise<Category> {
        const response = await fetch(`${API_URL}/categories/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    }

    async deleteCategory(id: number) {
        const response = await fetch(`${API_URL}/categories/${id}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        return handleResponse(response);
    }
}

export const categoryService = new CategoryService();
