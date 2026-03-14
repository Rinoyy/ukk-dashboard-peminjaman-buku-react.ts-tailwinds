import { API_URL, getHeaders } from './api';

type ExportType = 'books' | 'categories' | 'borrowings' | 'returns' | 'users' | 'damaged' | 'visits';

class ExportService {
    private fileNames: Record<ExportType, string> = {
        books: 'data-buku.csv',
        categories: 'data-kategori.csv',
        borrowings: 'data-peminjaman.csv',
        returns: 'data-pengembalian.csv',
        users: 'data-pengguna.csv',
        damaged: 'data-barang-rusak-hilang.csv',
        visits: 'data-kunjungan.csv',
    };

    async downloadExport(type: ExportType): Promise<void> {
        try {
            const response = await fetch(`${API_URL}/export/${type}`, {
                headers: getHeaders(),
            });

            if (response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return;
            }

            if (!response.ok) {
                throw new Error('Export failed');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = this.fileNames[type];
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error(`Error downloading ${type} export:`, error);
            alert(`Gagal mengunduh data ${type}. Pastikan Anda memiliki akses.`);
        }
    }
}

export const exportService = new ExportService();
