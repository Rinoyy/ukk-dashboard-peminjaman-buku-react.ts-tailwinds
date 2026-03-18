const API_URL = 'http://localhost:3000/api';

function forceLogout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('auth:logout'));
}

function isUnauthorized(status: number): boolean {
    return status === 401;
}

export { API_URL, forceLogout, isUnauthorized };
