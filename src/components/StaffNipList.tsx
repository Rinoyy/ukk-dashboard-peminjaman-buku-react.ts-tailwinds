import { useEffect, useMemo, useState } from 'react';
import { staffNipService, type StaffNip } from '../services/staffNipService';
import { Search, UserPlus, Trash2, Pencil, Hash, X, Check } from 'lucide-react';
import Pagination from './Pagination';
import EmptyState from './EmptyState';

const ITEMS_PER_PAGE = 10;

const ROLE_COLOR: Record<string, string> = {
    GURU: 'bg-green-100 text-green-700',
    STAFF: 'bg-orange-100 text-orange-700',
};

const emptyForm = { nip: '', name: '', role: 'GURU' as 'GURU' | 'STAFF' };

const StaffNipList = () => {
    const [list, setList]         = useState<StaffNip[]>([]);
    const [loading, setLoading]   = useState(false);
    const [search, setSearch]     = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const [formOpen, setFormOpen]       = useState(false);
    const [editing, setEditing]         = useState<StaffNip | null>(null);
    const [form, setForm]               = useState(emptyForm);
    const [formError, setFormError]     = useState('');
    const [formLoading, setFormLoading] = useState(false);

    const load = async () => {
        setLoading(true);
        try { setList(await staffNipService.getAll()); }
        catch { /* silent */ }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return q
            ? list.filter(r => r.nip.includes(q) || r.name.toLowerCase().includes(q))
            : list;
    }, [list, search]);

    const paginated = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filtered.slice(start, start + ITEMS_PER_PAGE);
    }, [filtered, currentPage]);

    const openAdd = () => {
        setEditing(null);
        setForm(emptyForm);
        setFormError('');
        setFormOpen(true);
    };

    const openEdit = (r: StaffNip) => {
        setEditing(r);
        setForm({ nip: r.nip, name: r.name, role: r.role });
        setFormError('');
        setFormOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        setFormLoading(true);
        try {
            if (editing) {
                await staffNipService.update(editing.id, form.nip, form.name, form.role);
            } else {
                await staffNipService.create(form.nip, form.name, form.role);
            }
            setFormOpen(false);
            load();
        } catch (err) {
            setFormError(err instanceof Error ? err.message : 'Gagal menyimpan.');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (r: StaffNip) => {
        if (!confirm(`Hapus NIP "${r.nip}" (${r.name})?`)) return;
        try { await staffNipService.delete(r.id); load(); }
        catch { alert('Gagal menghapus data.'); }
    };

    if (loading) return (
        <div className="p-8 text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="mt-2 text-gray-500">Memuat data NIP...</p>
        </div>
    );

    return (
        <div>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Hash className="w-5 h-5 text-green-600" />
                    Data NIP Guru & Staff
                </h2>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari NIP atau nama..."
                            value={search}
                            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                            className="pl-9 pr-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
                        />
                    </div>
                    <button
                        onClick={openAdd}
                        className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer text-sm transition-colors"
                    >
                        <UserPlus className="w-4 h-4" />
                        Tambah NIP
                    </button>
                </div>
            </div>

            <p className="text-sm text-gray-500 mb-3">
                Total: <span className="font-medium text-gray-700">{list.length}</span> data terdaftar
            </p>

            {filtered.length === 0 ? (
                <EmptyState message={search ? 'Data tidak ditemukan.' : 'Belum ada data NIP guru/staff.'} />
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-100 text-sm text-gray-600">
                                    <th className="p-3 border-b">No</th>
                                    <th className="p-3 border-b">NIP</th>
                                    <th className="p-3 border-b">Nama</th>
                                    <th className="p-3 border-b">Role</th>
                                    <th className="p-3 border-b">Ditambahkan</th>
                                    <th className="p-3 border-b">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.map((r, i) => (
                                    <tr key={r.id} className="hover:bg-gray-50 border-b last:border-0">
                                        <td className="p-3 text-sm text-gray-400">
                                            {(currentPage - 1) * ITEMS_PER_PAGE + i + 1}
                                        </td>
                                        <td className="p-3 font-mono text-sm font-medium">{r.nip}</td>
                                        <td className="p-3">{r.name}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${ROLE_COLOR[r.role] ?? 'bg-gray-100 text-gray-700'}`}>
                                                {r.role}
                                            </span>
                                        </td>
                                        <td className="p-3 text-sm text-gray-500">
                                            {new Date(r.createdAt).toLocaleDateString('id-ID')}
                                        </td>
                                        <td className="p-3 flex items-center gap-1">
                                            <button
                                                onClick={() => openEdit(r)}
                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
                                                title="Edit"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(r)}
                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                                                title="Hapus"
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
                        totalPages={Math.ceil(filtered.length / ITEMS_PER_PAGE)}
                        onPageChange={setCurrentPage}
                        totalItems={filtered.length}
                        itemsPerPage={ITEMS_PER_PAGE}
                    />
                </>
            )}

            {formOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                    <div className="bg-white p-6 rounded-xl w-full max-w-sm shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <Hash className="w-5 h-5 text-green-600" />
                                {editing ? 'Edit Data NIP' : 'Tambah NIP Guru/Staff'}
                            </h3>
                            <button onClick={() => setFormOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            {formError && (
                                <p className="mb-3 text-sm text-red-600 bg-red-50 p-2 rounded-lg">{formError}</p>
                            )}
                            <div className="mb-3">
                                <label className="block text-sm font-medium mb-1">NIP</label>
                                <input
                                    type="text"
                                    value={form.nip}
                                    onChange={e => setForm(f => ({ ...f, nip: e.target.value }))}
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none font-mono"
                                    placeholder="Nomor Induk Pegawai"
                                    required
                                    autoFocus
                                />
                            </div>
                            <div className="mb-3">
                                <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                    placeholder="Nama lengkap guru/staff"
                                    required
                                />
                            </div>
                            <div className="mb-5">
                                <label className="block text-sm font-medium mb-1">Role</label>
                                <select
                                    value={form.role}
                                    onChange={e => setForm(f => ({ ...f, role: e.target.value as 'GURU' | 'STAFF' }))}
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                >
                                    <option value="GURU">Guru</option>
                                    <option value="STAFF">Staff</option>
                                </select>
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
                                    <Check className="w-4 h-4" />
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

export default StaffNipList;
