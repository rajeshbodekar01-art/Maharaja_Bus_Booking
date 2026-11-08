import { useState, useEffect } from 'react';
import { FaUsers, FaUserShield, FaUserEdit, FaCheckCircle, FaTimesCircle, FaEnvelope, FaIdBadge } from 'react-icons/fa';
import api from '../utils/api';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users');
            setUsers(response.data.users);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        setUpdating(userId);
        try {
            await api.put(`/users/${userId}/role`, { role: newRole });
            fetchUsers();
        } catch (error) {
            alert('Failed to update user role');
        } finally {
            setUpdating(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-center">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Access Control</h2>
                    <p className="text-gray-500 text-sm mt-1 font-medium">Manage user permissions and security levels</p>
                </div>
                <div className="mt-4 sm:mt-0 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-xs font-black flex items-center border border-blue-100">
                    <FaUserShield className="mr-2" /> {users.length} Active Accounts
                </div>
            </div>

            <div className="bg-white shadow-xl rounded-3xl overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">User Profile</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact Info</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Permission Level</th>
                                <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-8 py-10 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
                                            <p className="text-gray-400 font-medium">Synchronizing user data...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-8 py-16 text-center text-gray-400">
                                        <FaUsers className="text-5xl mx-auto mb-4 opacity-20" />
                                        <p className="font-bold">No users detected in the system</p>
                                    </td>
                                </tr>
                            ) : (
                                users.map(user => (
                                    <tr key={user._id} className="hover:bg-blue-50/30 transition-colors group">
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black shadow-lg shadow-blue-100 group-hover:scale-110 transition-transform">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-black text-gray-900">{user.name}</div>
                                                    <div className="text-[10px] font-bold text-gray-400 uppercase flex items-center">
                                                        <FaIdBadge className="mr-1" /> ID: {user._id.slice(-6).toUpperCase()}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center text-sm font-bold text-gray-600">
                                                    <FaEnvelope className="mr-2 text-blue-400 text-xs" />
                                                    {user.email}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <select
                                                    value={user.role}
                                                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                                    disabled={updating === user._id}
                                                    className={`text-xs font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all border outline-none cursor-pointer ${user.role === 'admin'
                                                            ? 'bg-purple-50 text-purple-700 border-purple-100 hover:bg-purple-100'
                                                            : 'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100'
                                                        }`}
                                                >
                                                    <option value="user">Traveler</option>
                                                    <option value="admin">Administrator</option>
                                                </select>
                                                {updating === user._id && (
                                                    <div className="ml-3 animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap text-right">
                                            <span className="inline-flex items-center px-3 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100">
                                                <FaCheckCircle className="mr-1" /> Active
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;
