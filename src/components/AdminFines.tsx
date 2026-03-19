import React, { useMemo, useState } from 'react';
import { useFines } from '../hooks/useFines';
import { useExport } from '../hooks/useExport';
import { useAuth } from '../hooks/useAuth';
import { DollarSign, AlertCircle, CheckCircle, Clock, Search } from 'lucide-react';
import Pagination from './Pagination';

const AdminFines = () => {
    const { summary, fines, loading, error } = useFines();
    const { downloadExport } = useExport();
    const { user } = useAuth();
    const isAdmin = user?.role === 'ADMIN';
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const filteredFines = useMemo(() => {
        const q = search.toLowerCase();
        if (!q) return fines;
        return fines.filter((f) =>
            f.user.username.toLowerCase().includes(q) ||
            f.bookCopy.book.title.toLowerCase().includes(q)
        );
    }, [fines, search]);

    const paginatedFines = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredFines.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredFines, currentPage]);

    const totalPages = Math.ceil(filteredFines.length / ITEMS_PER_PAGE);

    if (loading) return (
        <div className="p-8 text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-2 text-gray-500">Memuat data denda...</p>
        </div>
    );

    if (error) return (
        <div className="p-6 text-red-600 bg-red-50 rounded-lg border border-red-200 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>Gagal memuat data: {error.message || 'Unknown error'}</span>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
                    <DollarSign className="w-8 h-8 text-blue-600" />
                    Rekap Denda
                </h2>
                {isAdmin && (
                    <button
                        onClick={() => downloadExport('damaged')}
                        className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors text-sm"
                    >
                        Export Barang Rusak/Hilang
                    </button>
                )}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 rounded-full">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Denda Masuk</p>
                            <p className="text-xl font-bold text-gray-900">
                                Rp {summary?.totalPaid.toLocaleString('id-ID') || 0}
                            </p>
                            <p className="text-xs text-green-600 mt-1">{summary?.paidCount || 0} transaksi lunas</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-100 rounded-full">
                            <AlertCircle className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Belum Dibayar</p>
                            <p className="text-xl font-bold text-gray-900">
                                Rp {summary?.totalUnpaid.toLocaleString('id-ID') || 0}
                            </p>
                            <p className="text-xs text-red-600 mt-1">{summary?.unpaidCount || 0} transaksi tertunggak</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Fines Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between gap-4">
                    <h3 className="font-bold text-gray-800">Rincian Denda Siswa</h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari siswa atau judul buku..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                            className="pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-72"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-4 text-sm font-semibold text-gray-600">Siswa</th>
                                <th className="p-4 text-sm font-semibold text-gray-600">Buku</th>
                                <th className="p-4 text-sm font-semibold text-gray-600 text-center">Tanggal Kembali</th>
                                <th className="p-4 text-sm font-semibold text-gray-600 text-right">Terlambat</th>
                                <th className="p-4 text-sm font-semibold text-gray-600 text-right">Kerusakan</th>
                                <th className="p-4 text-sm font-semibold text-gray-600 text-right">Total Denda</th>
                                <th className="p-4 text-sm font-semibold text-gray-600 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {paginatedFines.map((fine) => (
                                <tr key={fine.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 font-medium text-gray-900">{fine.user.username}</td>
                                    <td className="p-4 text-gray-600">{fine.bookCopy.book.title}</td>
                                    <td className="p-4 text-center text-gray-500 text-sm">
                                        {new Date(fine.actualReturnDate).toLocaleDateString('id-ID')}
                                    </td>
                                    <td className="p-4 text-right text-gray-600">
                                        Rp {fine.lateFee.toLocaleString('id-ID')}
                                    </td>
                                    <td className="p-4 text-right text-gray-600">
                                        Rp {fine.damageFee.toLocaleString('id-ID')}
                                    </td>
                                    <td className="p-4 text-right font-bold text-gray-900">
                                        Rp {fine.totalFine.toLocaleString('id-ID')}
                                    </td>
                                    <td className="p-4 text-center">
                                        {fine.isPaid ? (
                                            <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full flex items-center justify-center gap-1 w-fit mx-auto">
                                                <CheckCircle className="w-3 h-3" /> Lunas
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-700 rounded-full flex items-center justify-center gap-1 w-fit mx-auto">
                                                <Clock className="w-3 h-3" /> Belum Lunas
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredFines.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-gray-500">
                                        {search ? 'Data tidak ditemukan.' : 'Tidak ada data denda.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="p-4 border-t border-gray-100">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            totalItems={fines.length}
                            itemsPerPage={ITEMS_PER_PAGE}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminFines;
