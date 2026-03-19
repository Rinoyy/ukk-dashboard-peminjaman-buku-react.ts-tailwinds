export interface User {
    id: number;
    username: string;
    role: 'ADMIN' | 'PETUGAS' | 'SISWA';
    qrCode?: string;
    createdAt: string;
}
