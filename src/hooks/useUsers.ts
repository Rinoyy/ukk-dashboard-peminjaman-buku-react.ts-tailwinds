import { useState, useEffect, useCallback } from 'react';
import { userService } from '../services/userService';
import type { User } from '../types/index';

export const useUsers = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const data = await userService.getUsers();
            setUsers(data.filter(u => u.role === 'SISWA'));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchStaff = useCallback(async () => {
        setLoading(true);
        try {
            const data = await userService.getUsers();
            setUsers(data.filter(u => u.role === 'PETUGAS'));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteUser = async (id: number): Promise<boolean> => {
        try {
            await userService.deleteUser(id);
            await fetchUsers();
            return true;
        } catch {
            return false;
        }
    };

    const createStaff = async (username: string, password: string): Promise<boolean> => {
        try {
            await userService.createStaff(username, password);
            return true;
        } catch (err) {
            throw err;
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    return { users, loading, fetchUsers, fetchStaff, deleteUser, createStaff };
};
