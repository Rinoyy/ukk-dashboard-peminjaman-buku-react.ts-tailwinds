import { API_URL, forceLogout, isUnauthorized } from './api';
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

        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: JSON.stringify(credentials),
        });

        if (isUnauthorized(response.status)) {
            forceLogout();
            throw new Error('Unauthorized');
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Login gagal');
        }

        return response.json();
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

        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: JSON.stringify(userData),
        });

        if (isUnauthorized(response.status)) {
            forceLogout();
            throw new Error('Unauthorized');
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Registrasi gagal');
        }

        return response.json();
    }
}

export const authService = new AuthService();
