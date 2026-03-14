import { API_URL, getHeaders, handleResponse } from './api';
import type { User } from '../types/index';

class UserService {
    async getUsers(): Promise<User[]> {
        const response = await fetch(`${API_URL}/users`, {
            headers: getHeaders(),
        });
        return handleResponse(response);
    }

    async deleteUser(id: number) {
        if (!id || id <= 0) {
            throw new Error('ID user tidak valid');
        }

        const response = await fetch(`${API_URL}/users/${id}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        return handleResponse(response);
    }
}

export const userService = new UserService();
