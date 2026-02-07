import { useState, type ReactNode } from 'react';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

interface DashboardLayoutProps {
    children: ReactNode;
    activeTab: string;
    onTabChange: (tab: string) => void;
}

const DashboardLayout = ({ children, activeTab, onTabChange }: DashboardLayoutProps) => {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <Sidebar
                activeTab={activeTab}
                onTabChange={(tab) => {
                    onTabChange(tab);
                    setMobileOpen(false); // Close sidebar on mobile on selection
                }}
                collapsed={collapsed}
                setCollapsed={setCollapsed}
                mobileOpen={mobileOpen}
                setMobileOpen={setMobileOpen}
            />

            {/* Main Content */}
            <main className={`flex-1 transition-all duration-300 min-w-0 ${collapsed ? 'lg:ml-16' : 'lg:ml-64'
                } ml-0`}>
                {/* Mobile Header with Hamburger */}
                <header className="sticky top-0 z-30 flex items-center p-4 bg-white shadow-sm lg:hidden">
                    <button
                        onClick={() => setMobileOpen(true)}
                        className="p-2 mr-3 rounded-md hover:bg-gray-100"
                    >
                        <Menu size={24} />
                    </button>
                    <h2 className="text-xl font-bold text-gray-800 capitalize truncate">
                        {activeTab === 'borrowings' ? 'Peminjaman' :
                            activeTab === 'returns' ? 'Pengembalian' :
                                activeTab === 'fines' ? 'Denda' :
                                    activeTab === 'visits' ? 'Kunjungan' :
                                        activeTab}
                    </h2>
                </header>

                {/* Desktop Header (Hidden on Mobile) */}
                <header className="hidden lg:block mb-6 pt-6 px-6">
                    <div className="p-4 bg-white rounded-lg shadow-sm">
                        <h2 className="text-2xl font-bold text-gray-800 capitalize">
                            {activeTab === 'borrowings' ? 'Peminjaman' :
                                activeTab === 'returns' ? 'Pengembalian' :
                                    activeTab === 'fines' ? 'Denda' :
                                        activeTab === 'visits' ? 'Kunjungan Hari Ini' :
                                            activeTab}
                        </h2>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-4 lg:p-6">
                    <div className="bg-white rounded-lg shadow-sm p-4 lg:p-6 overflow-x-auto">
                        {children}
                    </div>
                </div>
            </main>

            {/* Overlay for mobile sidebar */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}
        </div>
    );
};

export default DashboardLayout;

