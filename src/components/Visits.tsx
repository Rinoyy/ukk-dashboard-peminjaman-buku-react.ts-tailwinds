import { useEffect, useState, useMemo, useRef } from 'react';
import BarcodeScannerComponent from 'react-qr-barcode-scanner';
import { useVisits } from '../hooks/useVisits';
import { useExport } from '../hooks/useExport';
import Pagination from './Pagination';
import EmptyState from './EmptyState';
import { QrCode, LogIn, LogOut, X, CheckCircle, XCircle, Loader2, Search, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

type ScanMode = 'checkin' | 'checkout';

const Visits = () => {
    const {
        visits, loading,
        scanLoading, scanError, scanResult,
        fetchVisits, fetchTodayCount,
        doCheckIn, doCheckOut, clearScan,
    } = useVisits();
    const { downloadExport } = useExport();
    const { user } = useAuth();
    const isAdmin = user?.role === 'ADMIN';

    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 12;

    // Scanner modal state
    const [scannerOpen, setScannerOpen] = useState(false);
    const [scanMode, setScanMode] = useState<ScanMode>('checkin');
    const processingRef = useRef(false);

    useEffect(() => {
        fetchVisits(selectedDate);
        fetchTodayCount();
        setCurrentPage(1);
    }, [selectedDate, fetchVisits, fetchTodayCount]);

    // Auto-clear result after 3s so camera is ready for next scan
    useEffect(() => {
        if (scanResult || scanError) {
            const t = setTimeout(clearScan, 3000);
            return () => clearTimeout(t);
        }
    }, [scanResult, scanError, clearScan]);

    const filteredVisits = useMemo(() => {
        const q = search.toLowerCase();
        return q ? visits.filter((v) => v.user.username.toLowerCase().includes(q)) : visits;
    }, [visits, search]);

    const paginatedVisits = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredVisits.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredVisits, currentPage]);

    const totalPages = Math.ceil(filteredVisits.length / ITEMS_PER_PAGE);

    const openScanner = (mode: ScanMode) => {
        clearScan();
        processingRef.current = false;
        setScanMode(mode);
        setScannerOpen(true);
    };

    const closeScanner = () => {
        setScannerOpen(false);
        clearScan();
        processingRef.current = false;
    };

    const handleScan = async (_err: unknown, result: { getText: () => string } | null | undefined) => {
        if (!result || processingRef.current || scanLoading) return;
        const raw = result.getText();
        if (!raw) return;

        processingRef.current = true;
        try {
            const data = JSON.parse(raw) as { id?: number; role?: string; valid?: boolean };
            if (!data.id || data.role !== 'SISWA' || !data.valid) {
                clearScan();
                processingRef.current = false;
                return;
            }
            if (scanMode === 'checkin') {
                await doCheckIn(data.id, selectedDate);
            } else {
                await doCheckOut(data.id, selectedDate);
            }
        } catch {
            // non-JSON QR — ignore
        } finally {
            // allow next scan after result/error auto-clears (3s)
            setTimeout(() => { processingRef.current = false; }, 3000);
        }
    };

    const durationLabel = (checkin: string, checkout: string | null) => {
        if (!checkout) return null;
        const diff = new Date(checkout).getTime() - new Date(checkin).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins} mnt`;
        return `${Math.floor(mins / 60)}j ${mins % 60}m`;
    };

    return (
        <div>
            {/* Header */}
            <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
                <div className="flex items-center gap-4">
                    <h3 className="text-lg font-semibold">Visitor Log</h3>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {filteredVisits.length} pengunjung
                    </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari siswa..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                            className="pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <button
                        onClick={() => openScanner('checkin')}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer text-sm font-medium transition-colors"
                    >
                        <LogIn className="w-4 h-4" />
                        Scan Check-in
                    </button>
                    <button
                        onClick={() => openScanner('checkout')}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 cursor-pointer text-sm font-medium transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Scan Check-out
                    </button>
                    {isAdmin && (
                        <button
                            onClick={() => downloadExport('visits')}
                            className="px-3 py-2 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50 cursor-pointer transition-colors"
                        >
                            Export CSV
                        </button>
                    )}
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="p-2 border rounded cursor-pointer"
                    />
                </div>
            </div>

            {/* Visitor Grid */}
            {loading ? (
                <p>Loading...</p>
            ) : filteredVisits.length === 0 ? (
                <EmptyState message={search ? 'Siswa tidak ditemukan.' : 'Tidak ada pengunjung pada tanggal ini.'} />
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="p-3 border-b">#</th>
                                    <th className="p-3 border-b">Siswa</th>
                                    <th className="p-3 border-b">Check-in</th>
                                    <th className="p-3 border-b">Check-out</th>
                                    <th className="p-3 border-b">Durasi</th>
                                    <th className="p-3 border-b text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedVisits.map((visit, idx) => {
                                    const dur = durationLabel(visit.visitDate, visit.checkoutDate);
                                    const isActive = !visit.checkoutDate;
                                    return (
                                        <tr key={visit.id} className="hover:bg-gray-50 border-b last:border-0">
                                            <td className="p-3 text-gray-400">{(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}</td>
                                            <td className="p-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm"><User className="w-4 h-4 text-gray-500" /></div>
                                                    <span className="font-medium">{visit.user.username}</span>
                                                </div>
                                            </td>
                                            <td className="p-3 text-gray-700">
                                                {new Date(visit.visitDate).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td className="p-3 text-gray-700">
                                                {visit.checkoutDate
                                                    ? new Date(visit.checkoutDate).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                                                    : <span className="text-gray-400">—</span>
                                                }
                                            </td>
                                            <td className="p-3 text-gray-500">{dur ?? '—'}</td>
                                            <td className="p-3 text-center">
                                                {isActive ? (
                                                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 font-medium">Masih di dalam</span>
                                                ) : (
                                                    <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600 font-medium">Selesai</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        totalItems={filteredVisits.length}
                        itemsPerPage={ITEMS_PER_PAGE}
                    />
                </>
            )}

            {/* QR Scanner Modal */}
            {scannerOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
                        {/* Modal Header */}
                        <div className={`flex items-center justify-between px-5 py-4 ${scanMode === 'checkin' ? 'bg-green-600' : 'bg-orange-500'}`}>
                            <div className="flex items-center gap-2 text-white">
                                {scanMode === 'checkin'
                                    ? <><LogIn className="w-5 h-5" /><span className="font-bold text-lg">Scan Check-in</span></>
                                    : <><LogOut className="w-5 h-5" /><span className="font-bold text-lg">Scan Check-out</span></>
                                }
                            </div>
                            <button onClick={closeScanner} className="text-white/80 hover:text-white cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Camera View */}
                        <div className="relative bg-black">
                            <BarcodeScannerComponent
                                width="100%"
                                height={280}
                                onUpdate={handleScan}
                            />
                            {/* Viewfinder overlay */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="w-48 h-48 border-2 border-white/60 rounded-xl" />
                            </div>
                        </div>

                        {/* Result / Status Area */}
                        <div className="px-5 py-4 min-h-[80px] flex items-center justify-center">
                            {scanLoading && (
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Memproses...</span>
                                </div>
                            )}

                            {!scanLoading && scanResult && (
                                <div className={`flex items-center gap-3 w-full p-3 rounded-xl ${scanResult.type === 'checkin' ? 'bg-green-50 text-green-800' : 'bg-orange-50 text-orange-800'}`}>
                                    <CheckCircle className="w-6 h-6 shrink-0" />
                                    <div>
                                        <p className="font-bold">{scanResult.type === 'checkin' ? 'Check-in Berhasil!' : 'Check-out Berhasil!'}</p>
                                        <p className="text-sm">{scanResult.username}</p>
                                    </div>
                                </div>
                            )}

                            {!scanLoading && scanError && (
                                <div className="flex items-center gap-3 w-full p-3 rounded-xl bg-red-50 text-red-800">
                                    <XCircle className="w-6 h-6 shrink-0" />
                                    <div>
                                        <p className="font-bold">Gagal</p>
                                        <p className="text-sm">{scanError}</p>
                                    </div>
                                </div>
                            )}

                            {!scanLoading && !scanResult && !scanError && (
                                <div className="flex items-center gap-2 text-gray-400 text-sm">
                                    <QrCode className="w-5 h-5" />
                                    <span>Arahkan kamera ke QR Code siswa</span>
                                </div>
                            )}
                        </div>

                        {/* Mode Toggle */}
                        <div className="px-5 pb-4 flex gap-2">
                            <button
                                onClick={() => { clearScan(); setScanMode('checkin'); }}
                                className={`flex-1 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors ${scanMode === 'checkin' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                                Check-in
                            </button>
                            <button
                                onClick={() => { clearScan(); setScanMode('checkout'); }}
                                className={`flex-1 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors ${scanMode === 'checkout' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                                Check-out
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Visits;
