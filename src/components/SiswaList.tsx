import { useEffect, useState, useMemo } from 'react';
import { getUsers, deleteUser } from '../services/user.service';
import type { User } from '../types/index';
import UserProfile from './UserProfile';
import Pagination from './Pagination';
import EmptyState from './EmptyState';
import { downloadExport } from '../services/export.service';

const SiswaList = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await getUsers();
            setUsers(data.filter(u => u.role === 'SISWA'));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const paginatedUsers = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return users.slice(start, start + ITEMS_PER_PAGE);
    }, [users, currentPage]);

    const totalPages = Math.ceil(users.length / ITEMS_PER_PAGE);

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this Siswa?')) {
            try {
                await deleteUser(id);
                fetchUsers();
            } catch (error) {
                alert('Failed to delete user');
            }
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
                    <button
                        onClick={() => downloadExport('users')}
                        className="text-sm px-3 py-1 text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition-colors"
                    >
                        Export CSV
                    </button>
                    <button onClick={fetchUsers} className="text-sm text-blue-500 hover:underline">Refresh</button>
                </div>
            </div>

            {users.length === 0 ? (
                <EmptyState message="Belum ada siswa terdaftar." />
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="p-3 border-b">ID</th>
                                    <th className="p-3 border-b">Username</th>
                                    <th className="p-3 border-b">QR Code</th>
                                    <th className="p-3 border-b">Joined At</th>
                                    <th className="p-3 border-b">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="p-3 border-b">{user.id}</td>
                                        <td className="p-3 border-b font-medium">{user.username}</td>
                                        <td className="p-3 border-b">
                                            {user.qrCode && (
                                                <img
                                                    src={user.qrCode}
                                                    alt="QR"
                                                    className="w-12 h-12 cursor-pointer hover:scale-110 transition-transform"
                                                    onClick={() => setSelectedUserId(user.id)}
                                                    title="Click to enlarge"
                                                />
                                            )}
                                        </td>
                                        <td className="p-3 border-b">{new Date(user.createdAt).toLocaleDateString()}</td>
                                        <td className="p-3 border-b space-x-2">
                                            <button
                                                onClick={() => setSelectedUserId(user.id)}
                                                className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
                                            >
                                                View Profile
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                className="px-3 py-1 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50"
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
