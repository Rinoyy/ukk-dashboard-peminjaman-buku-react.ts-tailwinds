import { useEffect, useMemo, useState } from 'react';
import { userService } from '../services/userService';
import type { User } from '../types/index';
import { Search, UserPlus, Trash2, Shield, Eye, EyeOff } from 'lucide-react';
import Pagination from './Pagination';
import EmptyState from './EmptyState';

const PetugasList = () => {
    const [staff, setStaff] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    // Form state
    const [formOpen, setFormOpen] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [formError, setFormError] = useState('');
    const [formLoading, setFormLoading] = useState(false);

    const loadStaff = async () => {
        setLoading(true);
        try {
            const data = await userService.getUsers();
            setStaff(data.filter((u) => u.role === 'PETUGAS'));
        } catch {
            // silent
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadStaff(); }, []);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return q ? staff.filter((s) => s.username.toLowerCase().includes(q)) : staff;
    }, [staff, search]);

    const paginated = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filtered.slice(start, start + ITEMS_PER_PAGE);
    }, [filtered, currentPage]);

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

    const handleDelete = async (id: number, uname: string) => {
        if (!confirm(`Hapus akun petugas "${uname}"?`)) return;
        try {
            await userService.deleteUser(id);
            loadStaff();
        } catch {
            alert('Gagal menghapus akun petugas.');
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        setFormLoading(true);
        try {
            await userService.createStaff(username, password);
            setFormOpen(false);
            setUsername('');
            setPassword('');
            loadStaff();
        } catch (err) {
            setFormError(err instanceof Error ? err.message : 'Gagal membuat akun.');
        } finally {
            setFormLoading(false);
        }
    };

    if (loading) return (
        <div className="p-8 text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="mt-2 text-gray-500">Memuat data petugas...</p>
        </div>
    );

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-600" />
                    Manajemen Petugas
                </h2>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari petugas..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                            className="pl-9 pr-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <button
                        onClick={() => { setFormOpen(true); setFormError(''); setUsername(''); setPassword(''); }}
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer text-sm transition-colors"
                    >
                        <UserPlus className="w-4 h-4" />
                        Tambah Petugas
                    </button>
                </div>
            </div>

            {filtered.length === 0 ? (
                <EmptyState message={search ? 'Petugas tidak ditemukan.' : 'Belum ada akun petugas.'} />
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-100 text-sm text-gray-600">
                                    <th className="p-3 border-b">ID</th>
                                    <th className="p-3 border-b">Username</th>
                                    <th className="p-3 border-b">Role</th>
                                    <th className="p-3 border-b">Dibuat</th>
                                    <th className="p-3 border-b">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.map((s) => (
                                    <tr key={s.id} className="hover:bg-gray-50 border-b last:border-0">
                                        <td className="p-3 text-sm">{s.id}</td>
                                        <td className="p-3 font-medium">{s.username}</td>
                                        <td className="p-3">
                                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full font-medium">
                                                PETUGAS
                                            </span>
                                        </td>
                                        <td className="p-3 text-sm text-gray-500">
                                            {new Date(s.createdAt).toLocaleDateString('id-ID')}
                                        </td>
                                        <td className="p-3">
                                            <button
                                                onClick={() => handleDelete(s.id, s.username)}
                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                                                title="Hapus akun"
                                            >
                                                <Trash2 className="w-4 h-4" />
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
                        totalItems={filtered.length}
                        itemsPerPage={ITEMS_PER_PAGE}
                    />
                </>
            )}

            {/* Create Modal */}
            {formOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                    <div className="bg-white p-6 rounded-xl w-full max-w-sm shadow-xl">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <UserPlus className="w-5 h-5 text-blue-600" />
                            Tambah Akun Petugas
                        </h3>
                        <form onSubmit={handleCreate}>
                            {formError && (
                                <p className="mb-3 text-sm text-red-600 bg-red-50 p-2 rounded-lg">{formError}</p>
                            )}
                            <div className="mb-3">
                                <label className="block text-sm font-medium mb-1">Username</label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                    autoFocus
                                />
                            </div>
                            <div className="mb-5">
                                <label className="block text-sm font-medium mb-1">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full p-2 pr-9 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((v) => !v)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setFormOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={formLoading}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer disabled:opacity-50 flex items-center gap-2"
                                >
                                    <UserPlus className="w-4 h-4" />
                                    {formLoading ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PetugasList;
