export interface User {
    id: number;
    username: string;
    role: 'ADMIN' | 'PETUGAS' | 'SISWA' | 'GURU' | 'STAFF';
    qrCode?: string;
    createdAt: string;
}
