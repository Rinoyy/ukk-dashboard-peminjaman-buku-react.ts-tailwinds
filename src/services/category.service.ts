import api from './api';

export interface Category {
    id: number;
    name: string;
    description?: string;
    _count?: { books: number };
}

export const getCategories = async () => {
    const response = await api.get<Category[]>('/categories');
    return response.data;
};

export const createCategory = async (data: { name: string; description?: string }) => {
    const response = await api.post<Category>('/categories', data);
    return response.data;
};

export const updateCategory = async (id: number, data: { name: string; description?: string }) => {
    const response = await api.put<Category>(`/categories/${id}`, data);
    return response.data;
};

export const deleteCategory = async (id: number) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
};
