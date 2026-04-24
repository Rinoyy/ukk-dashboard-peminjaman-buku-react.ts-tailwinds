import { useEffect, useMemo, useState } from 'react';
import { userService } from '../services/userService';
import type { User } from '../types/index';
import { Search, UserPlus, Trash2, Users, Eye, EyeOff } from 'lucide-react';
import Pagination from './Pagination';
import EmptyState from './EmptyState';
import { useAuth } from '../hooks/useAuth';

const ROLE_LABEL: Record<string, string> = { GURU: 'Guru', STAFF: 'Staff' };
const ROLE_COLOR: Record<string, string> = {
    GURU: 'bg-green-100 text-green-700',
    STAFF: 'bg-orange-100 text-orange-700',
};

const AnggotaList = () => {
    const { user: currentUser } = useAuth();
    const isAdmin = currentUser?.role === 'ADMIN';

    const [members, setMembers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [filterRole, setFilterRole] = useState<'ALL' | 'GURU' | 'STAFF'>('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    // Form state
    const [formOpen, setFormOpen] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'GURU' | 'STAFF'>('GURU');
    const [showPassword, setShowPassword] = useState(false);
    const [formError, setFormError] = useState('');
    const [formLoading, setFormLoading] = useState(false);

    const loadMembers = async () => {
        setLoading(true);
        try {
            const data = await userService.getUsers();
            setMembers(data.filter((u) => u.role === 'GURU' || u.role === 'STAFF'));
        } catch {
            // silent
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadMembers(); }, []);

    const filtered = useMemo(() => {
        let list = filterRole === 'ALL' ? members : members.filter((m) => m.role === filterRole);
        const q = search.toLowerCase();
        return q ? list.filter((m) => m.username.toLowerCase().includes(q)) : list;
    }, [members, search, filterRole]);

    const paginated = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filtered.slice(start, start + ITEMS_PER_PAGE);
    }, [filtered, currentPage]);

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

    const handleDelete = async (id: number, uname: string) => {
        if (!confirm(`Hapus akun "${uname}"?`)) return;
        try {
            await userService.deleteUser(id);
            loadMembers();
        } catch {
            alert('Gagal menghapus akun.');
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        setFormLoading(true);
        try {
            await userService.createMember(username, password, role);
            setFormOpen(false);
            setUsername('');
            setPassword('');
            setRole('GURU');
            loadMembers();
        } catch (err) {
            setFormError(err instanceof Error ? err.message : 'Gagal membuat akun.');
        } finally {
            setFormLoading(false);
        }
    };

    if (loading) return (
        <div className="p-8 text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="mt-2 text-gray-500">Memuat data anggota...</p>
        </div>
    );

    return (
        <div>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-600" />
                    Manajemen Anggota (Guru & Staff)
                </h2>
                <div className="flex items-center gap-2 flex-wrap">
                    <select
                        value={filterRole}
                        onChange={(e) => { setFilterRole(e.target.value as 'ALL' | 'GURU' | 'STAFF'); setCurrentPage(1); }}
                        className="px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value="ALL">Semua</option>
                        <option value="GURU">Guru</option>
                        <option value="STAFF">Staff</option>
                    </select>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari anggota..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                            className="pl-9 pr-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <button
                        onClick={() => { setFormOpen(true); setFormError(''); setUsername(''); setPassword(''); setRole('GURU'); }}
                        className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer text-sm transition-colors"
                    >
                        <UserPlus className="w-4 h-4" />
                        Tambah Anggota
                    </button>
                </div>
            </div>

            {filtered.length === 0 ? (
                <EmptyState message={search ? 'Anggota tidak ditemukan.' : 'Belum ada anggota guru/staff.'} />
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
                                    {isAdmin && <th className="p-3 border-b">Aksi</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.map((m) => (
                                    <tr key={m.id} className="hover:bg-gray-50 border-b last:border-0">
                                        <td className="p-3 text-sm">{m.id}</td>
                                        <td className="p-3 font-medium">{m.username}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${ROLE_COLOR[m.role] ?? 'bg-gray-100 text-gray-700'}`}>
                                                {ROLE_LABEL[m.role] ?? m.role}
                                            </span>
                                        </td>
                                        <td className="p-3 text-sm text-gray-500">
                                            {new Date(m.createdAt).toLocaleDateString('id-ID')}
                                        </td>
                                        {isAdmin && (
                                            <td className="p-3">
                                                <button
                                                    onClick={() => handleDelete(m.id, m.username)}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                                                    title="Hapus akun"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        )}
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

            {formOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                    <div className="bg-white p-6 rounded-xl w-full max-w-sm shadow-xl">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <UserPlus className="w-5 h-5 text-green-600" />
                            Tambah Anggota
                        </h3>
                        <form onSubmit={handleCreate}>
                            {formError && (
                                <p className="mb-3 text-sm text-red-600 bg-red-50 p-2 rounded-lg">{formError}</p>
                            )}
                            <div className="mb-3">
                                <label className="block text-sm font-medium mb-1">Role</label>
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value as 'GURU' | 'STAFF')}
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="GURU">Guru</option>
                                    <option value="STAFF">Staff</option>
                                </select>
                            </div>
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
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer disabled:opacity-50 flex items-center gap-2"
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

export default AnggotaList;
