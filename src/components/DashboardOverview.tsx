import { useEffect, useState } from 'react';
import { getTodayVisitsCount } from '../services/visit.service';

const DashboardOverview = () => {
    const [visitCount, setVisitCount] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getTodayVisitsCount();
                setVisitCount(data.count);
            } catch (error) {
                console.error(error);
            }
        };
        fetchData();
    }, []);

    const stats = [
        { label: "Pengunjung Hari Ini", value: visitCount, icon: "🚪", color: "bg-blue-500" },
        { label: "Total Buku", value: "-", icon: "📚", color: "bg-green-500" },
        { label: "Peminjaman Aktif", value: "-", icon: "📤", color: "bg-yellow-500" },
        { label: "Menunggu Approval", value: "-", icon: "⏳", color: "bg-purple-500" },
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
                            <span className="text-4xl opacity-80">{stat.icon}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Welcome to Library Admin Dashboard</h3>
                <p className="text-gray-600">
                    Use the sidebar to navigate between different sections. You can manage books,
                    categories, users, and track library visits.
                </p>
            </div>
        </div>
    );
};

export default DashboardOverview;
