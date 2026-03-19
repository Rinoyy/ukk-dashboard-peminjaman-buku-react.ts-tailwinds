import { useEffect, useMemo, useRef, useState } from 'react';
import {
    Bell, X, BookOpen, LogIn, LogOut,
    Clock, CheckCircle, XCircle, Package,
} from 'lucide-react';
import { useBorrow } from '../hooks/useBorrow';
import { useVisits } from '../hooks/useVisits';

type ActivityCategory = 'all' | 'peminjaman' | 'kunjungan';

interface ActivityEntry {
    id: string;
    category: 'peminjaman' | 'kunjungan';
    icon: React.ReactElement;
    iconBg: string;
    message: string;
    timestamp: Date;
}

const todayStr = new Date().toISOString().slice(0, 10);

const ActivityLogDropdown = () => {
    const { borrowings, fetchBorrowings } = useBorrow();
    const { visits, fetchVisits } = useVisits();
    const [open, setOpen] = useState(false);
    const [filter, setFilter] = useState<ActivityCategory>('all');
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchBorrowings();
        fetchVisits(todayStr);
    }, [fetchBorrowings, fetchVisits]);

    // Close when clicking outside
    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    const activities = useMemo((): ActivityEntry[] => {
        const entries: ActivityEntry[] = [];

        for (const b of borrowings) {
            const user = b.user?.username ?? `#${b.userId}`;
            const book = b.bookCopy?.book.title ?? `Buku #${b.bookCopyId}`;

            let icon: React.ReactElement;
            let iconBg: string;
            let message: string;
            let timestamp: Date;

            switch (b.status) {
                case 'PENDING':
                    icon = <Clock className="w-4 h-4" />;
                    iconBg = 'bg-yellow-100 text-yellow-600';
                    message = `${user} mengajukan peminjaman "${book}"`;
                    timestamp = new Date(b.createdAt);
                    break;
                case 'BORROWED':
                    if (b.isPickedUp) {
                        icon = <Package className="w-4 h-4" />;
                        iconBg = 'bg-indigo-100 text-indigo-600';
                        message = `${user} mengambil buku "${book}"`;
                    } else {
                        icon = <CheckCircle className="w-4 h-4" />;
                        iconBg = 'bg-green-100 text-green-600';
                        message = `Peminjaman "${book}" oleh ${user} disetujui`;
                    }
                    timestamp = b.borrowDate ? new Date(b.borrowDate) : new Date(b.createdAt);
                    break;
                case 'RETURN_PENDING':
                    icon = <BookOpen className="w-4 h-4" />;
                    iconBg = 'bg-orange-100 text-orange-600';
                    message = `${user} mengajukan pengembalian "${book}"`;
                    timestamp = b.borrowDate ? new Date(b.borrowDate) : new Date(b.createdAt);
                    break;
                case 'RETURNED':
                    icon = <CheckCircle className="w-4 h-4" />;
                    iconBg = 'bg-blue-100 text-blue-600';
                    message = `"${book}" dikembalikan oleh ${user}`;
                    timestamp = b.actualReturnDate ? new Date(b.actualReturnDate) : new Date(b.createdAt);
                    break;
                case 'REJECTED':
                    icon = <XCircle className="w-4 h-4" />;
                    iconBg = 'bg-red-100 text-red-600';
                    message = `Peminjaman "${book}" oleh ${user} ditolak`;
                    timestamp = new Date(b.createdAt);
                    break;
                default:
                    continue;
            }

            entries.push({ id: `borrow-${b.id}`, category: 'peminjaman', icon, iconBg, message, timestamp });
        }

        for (const v of visits) {
            entries.push({
                id: `visit-in-${v.id}`,
                category: 'kunjungan',
                icon: <LogIn className="w-4 h-4" />,
                iconBg: 'bg-green-100 text-green-600',
                message: `${v.user.username} check-in`,
                timestamp: new Date(v.visitDate),
            });
            if (v.checkoutDate) {
                entries.push({
                    id: `visit-out-${v.id}`,
                    category: 'kunjungan',
                    icon: <LogOut className="w-4 h-4" />,
                    iconBg: 'bg-gray-100 text-gray-600',
                    message: `${v.user.username} check-out`,
                    timestamp: new Date(v.checkoutDate),
                });
            }
        }

        return entries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }, [borrowings, visits]);

    const filtered = useMemo(
        () => filter === 'all' ? activities : activities.filter((a) => a.category === filter),
        [activities, filter]
    );

    const todayCount = useMemo(() => {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        return activities.filter((a) => a.timestamp >= start).length;
    }, [activities]);

    const formatTime = (d: Date) => {
        const diff = Date.now() - d.getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Baru saja';
        if (mins < 60) return `${mins} mnt lalu`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours} jam lalu`;
        return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const TABS: { key: ActivityCategory; label: string }[] = [
        { key: 'all', label: 'Semua' },
        { key: 'peminjaman', label: 'Peminjaman' },
        { key: 'kunjungan', label: 'Kunjungan' },
    ];

    return (
        <div className="relative" ref={panelRef}>
            {/* Bell Button */}
            <button
                onClick={() => setOpen((v) => !v)}
                className="relative p-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                title="Log Aktivitas"
            >
                <Bell className="w-5 h-5 text-gray-600" />
                {todayCount > 0 && (
                    <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold bg-red-500 text-white rounded-full leading-none">
                        {todayCount > 99 ? '99+' : todayCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {open && (
                <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 flex flex-col max-h-[540px]">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
                        <div className="flex items-center gap-2">
                            <Bell className="w-4 h-4 text-blue-600" />
                            <span className="font-semibold text-gray-800 text-sm">Log Aktivitas</span>
                            {todayCount > 0 && (
                                <span className="px-1.5 py-0.5 text-[10px] bg-red-100 text-red-600 rounded-full font-semibold">
                                    {todayCount} hari ini
                                </span>
                            )}
                        </div>
                        <button
                            onClick={() => setOpen(false)}
                            className="p-1 hover:bg-gray-100 rounded cursor-pointer"
                        >
                            <X className="w-4 h-4 text-gray-500" />
                        </button>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex gap-1 px-4 py-2 border-b border-gray-100 shrink-0">
                        {TABS.map(({ key, label }) => (
                            <button
                                key={key}
                                onClick={() => setFilter(key)}
                                className={`px-3 py-1 text-xs rounded-full font-medium cursor-pointer transition-colors ${
                                    filter === key
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {label}
                                {key !== 'all' && (
                                    <span className="ml-1 opacity-70">
                                        ({activities.filter((a) => a.category === key).length})
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* List */}
                    <div className="overflow-y-auto flex-1">
                        {filtered.length === 0 ? (
                            <div className="p-8 text-center text-gray-400 text-sm">
                                Tidak ada aktivitas.
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-50">
                                {filtered.slice(0, 60).map((entry) => (
                                    <li
                                        key={entry.id}
                                        className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className={`mt-0.5 p-1.5 rounded-full shrink-0 ${entry.iconBg}`}>
                                            {entry.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-gray-800 leading-snug">{entry.message}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">{formatTime(entry.timestamp)}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Footer */}
                    {filtered.length > 0 && (
                        <div className="px-4 py-2 border-t border-gray-100 text-center shrink-0">
                            <span className="text-xs text-gray-400">
                                Menampilkan {Math.min(filtered.length, 60)} dari {filtered.length} aktivitas
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ActivityLogDropdown;
