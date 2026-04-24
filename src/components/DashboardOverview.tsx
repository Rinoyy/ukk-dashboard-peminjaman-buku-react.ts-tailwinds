import { useEffect } from 'react';
import { useVisits } from '../hooks/useVisits';
import { useBooks } from '../hooks/useBooks';
import { LogIn, BookMarked, BookUp, Clock, type LucideIcon } from 'lucide-react';

const DashboardOverview = () => {
    const { todayCount, fetchTodayCount } = useVisits();
    const { books } = useBooks();

    useEffect(() => {
        fetchTodayCount();
    }, [fetchTodayCount]);

    const stats: { label: string; value: string | number; icon: LucideIcon; color: string }[] = [
        { label: "Pengunjung Hari Ini", value: todayCount,   icon: LogIn,      color: "bg-blue-500" },
        { label: "Total Buku",          value: books.length, icon: BookMarked, color: "bg-green-500" },
        { label: "Peminjaman Aktif",    value: "-",          icon: BookUp,     color: "bg-yellow-500" },
        { label: "Menunggu Approval",   value: "-",          icon: Clock,      color: "bg-purple-500" },
    ];

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, idx) => (
                    <div key={idx} className={`${stat.color} text-white rounded-xl p-6 shadow-lg`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-80">{stat.label}</p>
                                <p className="text-3xl font-bold mt-1">{stat.value}</p>
                            </div>
                            <stat.icon className="w-10 h-10 opacity-80" />
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Selamat Datang di Dashboard Admin Perpustakaan</h3>
                <p className="text-gray-600">
                    Gunakan sidebar untuk berpindah antar bagian. Anda dapat mengelola buku,
                    kategori, pengguna, dan memantau kunjungan perpustakaan.
                </p>
            </div>
        </div>
    );
};

export default DashboardOverview;
