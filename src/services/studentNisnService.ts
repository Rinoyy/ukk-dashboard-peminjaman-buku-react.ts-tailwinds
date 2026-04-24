import { API_URL, forceLogout, isUnauthorized } from './api';

export interface StudentNisn {
    id: number;
    nisn: string;
    name: string;
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

export const studentNisnService = {
    getAll: (): Promise<StudentNisn[]> =>
        fetch(`${API_URL}/student-nisns`, { headers: headers() }).then(handleRes),

    create: (nisn: string, name: string): Promise<StudentNisn> =>
        fetch(`${API_URL}/student-nisns`, {
            method: 'POST', headers: headers(), body: JSON.stringify({ nisn, name }),
        }).then(handleRes),

    update: (id: number, nisn: string, name: string): Promise<StudentNisn> =>
        fetch(`${API_URL}/student-nisns/${id}`, {
            method: 'PUT', headers: headers(), body: JSON.stringify({ nisn, name }),
        }).then(handleRes),

    delete: (id: number): Promise<void> =>
        fetch(`${API_URL}/student-nisns/${id}`, {
            method: 'DELETE', headers: headers(),
        }).then(handleRes),
};
