import { useEffect, useState, useMemo } from 'react';
import { visitService, type Visit } from '../services/visit.service';
import Pagination from './Pagination';
import EmptyState from './EmptyState';
import { exportService } from '../services/export.service';

const Visits = () => {
    const [visits, setVisits] = useState<Visit[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 12;

    const fetchVisits = async () => {
        setLoading(true);
        try {
            const data = await visitService.getVisits(selectedDate);
            setVisits(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVisits();
        setCurrentPage(1); // Reset page when date changes
    }, [selectedDate]);

    const paginatedVisits = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return visits.slice(start, start + ITEMS_PER_PAGE);
    }, [visits, currentPage]);

    const totalPages = Math.ceil(visits.length / ITEMS_PER_PAGE);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <h3 className="text-lg font-semibold">Visitor Log</h3>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {visits.length} visitors
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => exportService.downloadExport('visits')}
                        className="px-3 py-2 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition-colors"
                    >
                        Export CSV
                    </button>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="p-2 border rounded"
                    />
                </div>
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : visits.length === 0 ? (
                <EmptyState message="Tidak ada pengunjung pada tanggal ini." />
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {paginatedVisits.map((visit) => (
                            <div key={visit.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-xl">
                                        👤
                                    </div>
                                    <div>
                                        <p className="font-medium">{visit.user.username}</p>
                                        <p className="text-sm text-gray-500">
                                            {new Date(visit.visitDate).toLocaleTimeString('id-ID', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        totalItems={visits.length}
                        itemsPerPage={ITEMS_PER_PAGE}
                    />
                </>
            )}
        </div>
    );
};

export default Visits;
