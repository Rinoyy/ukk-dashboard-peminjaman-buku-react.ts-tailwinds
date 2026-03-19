const BASE_URL = 'http://localhost:3000/api';

function getAuthHeaders(isFormData = false): Record<string, string> {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {};
    if (!isFormData) headers['Content-Type'] = 'application/json';
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
}

function handleUnauthorized(status: number): void {
    if (status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('auth:logout'));
    }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, options);
    handleUnauthorized(res.status);
    if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { message?: string };
        throw new Error(err.message || 'Request failed');
    }
    return res.json();
}

const api = {
    get: <T>(path: string) =>
        request<T>(path, { headers: getAuthHeaders() }),

    post: <T>(path: string, body: unknown) =>
        request<T>(path, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(body),
        }),

    put: <T>(path: string, body: unknown) =>
        request<T>(path, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(body),
        }),

    delete: <T>(path: string) =>
        request<T>(path, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        }),
};

export default api;
