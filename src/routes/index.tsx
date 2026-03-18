import { createBrowserRouter, Navigate } from 'react-router';
import Login from '../pages/Login';
import AdminDashboard from '../pages/AdminDashboard';
import ProtectedRoute from './ProtectedRoute';
import RootRedirect from './RootRedirect';

const router = createBrowserRouter([
    { path: '/login', element: <Login /> },

    {
        element: <ProtectedRoute allowedRoles={['ADMIN']} />,
        children: [
            { path: '/admin', element: <AdminDashboard /> },
        ],
    },

    { path: '/', element: <RootRedirect /> },
    { path: '*', element: <Navigate to="/" replace /> },
]);

export default router;
