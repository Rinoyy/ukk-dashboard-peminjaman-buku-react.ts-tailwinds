import { useEffect, useMemo, useState } from 'react';
import { studentNisnService, type StudentNisn } from '../services/studentNisnService';
import { Search, UserPlus, Trash2, Pencil, Hash, X, Check } from 'lucide-react';
import Pagination from './Pagination';
import EmptyState from './EmptyState';

const ITEMS_PER_PAGE = 10;

const emptyForm = { nisn: '', name: '' };

const StudentNisnList = () => {
    const [list, setList]         = useState<StudentNisn[]>([]);
    const [loading, setLoading]   = useState(false);
    const [search, setSearch]     = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    // Form (add / edit)
    const [formOpen, setFormOpen]     = useState(false);
    const [editing, setEditing]       = useState<StudentNisn | null>(null);
    const [form, setForm]             = useState(emptyForm);
    const [formError, setFormError]   = useState('');
    const [formLoading, setFormLoading] = useState(false);

    const load = async () => {
        setLoading(true);
        try { setList(await studentNisnService.getAll()); }
        catch { /* silent */ }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return q
            ? list.filter(r => r.nisn.includes(q) || r.name.toLowerCase().includes(q))
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

    const openEdit = (r: StudentNisn) => {
        setEditing(r);
        setForm({ nisn: r.nisn, name: r.name });
        setFormError('');
        setFormOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        setFormLoading(true);
        try {
            if (editing) {
                await studentNisnService.update(editing.id, form.nisn, form.name);
            } else {
                await studentNisnService.create(form.nisn, form.name);
            }
            setFormOpen(false);
            load();
        } catch (err) {
            setFormError(err instanceof Error ? err.message : 'Gagal menyimpan.');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (r: StudentNisn) => {
        if (!confirm(`Hapus NISN "${r.nisn}" (${r.name})?`)) return;
        try { await studentNisnService.delete(r.id); load(); }
        catch { alert('Gagal menghapus data.'); }
    };

    if (loading) return (
        <div className="p-8 text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="mt-2 text-gray-500">Memuat data NISN...</p>
        </div>
    );

    return (
        <div>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Hash className="w-5 h-5 text-indigo-600" />
                    Data NISN Siswa
                </h2>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari NISN atau nama..."
                            value={search}
                            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                            className="pl-9 pr-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                    <button
                        onClick={openAdd}
                        className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer text-sm transition-colors"
                    >
                        <UserPlus className="w-4 h-4" />
                        Tambah NISN
                    </button>
                </div>
            </div>

            <p className="text-sm text-gray-500 mb-3">
                Total: <span className="font-medium text-gray-700">{list.length}</span> data terdaftar
            </p>

            {filtered.length === 0 ? (
                <EmptyState message={search ? 'Data tidak ditemukan.' : 'Belum ada data NISN.'} />
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-100 text-sm text-gray-600">
                                    <th className="p-3 border-b">No</th>
                                    <th className="p-3 border-b">NISN</th>
                                    <th className="p-3 border-b">Nama Siswa</th>
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
                                        <td className="p-3 font-mono text-sm font-medium">{r.nisn}</td>
                                        <td className="p-3">{r.name}</td>
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

            {/* Add / Edit Modal */}
            {formOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                    <div className="bg-white p-6 rounded-xl w-full max-w-sm shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <Hash className="w-5 h-5 text-indigo-600" />
                                {editing ? 'Edit Data NISN' : 'Tambah NISN Siswa'}
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
                                <label className="block text-sm font-medium mb-1">NISN</label>
                                <input
                                    type="text"
                                    value={form.nisn}
                                    onChange={e => setForm(f => ({ ...f, nisn: e.target.value }))}
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                                    placeholder="10 digit NISN"
                                    required
                                    autoFocus
                                />
                            </div>
                            <div className="mb-5">
                                <label className="block text-sm font-medium mb-1">Nama Siswa</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="Nama lengkap siswa"
                                    required
                                />
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
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer disabled:opacity-50 flex items-center gap-2"
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

export default StudentNisnList;
