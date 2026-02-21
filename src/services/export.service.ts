import api from './api';

type ExportType = 'books' | 'categories' | 'borrowings' | 'returns' | 'users' | 'damaged' | 'visits';

const fileNames: Record<ExportType, string> = {
    books: 'data-buku.csv',
    categories: 'data-kategori.csv',
    borrowings: 'data-peminjaman.csv',
    returns: 'data-pengembalian.csv',
    users: 'data-pengguna.csv',
    damaged: 'data-barang-rusak-hilang.csv',
    visits: 'data-kunjungan.csv',
};

export const downloadExport = async (type: ExportType): Promise<void> => {
    try {
        const response = await api.get(`/export/${type}`, {
            responseType: 'blob',
        });

        const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileNames[type];
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error(`Error downloading ${type} export:`, error);
        alert(`Gagal mengunduh data ${type}. Pastikan Anda memiliki akses.`);
    }
};
