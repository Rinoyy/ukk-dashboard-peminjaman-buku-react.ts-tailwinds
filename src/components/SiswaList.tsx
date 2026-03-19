import { useMemo, useState } from 'react';
import { useUsers } from '../hooks/useUsers';
import { useExport } from '../hooks/useExport';
import UserProfile from './UserProfile';
import Pagination from './Pagination';
import EmptyState from './EmptyState';
import { Search } from 'lucide-react';

const SiswaList = () => {
    const { users, loading, fetchUsers, deleteUser } = useUsers();
    const { downloadExport } = useExport();
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState('');
    const ITEMS_PER_PAGE = 10;

    const filteredUsers = useMemo(() => {
        const q = search.toLowerCase();
        return q ? users.filter((u) => u.username.toLowerCase().includes(q)) : users;
    }, [users, search]);

    const paginatedUsers = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredUsers.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredUsers, currentPage]);

    const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this Siswa?')) {
            const success = await deleteUser(id);
            if (!success) alert('Failed to delete user');
        }
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div>
            {selectedUserId && (
                <UserProfile userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
            )}

            <div className="flex justify-between mb-4">
                <h2 className="text-xl font-bold">Registered Siswa</h2>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari siswa..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                            className="pl-9 pr-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <button
                        onClick={() => downloadExport('users')}
                        className="text-sm px-3 py-1 text-blue-600 border border-blue-600 rounded hover:bg-blue-50 cursor-pointer transition-colors"
                    >
                        Export CSV
                    </button>
                    <button onClick={fetchUsers} className="text-sm text-blue-500 hover:underline cursor-pointer">Refresh</button>
                </div>
            </div>

            {filteredUsers.length === 0 ? (
                <EmptyState message={search ? 'Siswa tidak ditemukan.' : 'Belum ada siswa terdaftar.'} />
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="p-3 border-b">ID</th>
                                    <th className="p-3 border-b">Username</th>
                                    <th className="p-3 border-b">Joined At</th>
                                    <th className="p-3 border-b">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="p-3 border-b">{user.id}</td>
                                        <td className="p-3 border-b font-medium">{user.username}</td>
                                        <td className="p-3 border-b">{new Date(user.createdAt).toLocaleDateString()}</td>
                                        <td className="p-3 border-b space-x-2">
                                            <button
                                                onClick={() => setSelectedUserId(user.id)}
                                                className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50 cursor-pointer"
                                            >
                                                View Profile
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                className="px-3 py-1 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50 cursor-pointer"
                                            >
                                                Delete
                                            </button>
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
                        totalItems={users.length}
                        itemsPerPage={ITEMS_PER_PAGE}
                    />
                </>
            )}
        </div>
    );
};

export default SiswaList;
