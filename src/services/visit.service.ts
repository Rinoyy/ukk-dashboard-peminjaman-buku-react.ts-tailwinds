import { API_URL, getHeaders, handleResponse } from './api';

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
        const response = await fetch(`${API_URL}/visits${qs}`, {
            headers: getHeaders(),
        });
        return handleResponse(response);
    }

    async getTodayVisitsCount(): Promise<{ count: number; date: string }> {
        const response = await fetch(`${API_URL}/visits/today/count`, {
            headers: getHeaders(),
        });
        return handleResponse(response);
    }

    async checkIn(userId: number) {
        if (!userId || userId <= 0) {
            throw new Error('ID user tidak valid');
        }

        const response = await fetch(`${API_URL}/visits/checkin`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ userId }),
        });
        return handleResponse(response);
    }
}

export const visitService = new VisitService();
