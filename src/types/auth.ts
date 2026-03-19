import type { User } from './user';

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface RegisterData {
    username: string;
    password: string;
    role: string;
}

export interface LoginResponse {
    token: string;
    user: User;
}

export interface RegisterResponse {
    message: string;
    user: User;
}
