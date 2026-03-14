import { API_URL, getHeaders, handleResponse } from './api';
import type { User } from '../types/index';

interface LoginResponse {
    token: string;
    user: User;
}

class AuthService {
    async login(credentials: { username: string; password: string }): Promise<LoginResponse> {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(credentials),
        });
        return handleResponse(response);
    }

    async register(userData: { username: string; password: string; role: string }): Promise<{ message: string; user: User }> {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(userData),
        });
        return handleResponse(response);
    }
}

export const authService = new AuthService();
