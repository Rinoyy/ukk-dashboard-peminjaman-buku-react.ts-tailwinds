const API_URL = 'http://localhost:3000/api';

function forceLogout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
}

export { API_URL, forceLogout };
