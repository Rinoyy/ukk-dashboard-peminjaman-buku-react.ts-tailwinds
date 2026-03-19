import { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import DashboardOverview from '../components/DashboardOverview';
import SiswaList from '../components/SiswaList';
import Categories from '../components/Categories';
import AdminBooks from '../components/AdminBooks';
import AdminBorrowings from '../components/AdminBorrowings';
import AdminFines from '../components/AdminFines';
import Visits from '../components/Visits';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <DashboardOverview />;
            case 'users':
                return <SiswaList />;
            case 'categories':
                return <Categories />;
            case 'books':
                return <AdminBooks />;
            case 'borrowings':
                return <AdminBorrowings />;
            case 'returns':
                return <AdminBorrowings />;
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
