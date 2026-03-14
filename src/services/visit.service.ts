import { API_URL, forceLogout, isUnauthorized } from './api';

export interface Visit {
    id: number;
    userId: number;
    visitDate: string;
    user: {
        id: number;
        username: string;
        qrCode?: string;
    };
}

class VisitService {
    async getVisits(date?: string): Promise<Visit[]> {
        const qs = date ? `?date=${date}` : '';
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/visits${qs}`, {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
            },
        });

       if (isUnauthorized(response.status)) {
            forceLogout();
            throw new Error('Unauthorized');
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Gagal mengambil data kunjungan');
        }

        return response.json();
    }

    async getTodayVisitsCount(): Promise<{ count: number; date: string }> {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/visits/today/count`, {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
            },
        });

     if (isUnauthorized(response.status)) {
            forceLogout();
            throw new Error('Unauthorized');
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Gagal mengambil jumlah kunjungan');
        }

        return response.json();
    }

    async checkIn(userId: number) {
        if (!userId || userId <= 0) {
            throw new Error('ID user tidak valid');
        }

        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/visits/checkin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: JSON.stringify({ userId }),
        });

     if (isUnauthorized(response.status)) {
            forceLogout();
            throw new Error('Unauthorized');
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Gagal check-in');
        }

        return response.json();
    }
}

export const visitService = new VisitService();
