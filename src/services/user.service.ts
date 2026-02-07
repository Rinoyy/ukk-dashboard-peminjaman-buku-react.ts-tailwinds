import api from './api';
import type { User } from '../types/index';

export const getUsers = async () => {
    const response = await api.get<User[]>('/users');
    return response.data;
};

export const deleteUser = async (id: number) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
};
