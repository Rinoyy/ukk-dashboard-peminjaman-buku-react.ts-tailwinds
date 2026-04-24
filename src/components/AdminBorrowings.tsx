import { useEffect, useState, useMemo } from 'react';
import { useBorrow } from '../hooks/useBorrow';
import { useVisits } from '../hooks/useVisits';
import { useExport } from '../hooks/useExport';
import { useAuth } from '../hooks/useAuth';
import Pagination from './Pagination';
import EmptyState from './EmptyState';
import type { Borrowing, ReturnCondition } from '../types';
import { CheckCircle, XCircle, AlertCircle, DollarSign, BookOpen, Download, Search } from 'lucide-react';

const todayStr = new Date().toISOString().slice(0, 10);

const RETURN_STATUSES = ['RETURN_PENDING', 'RETURNED'];

const AdminBorrowings = ({ mode }: { mode: 'borrowings' | 'returns' }) => {
    const { borrowings, loading, error, fetchBorrowings, adminApproveBorrow, adminVerifyReturn, markPickedUp, payFine } = useBorrow();
    const { visits, fetchVisits } = useVisits();
    const { downloadExport } = useExport();
    const { user } = useAuth();
    const isAdmin = user?.role === 'ADMIN';

    const isUserCheckedIn = (userId: number) =>
        visits.some((v) => v.userId === userId && v.checkoutDate === null);


    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    // Modals state
    const [selectedBorrowing, setSelectedBorrowing] = useState<Borrowing | null>(null);
    const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

    // Return form
    const [returnCondition, setReturnCondition] = useState<'GOOD' | 'DAMAGED' | 'LOST'>('GOOD');
    const [damageFee, setDamageFee] = useState<number | ''>(0); // Allow empty string

    // Payment form
    const [amountPaid, setAmountPaid] = useState<number | ''>(0); // Allow empty string
    const [change, setChange] = useState<number | null>(null);

    // Reject form
    const [rejectReason, setRejectReason] = useState('');
    const [approveLoading, setApproveLoading] = useState(false);
    const [rejectLoading, setRejectLoading] = useState(false);


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

    const openApproveModal = (borrowing: Borrowing) => {
        setSelectedBorrowing(borrowing);
        setIsApproveModalOpen(true);
    };

    const openRejectModal = (borrowing: Borrowing) => {
        setSelectedBorrowing(borrowing);
        setRejectReason('');
        setIsRejectModalOpen(true);
    };

    const handleConfirmApprove = async () => {
        if (!selectedBorrowing) return;
        setApproveLoading(true);
        await adminApproveBorrow(selectedBorrowing.id, 'BORROWED');
        setApproveLoading(false);
        setIsApproveModalOpen(false);
        setSelectedBorrowing(null);
    };

    const handleConfirmReject = async () => {
        if (!selectedBorrowing) return;
        setRejectLoading(true);
        await adminApproveBorrow(selectedBorrowing.id, 'REJECTED', rejectReason || undefined);
        setRejectLoading(false);
        setIsRejectModalOpen(false);
        setSelectedBorrowing(null);
    };

    const openReturnModal = (borrowing: Borrowing) => {
        setSelectedBorrowing(borrowing);
        setReturnCondition('GOOD');
        setDamageFee('');
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
        fetchVisits(todayStr);
    }, [fetchBorrowings, fetchVisits]);



    const filteredBorrowings = useMemo(() => {
        const byMode = mode === 'borrowings'
            ? borrowings
            : borrowings.filter((b) => RETURN_STATUSES.includes(b.status));
        const q = search.toLowerCase();
        if (!q) return byMode;
        return byMode.filter((b) =>
            b.user?.username.toLowerCase().includes(q) ||
            b.bookCopy?.book.title.toLowerCase().includes(q) ||
            b.status.toLowerCase().includes(q)
        );
    }, [borrowings, search, mode]);

    const paginatedBorrowings = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredBorrowings.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredBorrowings, currentPage]);

    const totalPages = Math.ceil(filteredBorrowings.length / ITEMS_PER_PAGE);





    if (loading) return <div className="p-8 text-center"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div><p className="mt-2 text-gray-500">Memuat data peminjaman...</p></div>;

    if (error) return <div className="p-6 text-red-600 bg-red-50 rounded-lg border border-red-200 flex items-center gap-2"><AlertCircle className="w-5 h-5" /> <span>Gagal memuat data: {error}</span></div>;

    return (
        <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                    {mode === 'borrowings' ? 'Manajemen Peminjaman' : 'Manajemen Pengembalian'}
                </h2>
                {isAdmin && (
                    <button
                        onClick={() => downloadExport(mode === 'borrowings' ? 'borrowings' : 'returns')}
                        className="flex items-center gap-2 px-3 py-1.5 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 cursor-pointer text-sm transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        Ekspor CSV
                    </button>
                )}
            </div>

            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Cari siswa, judul buku, atau status..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                    className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
            </div>

            {filteredBorrowings.length === 0 ? (
                <EmptyState message={search ? 'Data tidak ditemukan.' : mode === 'borrowings' ? 'Belum ada permintaan peminjaman.' : 'Belum ada data pengembalian.'} />
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-100 text-sm text-gray-600">
                                    <th className="p-3 border-b">ID</th>
                                    <th className="p-3 border-b">Pengguna</th>
                                    <th className="p-3 border-b">Buku</th>
                                    <th className="p-3 border-b">Tanggal</th>
                                    <th className="p-3 border-b">Status</th>
                                    <th className="p-3 border-b">Denda</th>
                                    <th className="p-3 border-b">Aksi</th>
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
                                                        Pinjam: {new Date(b.borrowDate).toLocaleDateString()}
                                                    </span>
                                                )}
                                                {b.dueDate && (
                                                    <span className={`font-medium ${new Date() > new Date(b.dueDate) && b.status === 'BORROWED' ? 'text-red-600' : 'text-blue-600'}`}>
                                                        Jatuh Tempo: {new Date(b.dueDate).toLocaleDateString()}
                                                    </span>
                                                )}
                                                {b.actualReturnDate && (
                                                    <span className="text-green-600">
                                                        Dikembalikan: {new Date(b.actualReturnDate).toLocaleDateString()}
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
                                                {b.status === 'BORROWED' && !b.isPickedUp
                                                    ? 'BELUM DIAMBIL'
                                                    : b.status === 'PENDING' ? 'MENUNGGU'
                                                    : b.status === 'BORROWED' ? 'DIPINJAM'
                                                    : b.status === 'RETURN_PENDING' ? 'MENUNGGU KEMBALI'
                                                    : b.status === 'RETURNED' ? 'DIKEMBALIKAN'
                                                    : b.status === 'REJECTED' ? 'DITOLAK'
                                                    : b.status === 'CANCELLED' ? 'DIBATALKAN'
                                                    : b.status}
                                            </span>
                                            {b.condition && b.condition !== 'GOOD' && (
                                                <span className="ml-2 px-2 py-1 text-xs rounded-full bg-red-50 text-red-600 border border-red-200">
                                                    {b.condition === 'DAMAGED' ? 'RUSAK' : b.condition === 'LOST' ? 'HILANG' : b.condition}
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
                                                            <CheckCircle className="w-3 h-3" /> LUNAS
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-red-500 font-medium flex items-center gap-1">
                                                            <AlertCircle className="w-3 h-3" /> BELUM LUNAS
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
                                                            onClick={() => openApproveModal(b)}
                                                            className="p-1.5 text-green-600 hover:bg-green-50 rounded cursor-pointer"
                                                            title="Setujui"
                                                        >
                                                            <CheckCircle className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => openRejectModal(b)}
                                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                                                            title="Tolak"
                                                        >
                                                            <XCircle className="w-5 h-5" />
                                                        </button>
                                                    </>
                                                )}

                                                {b.status === 'BORROWED' && !b.isPickedUp && (
                                                    <button
                                                        onClick={() => markPickedUp(b.id)}
                                                        disabled={!isUserCheckedIn(b.userId)}
                                                        className="px-3 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 cursor-pointer font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                                        title={!isUserCheckedIn(b.userId) ? 'Siswa belum check-in hari ini' : 'Tandai buku sudah diambil siswa'}
                                                    >
                                                        Tandai Diambil
                                                    </button>
                                                )}

                                                {b.status === 'RETURN_PENDING' && (
                                                    <button
                                                        onClick={() => openReturnModal(b)}
                                                        disabled={!isUserCheckedIn(b.userId)}
                                                        className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                                        title={!isUserCheckedIn(b.userId) ? 'Siswa belum check-in hari ini' : 'Verifikasi pengembalian buku'}
                                                    >
                                                        Verifikasi Kembali
                                                    </button>
                                                )}

                                                {b.totalFine > 0 && !b.isPaid && (
                                                    <button
                                                        onClick={() => openPaymentModal(b)}
                                                        className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer font-medium flex items-center gap-1"
                                                    >
                                                        <DollarSign className="w-3 h-3" />
                                                        Bayar Denda
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
                        totalItems={filteredBorrowings.length}
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
                                onChange={(e) => setReturnCondition(e.target.value as ReturnCondition)}
                                className="w-full p-2 border rounded-lg"
                            >
                                <option value="GOOD">Baik</option>
                                <option value="DAMAGED">Rusak</option>
                                <option value="LOST">Hilang</option>
                            </select>
                        </div>

                        {returnCondition !== 'GOOD' && (
                            <div className="mb-6 bg-orange-50 border border-orange-100 rounded-lg p-3">
                                <p className="text-sm font-medium text-orange-800 mb-1">Denda Kerusakan/Kehilangan</p>
                                <p className="text-lg font-bold text-orange-700">
                                    Rp {(selectedBorrowing?.bookCopy?.book?.price ?? 0).toLocaleString('id-ID')}
                                </p>
                                <p className="text-xs text-orange-600 mt-1">Otomatis sesuai harga buku.</p>
                            </div>
                        )}

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setIsReturnModalOpen(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleConfirmReturn}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
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
                                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={handleProcessPayment}
                                        disabled={(amountPaid === '' ? 0 : amountPaid) < selectedBorrowing.totalFine}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Bayar Sekarang
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Approve Borrow */}
            {isApproveModalOpen && selectedBorrowing && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                    <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            Setujui Peminjaman?
                        </h3>
                        <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Siswa:</span>
                                    <span className="font-medium">{selectedBorrowing.user?.username}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Buku:</span>
                                    <span className="font-medium">{selectedBorrowing.bookCopy?.book.title}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Copy:</span>
                                    <span className="font-medium">#{selectedBorrowing.bookCopy?.copyNumber}</span>
                                </div>
                            </div>
                        </div>
                        {/* <div className="mb-6 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
                            <p className="text-sm text-blue-700">
                                Batas pengembalian otomatis ditetapkan <span className="font-semibold">7 hari</span> dari tanggal persetujuan.
                            </p>
                        </div> */}
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setIsApproveModalOpen(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleConfirmApprove}
                                disabled={approveLoading}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer disabled:opacity-50 flex items-center gap-2"
                            >
                                <CheckCircle className="w-4 h-4" />
                                {approveLoading ? 'Memproses...' : 'Ya, Setujui'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Reject Borrow */}
            {isRejectModalOpen && selectedBorrowing && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                    <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <XCircle className="w-5 h-5 text-red-600" />
                            Tolak Peminjaman?
                        </h3>
                        <div className="mb-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Siswa:</span>
                                    <span className="font-medium">{selectedBorrowing.user?.username}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Buku:</span>
                                    <span className="font-medium">{selectedBorrowing.bookCopy?.book.title}</span>
                                </div>
                            </div>
                        </div>
                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-1">Alasan Penolakan (opsional)</label>
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none resize-none"
                                rows={3}
                                placeholder="Contoh: Stok habis, siswa masih punya pinjaman aktif..."
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setIsRejectModalOpen(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleConfirmReject}
                                disabled={rejectLoading}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer disabled:opacity-50 flex items-center gap-2"
                            >
                                <XCircle className="w-4 h-4" />
                                {rejectLoading ? 'Memproses...' : 'Ya, Tolak'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminBorrowings;
