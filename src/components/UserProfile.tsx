import { useEffect, useState } from 'react';
import { userService } from '../services/user.service';
import type { User } from '../types/index';

interface UserProfileProps {
    userId?: number;
    onClose?: () => void;
}

const UserProfile = ({ userId, onClose }: UserProfileProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (userId) {
            fetchUser();
        }
    }, [userId]);

    const fetchUser = async () => {
        setLoading(true);
        try {
            const users = await userService.getUsers();
            const found = users.find(u => u.id === userId);
            if (found) setUser(found);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <p>Loading...</p>;
    if (!user) return <p>User not found</p>;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8">
                <div className="flex justify-between items-start mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">User Profile</h2>
                    {onClose && (
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
                            &times;
                        </button>
                    )}
                </div>

                <div className="text-center mb-6">
                    <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center text-4xl mb-4">
                        👤
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">{user.username}</h3>
                    <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                        }`}>
                        {user.role}
                    </span>
                </div>

                {/* Large QR Code Display */}
                {user.qrCode && (
                    <div className="bg-gray-50 rounded-xl p-6 text-center">
                        <p className="text-sm text-gray-600 mb-4">QR Code untuk Check-in</p>
                        <img
                            src={user.qrCode}
                            alt="User QR Code"
                            className="mx-auto w-64 h-64 border-4 border-white shadow-lg rounded-lg"
                        />
                        <p className="mt-4 text-xs text-gray-500">
                            Scan QR ini untuk check-in ke perpustakaan
                        </p>
                    </div>
                )}

                <div className="mt-6 text-center text-sm text-gray-500">
                    Member since: {new Date(user.createdAt).toLocaleDateString('id-ID')}
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
