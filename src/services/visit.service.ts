import api from './api';

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

export const getVisits = async (date?: string) => {
    const params = date ? { date } : {};
    const response = await api.get<Visit[]>('/visits', { params });
    return response.data;
};

export const getTodayVisitsCount = async () => {
    const response = await api.get<{ count: number; date: string }>('/visits/today/count');
    return response.data;
};

export const checkIn = async (userId: number) => {
    const response = await api.post('/visits/checkin', { userId });
    return response.data;
};
