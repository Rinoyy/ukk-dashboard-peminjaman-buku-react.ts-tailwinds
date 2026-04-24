import {
    LayoutDashboard, Users, ShieldCheck, FolderOpen, BookMarked,
    BookUp, BookDown, Banknote, LogIn, LogOut, GraduationCap,
    ChevronLeft, ChevronRight, X, type LucideIcon
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface SidebarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    collapsed: boolean;
    setCollapsed: (v: boolean) => void;
    mobileOpen: boolean;
    setMobileOpen: (v: boolean) => void;
}

const adminMenuGroups: { label: string; items: { id: string; label: string; icon: LucideIcon }[] }[] = [
    {
        label: 'UTAMA',
        items: [
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        ],
    },
    {
        label: 'MANAJEMEN PENGGUNA',
        items: [
            { id: 'users', label: 'Siswa', icon: Users },
            { id: 'petugas', label: 'Petugas', icon: ShieldCheck },
            { id: 'anggota', label: 'Guru & Staff', icon: GraduationCap },
        ],
    },
    {
        label: 'MANAJEMEN PERPUSTAKAAN',
        items: [
            { id: 'categories', label: 'Kategori', icon: FolderOpen },
            { id: 'books', label: 'Buku', icon: BookMarked },
        ],
    },
    {
        label: 'TRANSAKSI',
        items: [
            { id: 'borrowings', label: 'Peminjaman', icon: BookUp },
            { id: 'returns', label: 'Pengembalian', icon: BookDown },
            { id: 'fines', label: 'Denda', icon: Banknote },
        ],
    },
    {
        label: 'LAPORAN',
        items: [
            { id: 'visits', label: 'Kunjungan', icon: LogIn },
        ],
    },
];

const petugasMenuGroups: { label: string; items: { id: string; label: string; icon: LucideIcon }[] }[] = [
    {
        label: 'UTAMA',
        items: [
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        ],
    },
    {
        label: 'MANAJEMEN PENGGUNA',
        items: [
            { id: 'anggota', label: 'Guru & Staff', icon: GraduationCap },
        ],
    },
    {
        label: 'TRANSAKSI',
        items: [
            { id: 'borrowings', label: 'Peminjaman', icon: BookUp },
            { id: 'returns', label: 'Pengembalian', icon: BookDown },
            { id: 'fines', label: 'Denda', icon: Banknote },
        ],
    },
    {
        label: 'LAPORAN',
        items: [
            { id: 'visits', label: 'Kunjungan', icon: LogIn },
        ],
    },
];

const Sidebar = ({ activeTab, onTabChange, collapsed, setCollapsed, mobileOpen, setMobileOpen }: SidebarProps) => {
    const { user, logout } = useAuth();
    const menuGroups = user?.role === 'PETUGAS' ? petugasMenuGroups : adminMenuGroups;

    return (
        <aside
            className={`fixed left-0 top-0 h-screen bg-gray-900 text-white transition-all duration-300 z-50 flex flex-col
                ${collapsed ? 'w-16' : 'w-64'}
                ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
            `}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
                {!collapsed && (
                    <h1 className="text-xl font-bold text-blue-400 flex items-center gap-2">
                        <img src="/logo.svg" className="w-6 h-6" alt="logo" /> Library
                    </h1>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-2 rounded hover:bg-gray-700 hidden lg:block cursor-pointer"
                >
                    {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>
                <button
                    onClick={() => setMobileOpen(false)}
                    className="p-2 rounded hover:bg-gray-700 lg:hidden cursor-pointer"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Role badge */}
            {!collapsed && user && (
                <div className="px-4 pt-3 pb-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        user.role === 'ADMIN'
                            ? 'bg-purple-700 text-purple-100'
                            : 'bg-blue-700 text-blue-100'
                    }`}>
                        {user.role}
                    </span>
                </div>
            )}

            {/* Menu Items - Grouped */}
            <nav className="mt-2 flex-1 overflow-y-auto">
                {menuGroups.map((group, groupIndex) => (
                    <div key={group.label} className={groupIndex > 0 ? 'mt-2' : ''}>
                        {!collapsed && (
                            <div className="px-4 py-2">
                                <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">
                                    {group.label}
                                </span>
                            </div>
                        )}
                        {collapsed && groupIndex > 0 && (
                            <div className="mx-3 my-2 border-t border-gray-700" />
                        )}
                        {group.items.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => onTabChange(item.id)}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left cursor-pointer transition-colors ${
                                    activeTab === item.id
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-300 hover:bg-gray-800'
                                }`}
                            >
                                <item.icon className="w-5 h-5 shrink-0" />
                                {!collapsed && <span className="text-sm">{item.label}</span>}
                            </button>
                        ))}
                    </div>
                ))}
            </nav>

            {/* User Info & Logout */}
            <div className="p-4 border-t border-gray-700">
                {!collapsed && (
                    <div className="mb-2 text-sm text-gray-400">
                        Masuk sebagai: <span className="text-white font-medium">{user?.username}</span>
                    </div>
                )}
                <button
                    onClick={logout}
                    className={`w-full flex items-center justify-center gap-2 py-2 px-4 bg-red-600 rounded hover:bg-red-700 cursor-pointer transition-colors ${
                        collapsed ? 'justify-center' : ''
                    }`}
                >
                    <LogOut className="w-4 h-4" />
                    {!collapsed && <span>Keluar</span>}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
