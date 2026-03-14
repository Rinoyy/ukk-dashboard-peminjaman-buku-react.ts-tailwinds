import { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import DashboardOverview from '../components/DashboardOverview';
import SiswaList from '../components/SiswaList';
import Categories from '../components/Categories';
import AdminBooks from '../components/AdminBooks';
import AdminBorrowings from '../components/AdminBorrowings';
import AdminFines from '../components/AdminFines';
import Visits from '../components/Visits';
import { authService } from '../services/auth.service';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [regUsername, setRegUsername] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regMessage, setRegMessage] = useState('');

    const handleRegisterSiswa = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await authService.register({ username: regUsername, password: regPassword, role: 'SISWA' });
            setRegMessage('Siswa registered successfully!');
            setRegUsername('');
            setRegPassword('');
        } catch {
            setRegMessage('Failed to register Siswa.');
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <DashboardOverview />;
            case 'users':
                return (
                    <div>
                        {/* Register Form */}
                        <div className="mb-8 p-6 bg-gray-50 rounded-lg">
                            <h3 className="text-lg font-semibold mb-4">Register New Siswa</h3>
                            {regMessage && (
                                <p className={`mb-4 ${regMessage.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                                    {regMessage}
                                </p>
                            )}
                            <form onSubmit={handleRegisterSiswa} className="flex gap-4 items-end">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium mb-1">Username</label>
                                    <input
                                        type="text"
                                        value={regUsername}
                                        onChange={(e) => setRegUsername(e.target.value)}
                                        className="w-full p-2 border rounded"
                                        required
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium mb-1">Password</label>
                                    <input
                                        type="password"
                                        value={regPassword}
                                        onChange={(e) => setRegPassword(e.target.value)}
                                        className="w-full p-2 border rounded"
                                        required
                                    />
                                </div>
                                <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                                    Register
                                </button>
                            </form>
                        </div>
                        <SiswaList />
                    </div>
                );
            case 'categories':
                return <Categories />;
            case 'books':
                return <AdminBooks />;
            case 'borrowings':
                return <AdminBorrowings />;
            case 'returns':
                return <AdminBorrowings />; // Same component, could filter by status
            case 'fines':
                return <AdminFines />;
            case 'visits':
                return <Visits />;
            default:
                return <DashboardOverview />;
        }
    };

    return (
        <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
            {renderContent()}
        </DashboardLayout>
    );
};

export default AdminDashboard;
