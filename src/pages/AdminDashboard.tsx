import { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import DashboardOverview from '../components/DashboardOverview';
import SiswaList from '../components/SiswaList';
import PetugasList from '../components/PetugasList';
import Categories from '../components/Categories';
import AdminBooks from '../components/AdminBooks';
import AdminBorrowings from '../components/AdminBorrowings';
import AdminFines from '../components/AdminFines';
import Visits from '../components/Visits';
import { useAuth } from '../hooks/useAuth';

const AdminDashboard = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'ADMIN';
    const [activeTab, setActiveTab] = useState('dashboard');

    // If PETUGAS tries to access admin-only tab via URL manipulation, redirect to borrowings
    const safeTab = !isAdmin && ['users', 'petugas', 'categories', 'books'].includes(activeTab)
        ? 'borrowings'
        : activeTab;

    const renderContent = () => {
        switch (safeTab) {
            case 'dashboard':
                return <DashboardOverview />;
            case 'users':
                return isAdmin ? <SiswaList /> : null;
            case 'petugas':
                return isAdmin ? <PetugasList /> : null;
            case 'categories':
                return isAdmin ? <Categories /> : null;
            case 'books':
                return isAdmin ? <AdminBooks /> : null;
            case 'borrowings':
                return <AdminBorrowings mode="borrowings" />;
            case 'returns':
                return <AdminBorrowings mode="returns" />;
            case 'fines':
                return <AdminFines />;
            case 'visits':
                return <Visits />;
            default:
                return <DashboardOverview />;
        }
    };

    return (
        <DashboardLayout activeTab={safeTab} onTabChange={setActiveTab}>
            {renderContent()}
        </DashboardLayout>
    );
};

export default AdminDashboard;
