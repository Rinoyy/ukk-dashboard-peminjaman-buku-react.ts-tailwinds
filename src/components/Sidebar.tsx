import { useAuth } from '../hooks/useAuth';

interface SidebarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    collapsed: boolean;
    setCollapsed: (v: boolean) => void;
    mobileOpen: boolean;
    setMobileOpen: (v: boolean) => void;
}

const menuGroups = [
    {
        label: 'MAIN',
        items: [
            { id: 'dashboard', label: 'Dashboard', icon: '📊' },
        ],
    },
    {
        label: 'USER MANAGEMENT',
        items: [
            { id: 'users', label: 'Users', icon: '👥' },
        ],
    },
    {
        label: 'LIBRARY MANAGEMENT',
        items: [
            { id: 'categories', label: 'Categories', icon: '📁' },
            { id: 'books', label: 'Books', icon: '📚' },
        ],
    },
    {
        label: 'TRANSACTIONS',
        items: [
            { id: 'borrowings', label: 'Peminjaman', icon: '📤' },
            { id: 'returns', label: 'Pengembalian', icon: '📥' },
            { id: 'fines', label: 'Denda', icon: '💰' },
        ],
    },
    {
        label: 'REPORTS',
        items: [
            { id: 'visits', label: 'Kunjungan', icon: '🚪' },
        ],
    },
];

const Sidebar = ({ activeTab, onTabChange, collapsed, setCollapsed, mobileOpen, setMobileOpen }: SidebarProps) => {
    const { user, logout } = useAuth();

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
                        <h1 className="text-xl font-bold text-blue-400">📖 Library</h1>
                    )}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="p-2 rounded hover:bg-gray-700 hidden lg:block"
                    >
                        {collapsed ? '→' : '←'}
                    </button>
                    <button
                        onClick={() => setMobileOpen(false)}
                        className="p-2 rounded hover:bg-gray-700 lg:hidden"
                    >
                        ✕
                    </button>
                </div>

                {/* Menu Items - Grouped */}
                <nav className="mt-2 flex-1 overflow-y-auto">
                    {menuGroups.map((group, groupIndex) => (
                        <div key={group.label} className={groupIndex > 0 ? 'mt-2' : ''}>
                            {/* Group Label */}
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

                            {/* Group Items */}
                            {group.items.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => onTabChange(item.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${activeTab === item.id
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-300 hover:bg-gray-800'
                                        }`}
                                >
                                    <span className="text-lg">{item.icon}</span>
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
