const API_URL = 'http://localhost:3000/api';

function forceLogout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
}

function isUnauthorized(status: number): boolean {
    return status === 401 || status === 403;
}

export { API_URL, forceLogout, isUnauthorized };
