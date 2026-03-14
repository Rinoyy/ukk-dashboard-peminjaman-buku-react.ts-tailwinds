import { API_URL, getHeaders, handleResponse } from './api';
import type { User } from '../types/index';

interface LoginResponse {
    token: string;
    user: User;
}

class AuthService {
    async login(credentials: { username: string; password: string }): Promise<LoginResponse> {
        if (!credentials.username || !credentials.username.trim()) {
            throw new Error('Username wajib diisi');
        }
        if (!credentials.password || !credentials.password.trim()) {
            throw new Error('Password wajib diisi');
        }

        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(credentials),
        });
        return handleResponse(response);
    }

    async register(userData: { username: string; password: string; role: string }): Promise<{ message: string; user: User }> {
        if (!userData.username || !userData.username.trim()) {
            throw new Error('Username wajib diisi');
        }
        if (!userData.password || !userData.password.trim()) {
            throw new Error('Password wajib diisi');
        }
        if (!userData.role || !userData.role.trim()) {
            throw new Error('Role wajib diisi');
        }

        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(userData),
        });
        return handleResponse(response);
    }
}

export const authService = new AuthService();
