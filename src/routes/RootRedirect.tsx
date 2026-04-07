import { Navigate } from 'react-router';
import { useAuth } from '../hooks/useAuth';

const RootRedirect = () => {
    const { user, loading } = useAuth();

    if (loading) return <div className="flex items-center justify-center h-screen">Memuat...</div>;
    if (!user) return <Navigate to="/login" replace />;
    if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
    return <Navigate to="/login" replace />;
};

export default RootRedirect;
