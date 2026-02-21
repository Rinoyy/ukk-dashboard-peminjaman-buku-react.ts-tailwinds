import { useEffect, useState, useMemo } from 'react';
import { useBorrow } from '../hooks/useBorrow';
import Pagination from './Pagination';
import EmptyState from './EmptyState';
import type { Borrowing } from '../types';
import { downloadExport } from '../services/export.service';
import { CheckCircle, XCircle, AlertCircle, DollarSign, BookOpen, Download } from 'lucide-react';

const AdminBorrowings = () => {
    const { borrowings, loading, error, fetchBorrowings, adminApproveBorrow, adminVerifyReturn, payFine } = useBorrow();


    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    // Modals state
    const [selectedBorrowing, setSelectedBorrowing] = useState<Borrowing | null>(null);
    const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    // Return form
    const [returnCondition, setReturnCondition] = useState<'GOOD' | 'DAMAGED' | 'LOST'>('GOOD');
    const [damageFee, setDamageFee] = useState<number | ''>(0); // Allow empty string

    // Payment form
    const [amountPaid, setAmountPaid] = useState<number | ''>(0); // Allow empty string
    const [change, setChange] = useState<number | null>(null);

    // ... (existing code)

    const handleProcessPayment = async () => {
        if (!selectedBorrowing) return;

        // Ensure amountPaid is number
        const amount = amountPaid === '' ? 0 : amountPaid;

        const result = await payFine(selectedBorrowing.id, amount);
        if (result) {
            setChange(result.change);
            // Delay closing to show change
            setTimeout(() => {
                setIsPaymentModalOpen(false);
                setChange(null);
                setSelectedBorrowing(null);
            }, 3000);
        }
    };

    // ...

    const openReturnModal = (borrowing: Borrowing) => {
        setSelectedBorrowing(borrowing);
        setReturnCondition('GOOD');
        setDamageFee(''); // Start empty or 0 if preferred, user wants to delete 0 easily so empty is better or 0 but handler fixes it
        setIsReturnModalOpen(true);
    };

    const handleConfirmReturn = async () => {
        if (!selectedBorrowing) return;
        const fee = damageFee === '' ? 0 : damageFee;

        await adminVerifyReturn(selectedBorrowing.id, 'RETURNED', returnCondition, fee);
        setIsReturnModalOpen(false);
        setSelectedBorrowing(null);
    };

    const openPaymentModal = (borrowing: Borrowing) => {
        setSelectedBorrowing(borrowing);
        setAmountPaid(''); // Start empty easier for typing
        setChange(null);
        setIsPaymentModalOpen(true);
    };

    // ... In render ...

    {
        returnCondition !== 'GOOD' && (
            <div className="mb-6">
                <label className="block text-sm font-medium mb-1">Denda Kerusakan (Rp)</label>
                <input
                    type="number"
                    value={damageFee}
                    onChange={(e) => {
                        const val = e.target.value;
                        setDamageFee(val === '' ? '' : Number(val));
                    }}
                    className="w-full p-2 border rounded-lg"
                    min="0"
                    placeholder="0"
                />
                <p className="text-xs text-gray-500 mt-1">Masukkan nominal denda kerusakan/kehilangan.</p>
            </div>
        )
    }

    // ...

    <input
        type="number"
        value={amountPaid}
        onChange={(e) => {
            const val = e.target.value;
            setAmountPaid(val === '' ? '' : Number(val));
        }}
        className="w-full pl-10 p-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
        min={selectedBorrowing?.totalFine}
        autoFocus
        placeholder="0"
    />

    useEffect(() => {
        fetchBorrowings();
    }, [fetchBorrowings]);



    const paginatedBorrowings = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return borrowings.slice(start, start + ITEMS_PER_PAGE);
    }, [borrowings, currentPage]);

    const totalPages = Math.ceil(borrowings.length / ITEMS_PER_PAGE);





    if (loading) return <div className="p-8 text-center"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div><p className="mt-2 text-gray-500">Memuat data peminjaman...</p></div>;

    if (error) return <div className="p-6 text-red-600 bg-red-50 rounded-lg border border-red-200 flex items-center gap-2"><AlertCircle className="w-5 h-5" /> <span>Gagal memuat data: {error}</span></div>;

    return (
        <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                    Borrowing Management
                </h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => downloadExport('borrowings')}
                        className="flex items-center gap-2 px-3 py-1.5 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 text-sm transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        Peminjaman
                    </button>
                    <button
                        onClick={() => downloadExport('returns')}
                        className="flex items-center gap-2 px-3 py-1.5 text-green-600 border border-green-600 rounded-lg hover:bg-green-50 text-sm transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        Pengembalian
                    </button>
                </div>
            </div>

            {borrowings.length === 0 ? (
                <EmptyState message="Belum ada permintaan peminjaman." />
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-100 text-sm text-gray-600">
                                    <th className="p-3 border-b">ID</th>
                                    <th className="p-3 border-b">User</th>
                                    <th className="p-3 border-b">Book</th>
                                    <th className="p-3 border-b">Dates</th>
                                    <th className="p-3 border-b">Status</th>
                                    <th className="p-3 border-b">Fines</th>
                                    <th className="p-3 border-b">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {paginatedBorrowings.map((b) => (
                                    <tr key={b.id} className="hover:bg-gray-50 border-b last:border-0">
                                        <td className="p-3">#{b.id}</td>
                                        <td className="p-3 font-medium">{b.user?.username}</td>
                                        <td className="p-3">
                                            <div className="flex flex-col">
                                                <span className="font-medium">{b.bookCopy?.book.title}</span>
                                                <span className="text-xs text-gray-500">Copy #{b.bookCopy?.copyNumber}</span>
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <div className="flex flex-col gap-1 text-xs">
                                                {b.borrowDate && (
                                                    <span className="text-gray-600">
                                                        Borrow: {new Date(b.borrowDate).toLocaleDateString()}
                                                    </span>
                                                )}
                                                {b.dueDate && (
                                                    <span className={`font-medium ${new Date() > new Date(b.dueDate) && b.status === 'BORROWED' ? 'text-red-600' : 'text-blue-600'}`}>
                                                        Due: {new Date(b.dueDate).toLocaleDateString()}
                                                    </span>
                                                )}
                                                {b.actualReturnDate && (
                                                    <span className="text-green-600">
                                                        Returned: {new Date(b.actualReturnDate).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <span
                                                className={`px-2 py-1 text-xs rounded-full font-medium inline-block ${b.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                    b.status === 'BORROWED' ? 'bg-blue-100 text-blue-800' :
                                                        b.status === 'RETURN_PENDING' ? 'bg-orange-100 text-orange-800' :
                                                            b.status === 'RETURNED' ? 'bg-green-100 text-green-800' :
                                                                'bg-red-100 text-red-800'
                                                    }`}
                                            >
                                                {b.status.replace('_', ' ')}
                                            </span>
                                            {b.condition && b.condition !== 'GOOD' && (
                                                <span className="ml-2 px-2 py-1 text-xs rounded-full bg-red-50 text-red-600 border border-red-200">
                                                    {b.condition}
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-3">
                                            {b.totalFine > 0 ? (
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-red-600 font-bold">
                                                        Rp {b.totalFine.toLocaleString('id-ID')}
                                                    </span>
                                                    {b.isPaid ? (
                                                        <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                                                            <CheckCircle className="w-3 h-3" /> PAID
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-red-500 font-medium flex items-center gap-1">
                                                            <AlertCircle className="w-3 h-3" /> UNPAID
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="p-3">
                                            <div className="flex gap-2">
                                                {b.status === 'PENDING' && (
                                                    <>
                                                        <button
                                                            onClick={() => adminApproveBorrow(b.id, 'BORROWED')}
                                                            className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                                                            title="Approve"
                                                        >
                                                            <CheckCircle className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => adminApproveBorrow(b.id, 'REJECTED')}
                                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                                                            title="Reject"
                                                        >
                                                            <XCircle className="w-5 h-5" />
                                                        </button>
                                                    </>
                                                )}

                                                {b.status === 'RETURN_PENDING' && (
                                                    <button
                                                        onClick={() => openReturnModal(b)}
                                                        className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
                                                    >
                                                        Verify Return
                                                    </button>
                                                )}

                                                {b.totalFine > 0 && !b.isPaid && (
                                                    <button
                                                        onClick={() => openPaymentModal(b)}
                                                        className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 font-medium flex items-center gap-1"
                                                    >
                                                        <DollarSign className="w-3 h-3" />
                                                        Pay Fine
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        totalItems={borrowings.length}
                        itemsPerPage={ITEMS_PER_PAGE}
                    />
                </>
            )}

            {/* Modal Verify Return */}
            {isReturnModalOpen && selectedBorrowing && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                    <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl">
                        <h3 className="text-lg font-bold mb-4">Verifikasi Pengembalian</h3>

                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Kondisi Buku</label>
                            <select
                                value={returnCondition}
                                onChange={(e) => setReturnCondition(e.target.value as any)}
                                className="w-full p-2 border rounded-lg"
                            >
                                <option value="GOOD">Baik (Good)</option>
                                <option value="DAMAGED">Rusak (Damaged)</option>
                                <option value="LOST">Hilang (Lost)</option>
                            </select>
                        </div>

                        {returnCondition !== 'GOOD' && (
                            <div className="mb-6">
                                <label className="block text-sm font-medium mb-1">Denda Kerusakan (Rp)</label>
                                <input
                                    type="number"
                                    value={damageFee}
                                    onChange={(e) => setDamageFee(Number(e.target.value))}
                                    className="w-full p-2 border rounded-lg"
                                    min="0"
                                />
                                <p className="text-xs text-gray-500 mt-1">Masukkan nominal denda kerusakan/kehilangan.</p>
                            </div>
                        )}

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setIsReturnModalOpen(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleConfirmReturn}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Proses Pengembalian
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Payment */}
            {isPaymentModalOpen && selectedBorrowing && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                    <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl">
                        <h3 className="text-lg font-bold mb-4">Pembayaran Denda</h3>

                        <div className="bg-red-50 p-4 rounded-lg mb-4 border border-red-100">
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-600">Total Denda:</span>
                                <span className="font-bold text-red-600 text-lg">
                                    Rp {selectedBorrowing.totalFine.toLocaleString('id-ID')}
                                </span>
                            </div>
                            <div className="text-xs text-gray-500">
                                {selectedBorrowing.lateFee > 0 && <div>• Keterlambatan: Rp {selectedBorrowing.lateFee.toLocaleString()}</div>}
                                {selectedBorrowing.damageFee > 0 && <div>• Kerusakan: Rp {selectedBorrowing.damageFee.toLocaleString()}</div>}
                            </div>
                        </div>

                        {!change ? (
                            <div className="mb-6">
                                <label className="block text-sm font-medium mb-1">Uang Diterima (Cash)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2 text-gray-500">Rp</span>
                                    <input
                                        type="number"
                                        value={amountPaid}
                                        onChange={(e) => setAmountPaid(Number(e.target.value))}
                                        className="w-full pl-10 p-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                        min={selectedBorrowing.totalFine}
                                        autoFocus
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="mb-6 bg-green-50 p-4 rounded-lg border border-green-100 text-center animate-in fade-in zoom-in">
                                <p className="text-green-800 font-medium mb-1">Pembayaran Berhasil!</p>
                                <p className="text-sm text-gray-600">Kembalian:</p>
                                <p className="text-2xl font-bold text-green-700">Rp {change.toLocaleString('id-ID')}</p>
                            </div>
                        )}

                        <div className="flex justify-end gap-2">
                            {!change && (
                                <>
                                    <button
                                        onClick={() => setIsPaymentModalOpen(false)}
                                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={handleProcessPayment}
                                        disabled={amountPaid < selectedBorrowing.totalFine}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Bayar Sekarang
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminBorrowings;
