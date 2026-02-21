import { useEffect, useState, useMemo } from 'react';
import { getCategories, createCategory, updateCategory, deleteCategory, type Category } from '../services/category.service';
import Pagination from './Pagination';
import EmptyState from './EmptyState';
import { downloadExport } from '../services/export.service';

const Categories = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const data = await getCategories();
            setCategories(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const paginatedCategories = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return categories.slice(start, start + ITEMS_PER_PAGE);
    }, [categories, currentPage]);

    const totalPages = Math.ceil(categories.length / ITEMS_PER_PAGE);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editId) {
                await updateCategory(editId, formData);
            } else {
                await createCategory(formData);
            }
            setFormData({ name: '', description: '' });
            setShowForm(false);
            setEditId(null);
            fetchCategories();
        } catch (error) {
            alert('Failed to save category');
        }
    };

    const handleEdit = (cat: Category) => {
        setEditId(cat.id);
        setFormData({ name: cat.name, description: cat.description || '' });
        setShowForm(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm('Delete this category?')) {
            try {
                await deleteCategory(id);
                fetchCategories();
            } catch (error) {
                alert('Failed to delete. Category might have books.');
            }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Book Categories</h3>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => downloadExport('categories')}
                        className="px-4 py-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition-colors"
                    >
                        Export CSV
                    </button>
                    <button
                        onClick={() => { setShowForm(true); setEditId(null); setFormData({ name: '', description: '' }); }}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        + Add Category
                    </button>
                </div>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <input
                                type="text"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                            {editId ? 'Update' : 'Create'}
                        </button>
                        <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500">
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {loading ? (
                <p>Loading...</p>
            ) : categories.length === 0 ? (
                <EmptyState message="Belum ada kategori. Klik '+ Add Category' untuk menambahkan." />
            ) : (
                <>
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="p-3 border-b">ID</th>
                                <th className="p-3 border-b">Name</th>
                                <th className="p-3 border-b">Description</th>
                                <th className="p-3 border-b">Books</th>
                                <th className="p-3 border-b">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedCategories.map((cat) => (
                                <tr key={cat.id} className="hover:bg-gray-50">
                                    <td className="p-3 border-b">{cat.id}</td>
                                    <td className="p-3 border-b font-medium">{cat.name}</td>
                                    <td className="p-3 border-b text-gray-600">{cat.description || '-'}</td>
                                    <td className="p-3 border-b">{cat._count?.books || 0}</td>
                                    <td className="p-3 border-b">
                                        <button onClick={() => handleEdit(cat)} className="px-2 py-1 text-sm text-blue-600 hover:underline mr-2">
                                            Edit
                                        </button>
                                        <button onClick={() => handleDelete(cat.id)} className="px-2 py-1 text-sm text-red-600 hover:underline">
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        totalItems={categories.length}
                        itemsPerPage={ITEMS_PER_PAGE}
                    />
                </>
            )}
        </div>
    );
};

export default Categories;
