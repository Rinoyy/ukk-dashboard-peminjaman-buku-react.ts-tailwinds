import React, { useMemo, useState } from 'react';
import { useCategories } from '../hooks/useCategories';
import { useExport } from '../hooks/useExport';
import Pagination from './Pagination';
import EmptyState from './EmptyState';
import { Plus, Pencil, Trash2, X, FolderOpen, Download } from 'lucide-react';

const Categories = () => {
    const { categories, loading, addCategory, editCategory, removeCategory } = useCategories();
    const { downloadExport } = useExport();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const paginatedCategories = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return categories.slice(start, start + ITEMS_PER_PAGE);
    }, [categories, currentPage]);

    const totalPages = Math.ceil(categories.length / ITEMS_PER_PAGE);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        let success: boolean;
        if (editId) {
            success = await editCategory(editId, formData);
        } else {
            success = await addCategory(formData);
        }
        if (success) {
            setFormData({ name: '', description: '' });
            setIsModalOpen(false);
            setEditId(null);
        } else {
            alert('Gagal menyimpan kategori');
        }
    };

    const handleEdit = (cat: { id: number; name: string; description?: string }) => {
        setEditId(cat.id);
        setFormData({ name: cat.name, description: cat.description || '' });
        setIsModalOpen(true);
    };

    const openAddModal = () => {
        setEditId(null);
        setFormData({ name: '', description: '' });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm('Hapus kategori ini?')) {
            const success = await removeCategory(id);
            if (!success) alert('Gagal menghapus. Kategori mungkin masih memiliki buku.');
        }
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <FolderOpen className="w-6 h-6 text-blue-600" />
                    Kategori Buku
                </h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => downloadExport('categories')}
                        className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        Ekspor CSV
                    </button>
                    <button
                        onClick={openAddModal}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Tambah Kategori
                    </button>
                </div>
            </div>

            {loading ? (
                <p>Memuat...</p>
            ) : categories.length === 0 ? (
                <EmptyState message="Belum ada kategori. Klik 'Tambah Kategori' untuk menambahkan." />
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="p-3 border-b">ID</th>
                                    <th className="p-3 border-b">Nama</th>
                                    <th className="p-3 border-b">Deskripsi</th>
                                    <th className="p-3 border-b">Buku</th>
                                    <th className="p-3 border-b text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedCategories.map((cat) => (
                                    <tr key={cat.id} className="hover:bg-gray-50">
                                        <td className="p-3 border-b">{cat.id}</td>
                                        <td className="p-3 border-b font-medium">{cat.name}</td>
                                        <td className="p-3 border-b text-gray-600">{cat.description || '-'}</td>
                                        <td className="p-3 border-b">{cat._count?.books || 0}</td>
                                        <td className="p-3 border-b text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(cat)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                                                    title="Edit"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(cat.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                                                    title="Hapus"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
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
                        totalItems={categories.length}
                        itemsPerPage={ITEMS_PER_PAGE}
                    />
                </>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                    <div className="w-full max-w-md p-6 bg-white rounded-xl shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <FolderOpen className="w-5 h-5 text-blue-600" />
                                {editId ? 'Edit Kategori' : 'Tambah Kategori'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg cursor-pointer">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="block text-sm font-medium mb-1">Nama</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Deskripsi</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 h-24"
                                    placeholder="Masukkan deskripsi kategori..."
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 cursor-pointer">
                                    Batal
                                </button>
                                <button type="submit" className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 cursor-pointer">
                                    {editId ? 'Perbarui' : 'Buat'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Categories;
