import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router';
import ProtectedRoute from './ProtectedRoute';
import RootRedirect from './RootRedirect';

const Login          = lazy(() => import('../pages/Login'));
const AdminDashboard = lazy(() => import('../pages/AdminDashboard'));

const PageLoader = () => (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
);

const router = createBrowserRouter([
    {
        path: '/login',
        element: <Suspense fallback={<PageLoader />}><Login /></Suspense>,
    },

    {
        element: <ProtectedRoute allowedRoles={['ADMIN', 'PETUGAS']} />,
        children: [
            {
                path: '/admin',
                element: <Suspense fallback={<PageLoader />}><AdminDashboard /></Suspense>,
            },
        ],
    },

    { path: '/', element: <RootRedirect /> },
    { path: '*', element: <Navigate to="/" replace /> },
]);

export default router;
