import { useState, useEffect, useCallback } from 'react';
import { categoryService, type Category } from '../services/categoryService';

export const useCategories = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        try {
            const data = await categoryService.getCategories();
            setCategories(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    const addCategory = async (data: { name: string; description?: string }): Promise<boolean> => {
        try {
            await categoryService.createCategory(data);
            await fetchCategories();
            return true;
        } catch {
            return false;
        }
    };

    const editCategory = async (id: number, data: { name: string; description?: string }): Promise<boolean> => {
        try {
            await categoryService.updateCategory(id, data);
            await fetchCategories();
            return true;
        } catch {
            return false;
        }
    };

    const removeCategory = async (id: number): Promise<boolean> => {
        try {
            await categoryService.deleteCategory(id);
            await fetchCategories();
            return true;
        } catch {
            return false;
        }
    };

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    return { categories, loading, fetchCategories, addCategory, editCategory, removeCategory };
};
