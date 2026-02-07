import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

interface SidebarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'categories', label: 'Categories', icon: '📁' },
    { id: 'books', label: 'Books', icon: '📚' },
    { id: 'borrowings', label: 'Peminjaman', icon: '📤' },
    { id: 'returns', label: 'Pengembalian', icon: '📥' },
    { id: 'fines', label: 'Denda', icon: '💰' },
    { id: 'visits', label: 'Kunjungan', icon: '🚪' },
];

const Sidebar = ({ activeTab, onTabChange }: SidebarProps) => {
    const { user, logout } = useAuth();
    const [collapsed, setCollapsed] = useState(false);

    return (
        <aside
            className={`fixed left-0 top-0 h-screen bg-gray-900 text-white transition-all duration-300 z-50 ${collapsed ? 'w-16' : 'w-64'
                }`}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
                {!collapsed && (
                    <h1 className="text-xl font-bold text-blue-400">📖 Library</h1>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-2 rounded hover:bg-gray-700"
                >
                    {collapsed ? '→' : '←'}
                </button>
            </div>

            {/* Menu Items */}
            <nav className="mt-4">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onTabChange(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${activeTab === item.id
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-300 hover:bg-gray-800'
                            }`}
                    >
                        <span className="text-xl">{item.icon}</span>
                        {!collapsed && <span>{item.label}</span>}
                    </button>
                ))}
            </nav>

            {/* User Info & Logout */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
                {!collapsed && (
                    <div className="mb-2 text-sm text-gray-400">
                        Logged in as: <span className="text-white font-medium">{user?.username}</span>
                    </div>
                )}
                <button
                    onClick={logout}
                    className={`w-full flex items-center justify-center gap-2 py-2 px-4 bg-red-600 rounded hover:bg-red-700 transition-colors ${collapsed ? 'justify-center' : ''
                        }`}
                >
                    <span>🚪</span>
                    {!collapsed && <span>Logout</span>}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
