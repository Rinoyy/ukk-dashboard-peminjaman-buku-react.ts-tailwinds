import { API_URL, forceLogout, isUnauthorized } from './api';

export interface Category {
    id: number;
    name: string;
    description?: string;
    _count?: { books: number };
}

class CategoryService {
    async getCategories(): Promise<Category[]> {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/categories`, {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
            },
        });

        if (isUnauthorized(response.status)) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
            throw new Error('Unauthorized');
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Gagal mengambil data kategori');
        }

        return response.json();
    }

    async createCategory(data: { name: string; description?: string }): Promise<Category> {
        if (!data.name || !data.name.trim()) {
            throw new Error('Nama kategori wajib diisi');
        }

        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/categories`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: JSON.stringify(data),
        });

        if (isUnauthorized(response.status)) {
            forceLogout();
            throw new Error('Unauthorized');
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Gagal menambah kategori');
        }

        return response.json();
    }

    async updateCategory(id: number, data: { name: string; description?: string }): Promise<Category> {
        if (!id || id <= 0) {
            throw new Error('ID kategori tidak valid');
        }
        if (!data.name || !data.name.trim()) {
            throw new Error('Nama kategori wajib diisi');
        }

        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/categories/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: JSON.stringify(data),
        });

        if (isUnauthorized(response.status)) {
            forceLogout();
            throw new Error('Unauthorized');
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Gagal mengubah kategori');
        }

        return response.json();
    }

    async deleteCategory(id: number) {
        if (!id || id <= 0) {
            throw new Error('ID kategori tidak valid');
        }

        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/categories/${id}`, {
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
            throw new Error(errorData.message || 'Gagal menghapus kategori');
        }

        return response.json();
    }
}

export const categoryService = new CategoryService();
