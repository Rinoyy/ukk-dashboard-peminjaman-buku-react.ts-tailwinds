export interface User {
    id: number;
    username: string;
    role: 'ADMIN' | 'SISWA';
    qrCode?: string;
    createdAt: string;
}
