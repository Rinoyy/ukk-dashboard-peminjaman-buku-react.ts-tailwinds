import api from './api';
import type { LoginResponse, User } from '../types/index';

export const login = async (credentials: { username: string; password: string }) => {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    return response.data;
};

export const register = async (userData: { username: string; password: string; role: string }) => {
    const response = await api.post<{ message: string; user: User }>('/auth/register', userData);
    return response.data;
};
