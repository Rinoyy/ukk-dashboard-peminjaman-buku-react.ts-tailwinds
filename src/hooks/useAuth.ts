import { useState, useEffect } from 'react';
import { authService } from '../services/auth.service';
import type { User } from '../types/index';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (credentials: any) => {
        try {
            const data = await authService.login(credentials);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);
            if (data.user.role === 'ADMIN') navigate('/admin');
            else navigate('/siswa');
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    };

    const register = async (userData: any) => {
        try {
            await authService.register(userData);
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        navigate('/login');
    };

    return { user, login, register, logout, loading };
};
