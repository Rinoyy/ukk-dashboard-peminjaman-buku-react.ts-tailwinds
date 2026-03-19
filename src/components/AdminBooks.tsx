import React, { useEffect, useMemo, useState } from 'react';
import { useBooks } from '../hooks/useBooks';
import { useCategories } from '../hooks/useCategories';
import { useExport } from '../hooks/useExport';
import type { Book, BookCopyStatus } from '../types/index';
import Pagination from './Pagination';
import EmptyState from './EmptyState';
import {
    Plus,
    Search,
    Pencil,
    Trash2,
    X,
    AlertTriangle,
    BookOpen,
    Layers,
    Copy,
    Eye,
    Download,
    ImagePlus
} from 'lucide-react';

const API_BASE = 'http://localhost:3000';

const AdminBooks = () => {
    const { books, loading, fetchBooks, addBook, editBook, removeBook, addCopy, deleteCopy, updateCopyStatus } = useBooks();
    const { categories } = useCategories();
    const { downloadExport } = useExport();
    const [search, setSearch] = useState('');

    // Modals state
    const [isBookModalOpen, setIsBookModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isCopiesModalOpen, setIsCopiesModalOpen] = useState(false);
    const [isAddCopyModalOpen, setIsAddCopyModalOpen] = useState(false);
    const [qrPreview, setQrPreview] = useState<{ title: string, qrCode: string, subtitle: string } | null>(null);

    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const [currentBookForm, setCurrentBookForm] = useState<Partial<Book> & { categoryId?: number, initialStock?: number }>({});
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // Pagination state
    const [booksPage, setBooksPage] = useState(1);
    const [copiesPage, setCopiesPage] = useState(1);
    const BOOKS_PER_PAGE = 10;
    const COPIES_PER_PAGE = 5;

    // PERBAIKAN: Tambahkan computed value untuk copies
    const currentBookCopies = selectedBook?.copies || [];

    // Paginated data
    const paginatedBooks = useMemo(() => {
        const start = (booksPage - 1) * BOOKS_PER_PAGE;
        return books.slice(start, start + BOOKS_PER_PAGE);
    }, [books, booksPage]);

    const paginatedCopies = useMemo(() => {
        const start = (copiesPage - 1) * COPIES_PER_PAGE;
        return currentBookCopies.slice(start, start + COPIES_PER_PAGE);
    }, [currentBookCopies, copiesPage]);

    const totalBooksPages = Math.ceil(books.length / BOOKS_PER_PAGE);
    const totalCopiesPages = Math.ceil(currentBookCopies.length / COPIES_PER_PAGE);



    useEffect(() => {
        fetchBooks({ search });
    }, [search, fetchBooks]);

    // --- Image handling ---
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const clearImage = () => {
        setImageFile(null);
        setImagePreview(null);
    };

    // --- Book Management Helper Functions ---
    const handleSaveBook = async (e: React.FormEvent) => {
        e.preventDefault();
        const bookData = {
            title: currentBookForm.title ?? '',
            author: currentBookForm.author ?? '',
            categoryId: currentBookForm.categoryId,
            description: currentBookForm.description,
            stock: currentBookForm.initialStock, // Only used for creation
        };

        if (currentBookForm.id) {
            // Edit existing book
            await editBook(currentBookForm.id, bookData, imageFile || undefined);
        } else {
            // Create new book
            await addBook(bookData, imageFile || undefined);
        }
        setIsBookModalOpen(false);
        setCurrentBookForm({});
        setImageFile(null);
        setImagePreview(null);
    };

    const handleDeleteBook = async () => {
        if (selectedBook) {
            await removeBook(selectedBook.id);
            setIsDeleteModalOpen(false);
            setSelectedBook(null);
        }
    };

    const openBookModal = (book?: Book) => {
        if (book) {
            setCurrentBookForm({
                ...book,
                categoryId: book.categoryId || book.category?.id,
            });
            // Show existing image as preview
            if (book.image) {
                setImagePreview(`${API_BASE}${book.image}`);
            } else {
                setImagePreview(null);
            }
        } else {
            setCurrentBookForm({ title: '', author: '', description: '', categoryId: undefined, initialStock: 1 });
            setImagePreview(null);
        }
        setImageFile(null);
        setIsBookModalOpen(true);
    };

    const confirmDeleteBook = (book: Book) => {
        setSelectedBook(book);
        setIsDeleteModalOpen(true);
    };

    // --- Copy Management Helper Functions ---
    const openCopiesModal = (book: Book) => {
        setSelectedBook(book);
        setCopiesPage(1); // Reset to first page when opening modal
        setIsCopiesModalOpen(true);
    };

    const openAddCopyModal = () => {
        setIsAddCopyModalOpen(true);
    };

    const handleAddCopy = async () => {
        if (selectedBook) {
            await addCopy(selectedBook.id);
            fetchBooks({ search });
            setIsAddCopyModalOpen(false);
        }
    };

    const handleDeleteCopy = async (copyId: number) => {
        if (selectedBook && window.confirm('Are you sure you want to delete this copy?')) {
            await deleteCopy(copyId);
            fetchBooks({ search });
        }
    };

    // Keep selectedBook in sync with fresh data from API
    useEffect(() => {
        if (selectedBook && isCopiesModalOpen) {
            const updated = books.find(b => b.id === selectedBook.id);
            if (updated && JSON.stringify(updated.copies) !== JSON.stringify(selectedBook.copies)) {
                setSelectedBook(updated);
            }
        }
    }, [books, isCopiesModalOpen, selectedBook]);

    return (
        <div className="p-6 bg-white rounded-lg shadow">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                    Manage Books
                </h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => downloadExport('books')}
                        className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                    <button
                        onClick={() => openBookModal()}
                        className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Add Book
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search books..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Books Table */}
            {loading && books.length === 0 ? (
                <p>Loading...</p>
            ) : books.length === 0 ? (
                <EmptyState message="Belum ada buku. Klik 'Add Book' untuk menambahkan buku baru." />
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="p-3 border-b">Cover</th>
                                    <th className="p-3 border-b">Title</th>
                                    <th className="p-3 border-b">Author</th>
                                    <th className="p-3 border-b">Category</th>
                                    <th className="p-3 border-b text-center">Stock</th>
                                    <th className="p-3 border-b text-center">Copies</th>
                                    <th className="p-3 border-b text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedBooks.map((book) => (
                                    <tr key={book.id} className="hover:bg-gray-50">
                                        <td className="p-3 border-b">
                                            {book.image ? (
                                                <img
                                                    src={`${API_BASE}${book.image}`}
                                                    alt={book.title}
                                                    className="w-12 h-16 object-cover rounded shadow-sm"
                                                />
                                            ) : (
                                                <div className="w-12 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded flex items-center justify-center shadow-sm">
                                                    <BookOpen className="w-6 h-6 text-blue-400" />
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-3 border-b font-medium">{book.title}</td>
                                        <td className="p-3 border-b">{book.author}</td>
                                        <td className="p-3 border-b">
                                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                                                {book.category?.name || '-'}
                                            </span>
                                        </td>
                                        <td className="p-3 border-b text-center">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${book.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {book.stock} Avail
                                            </span>
                                        </td>
                                        <td className="p-3 border-b text-center">
                                            <button
                                                onClick={() => openCopiesModal(book)}
                                                className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full text-sm cursor-pointer transition-colors"
                                            >
                                                <Layers className="w-4 h-4" />
                                                {book.totalCopies} Units
                                            </button>
                                        </td>
                                        <td className="p-3 border-b text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openBookModal(book)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                                                    title="Edit"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => confirmDeleteBook(book)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                                                    title="Delete"
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
                        currentPage={booksPage}
                        totalPages={totalBooksPages}
                        onPageChange={setBooksPage}
                        totalItems={books.length}
                        itemsPerPage={BOOKS_PER_PAGE}
                    />
                </>
            )}

            {/* Helper Modals */}

            {/* 1. Add/Edit Book Modal */}
            {isBookModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                    <div className="w-full max-w-md p-6 bg-white rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-blue-600" />
                                {currentBookForm.id ? 'Edit Book' : 'Add Book'}
                            </h3>
                            <button onClick={() => setIsBookModalOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg cursor-pointer">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <form onSubmit={handleSaveBook}>
                            {/* Image Upload */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Cover Image</label>
                                <div className="flex items-start gap-4">
                                    {imagePreview ? (
                                        <div className="relative">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="w-24 h-32 object-cover rounded-lg shadow-sm border"
                                            />
                                            <button
                                                type="button"
                                                onClick={clearImage}
                                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 cursor-pointer transition-colors"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="w-24 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                                            <ImagePlus className="w-6 h-6 text-gray-400 mb-1" />
                                            <span className="text-xs text-gray-400">Upload</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="hidden"
                                            />
                                        </label>
                                    )}
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-500">Upload gambar cover buku (opsional).</p>
                                        <p className="text-xs text-gray-400 mt-1">Format: JPG, PNG, WebP. Max 5MB.</p>
                                        {imagePreview && (
                                            <label className="inline-flex items-center gap-1 mt-2 text-xs text-blue-600 cursor-pointer hover:underline">
                                                <ImagePlus className="w-3 h-3" />
                                                Ganti gambar
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                    className="hidden"
                                                />
                                            </label>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mb-3">
                                <label className="block text-sm font-medium mb-1">Title</label>
                                <input
                                    type="text"
                                    value={currentBookForm.title || ''}
                                    onChange={(e) => setCurrentBookForm({ ...currentBookForm, title: e.target.value })}
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="block text-sm font-medium mb-1">Author</label>
                                <input
                                    type="text"
                                    value={currentBookForm.author || ''}
                                    onChange={(e) => setCurrentBookForm({ ...currentBookForm, author: e.target.value })}
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="block text-sm font-medium mb-1">Synopsis</label>
                                <textarea
                                    value={currentBookForm.description || ''}
                                    onChange={(e) => setCurrentBookForm({ ...currentBookForm, description: e.target.value })}
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 h-24"
                                    placeholder="Enter book synopsis..."
                                />
                            </div>
                            <div className="mb-3">
                                <label className="block text-sm font-medium mb-1">Category</label>
                                <select
                                    value={currentBookForm.categoryId || ''}
                                    onChange={(e) => setCurrentBookForm({ ...currentBookForm, categoryId: e.target.value ? Number(e.target.value) : undefined })}
                                    className="w-full p-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">-- Select Category --</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            {!currentBookForm.id && (
                                <div className="mb-4 bg-blue-50 p-3 rounded-lg">
                                    <label className="block text-sm font-medium mb-1 text-blue-800">Initial Stock</label>
                                    <div className="flex items-center gap-2">
                                        <Layers className="w-4 h-4 text-blue-600" />
                                        <input
                                            type="number"
                                            value={currentBookForm.initialStock || 1}
                                            onChange={(e) => setCurrentBookForm({ ...currentBookForm, initialStock: parseInt(e.target.value) })}
                                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                            min="1"
                                            required
                                        />
                                    </div>
                                    <p className="text-xs text-blue-600 mt-1">This will generate {currentBookForm.initialStock} unique copies.</p>
                                </div>
                            )}

                            <div className="flex justify-end gap-2 mt-6">
                                <button type="button" onClick={() => setIsBookModalOpen(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 cursor-pointer">Cancel</button>
                                <button type="submit" className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 cursor-pointer">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 2. Delete Book Confirm Modal */}
            {isDeleteModalOpen && selectedBook && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                    <div className="w-full max-w-sm p-6 bg-white rounded-xl shadow-xl text-center">
                        <div className="mx-auto w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <AlertTriangle className="w-7 h-7 text-red-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Book</h3>
                        <p className="text-gray-500 mb-6">Are you sure? This will delete all {selectedBook.totalCopies} copies associated with it.</p>
                        <div className="flex gap-3 justify-center">
                            <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 cursor-pointer">Cancel</button>
                            <button onClick={handleDeleteBook} className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 cursor-pointer">Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {/* 3. Manage Copies Modal */}
            {isCopiesModalOpen && selectedBook && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                    <div className="w-full max-w-2xl p-6 bg-white rounded-xl shadow-xl max-h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <Layers className="w-5 h-5 text-blue-600" />
                                    Manage Copies: {selectedBook.title}
                                </h3>
                                <p className="text-sm text-gray-500">{selectedBook.author}</p>
                            </div>
                            <button onClick={() => setIsCopiesModalOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg cursor-pointer">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="flex justify-between items-center mb-4 bg-gray-50 p-3 rounded-lg">
                            <span className="text-sm text-gray-600">Total: <b>{selectedBook.totalCopies}</b> copies</span>
                            <button
                                onClick={openAddCopyModal}
                                className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer text-sm"
                            >
                                <Plus className="w-4 h-4" />
                                Add Copy
                            </button>
                        </div>

                        <div className="overflow-y-auto flex-1 border rounded-lg">
                            <table className="w-full text-left">
                                <thead className="bg-gray-100 sticky top-0">
                                    <tr>
                                        <th className="p-3 border-b text-center">Copy #</th>
                                        <th className="p-3 border-b text-center">QR Code</th>
                                        <th className="p-3 border-b text-center">Status</th>
                                        <th className="p-3 border-b text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedCopies.map((copy) => (
                                        <tr key={copy.id} className="hover:bg-gray-50 border-b last:border-0">
                                            <td className="p-3 text-center font-medium text-gray-700">#{copy.copyNumber}</td>
                                            <td className="p-3 text-center">
                                                <button
                                                    onClick={() => setQrPreview({
                                                        title: selectedBook.title,
                                                        subtitle: `Copy #${copy.copyNumber}`,
                                                        qrCode: copy.qrCode
                                                    })}
                                                    className="group relative inline-block"
                                                >
                                                    <img src={copy.qrCode} alt="QR" className="w-10 h-10 rounded border" />
                                                    <div className="absolute inset-0 bg-black/50 rounded opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                        <Eye className="w-4 h-4 text-white" />
                                                    </div>
                                                </button>
                                            </td>
                                            <td className="p-3 text-center">
                                                {copy.status === 'BORROWED' ? (
                                                    <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">
                                                        BORROWED
                                                    </span>
                                                ) : (
                                                    <select
                                                        value={copy.status}
                                                        onChange={(e) => updateCopyStatus(copy.id, e.target.value as BookCopyStatus)}
                                                        className={`px-2 py-1 text-xs rounded-full border cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${copy.status === 'AVAILABLE' ? 'bg-green-100 text-green-700 border-green-200' :
                                                            copy.status === 'DAMAGED' ? 'bg-red-100 text-red-700 border-red-200' :
                                                                'bg-gray-100 text-gray-700 border-gray-200'
                                                            }`}
                                                    >
                                                        <option value="AVAILABLE">AVAILABLE</option>
                                                        <option value="DAMAGED">DAMAGED</option>
                                                        <option value="LOST">LOST</option>
                                                    </select>
                                                )}
                                            </td>
                                            <td className="p-3 text-right">
                                                <button
                                                    onClick={() => handleDeleteCopy(copy.id)}
                                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                                                    title="Delete Copy"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {currentBookCopies.length === 0 && (
                                        <EmptyState message="Tidak ada copy. Klik 'Add Copy' untuk menambahkan." colSpan={4} />
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {totalCopiesPages > 1 && (
                            <Pagination
                                currentPage={copiesPage}
                                totalPages={totalCopiesPages}
                                onPageChange={setCopiesPage}
                                totalItems={currentBookCopies.length}
                                itemsPerPage={COPIES_PER_PAGE}
                            />
                        )}
                    </div>
                </div>
            )}

            {/* 4. Add Copy Confirmation Modal */}
            {isAddCopyModalOpen && selectedBook && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[60]">
                    <div className="w-full max-w-sm p-6 bg-white rounded-xl shadow-xl text-center">
                        <div className="mx-auto w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                            <Copy className="w-7 h-7 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Tambah Copy Baru?</h3>
                        <p className="text-gray-500 mb-2">
                            Anda akan menambahkan 1 copy baru untuk:
                        </p>
                        <p className="font-semibold text-gray-800 mb-4">"{selectedBook.title}"</p>
                        <p className="text-sm text-gray-400 mb-6">
                            Copy baru akan memiliki QR code unik dan status AVAILABLE.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => setIsAddCopyModalOpen(false)}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleAddCopy}
                                className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 cursor-pointer flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Ya, Tambahkan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 5. QR Preview Modal */}
            {qrPreview && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-[60]" onClick={() => setQrPreview(null)}>
                    <div className="bg-white rounded-xl p-6 shadow-2xl max-w-sm w-full mx-4 transform transition-all scale-100" onClick={e => e.stopPropagation()}>
                        <div className="text-center mb-4">
                            <h3 className="font-bold text-xl text-gray-900">{qrPreview.title}</h3>
                            <p className="text-blue-600 font-medium">{qrPreview.subtitle}</p>
                        </div>
                        <div className="bg-white p-2 border-2 border-dashed border-gray-200 rounded-xl mb-4">
                            <img src={qrPreview.qrCode} alt="Large QR" className="w-full aspect-square object-contain" />
                        </div>
                        <button onClick={() => setQrPreview(null)} className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer font-medium">
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminBooks;