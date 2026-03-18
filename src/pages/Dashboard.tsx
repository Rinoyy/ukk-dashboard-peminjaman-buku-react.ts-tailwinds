import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

export default function Dashboard() {
    const [user, setUser] = useState<any>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (!user) return <div className="p-8">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow p-4 flex justify-between items-center">
                <h1 className="text-xl font-bold text-gray-800">Dashboard {user.role}</h1>
                <div className="flex gap-4">
                    {user.role === 'ADMIN' && (
                        <button
                            onClick={() => navigate('/add-petugas')}
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
                        >
                            Add Petugas
                        </button>
                    )}
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                    >
                        Logout
                    </button>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto p-8">
                <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-800">Welcome, {user.username}!</h2>
                    <div className="mb-6">
                        <p className="text-gray-600 mb-2 text-center">Your Personal QR Code</p>
                        {user.qrCode ? (
                            <img src={user.qrCode} alt="User QR Code" className="w-64 h-64 border-2 border-gray-200 rounded p-2" />
                        ) : (
                            <div className="w-64 h-64 bg-gray-200 flex items-center justify-center rounded">
                                <span className="text-gray-500">No QR Code generated</span>
                            </div>
                        )}
                    </div>
                    <div className="w-full border-t pt-4">
                        <h3 className="text-lg font-medium text-gray-700 mb-2">User Details</h3>
                        <ul className="text-gray-600">
                            <li><strong>ID:</strong> {user.id}</li>
                            <li><strong>Role:</strong> {user.role}</li>
                            <li><strong>Created At:</strong> {new Date(user.createdAt).toLocaleDateString()}</li>
                        </ul>
                    </div>
                </div>
            </main>
        </div>
    );
}
