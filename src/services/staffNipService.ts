import { API_URL, forceLogout, isUnauthorized } from './api';

export interface StaffNip {
    id: number;
    nip: string;
    name: string;
    role: 'GURU' | 'STAFF';
    createdAt: string;
}

const headers = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
    };
};

const handleRes = async (res: Response) => {
    if (isUnauthorized(res.status)) { forceLogout(); throw new Error('Unauthorized'); }
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Request gagal');
    }
    return res.json();
};

export const staffNipService = {
    getAll: (): Promise<StaffNip[]> =>
        fetch(`${API_URL}/staff-nips`, { headers: headers() }).then(handleRes),

    create: (nip: string, name: string, role: 'GURU' | 'STAFF'): Promise<StaffNip> =>
        fetch(`${API_URL}/staff-nips`, {
            method: 'POST', headers: headers(), body: JSON.stringify({ nip, name, role }),
        }).then(handleRes),

    update: (id: number, nip: string, name: string, role: 'GURU' | 'STAFF'): Promise<StaffNip> =>
        fetch(`${API_URL}/staff-nips/${id}`, {
            method: 'PUT', headers: headers(), body: JSON.stringify({ nip, name, role }),
        }).then(handleRes),

    delete: (id: number): Promise<void> =>
        fetch(`${API_URL}/staff-nips/${id}`, {
            method: 'DELETE', headers: headers(),
        }).then(handleRes),
};
