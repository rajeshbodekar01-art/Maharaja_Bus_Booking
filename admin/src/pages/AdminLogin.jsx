import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLock, FaUserShield, FaEnvelope, FaExclamationCircle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const AdminLogin = () => {
    const navigate = useNavigate();
    const { login, user } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (user) {
        navigate('/');
    }

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const result = await login(formData.email, formData.password);

        if (result.success) {
            navigate('/');
        } else {
            setError(result.message);
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-[120px]"></div>
            </div>

            <div className="max-w-md w-full relative z-10 transition-all duration-500 animate-in fade-in zoom-in-95">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white shadow-xl mb-6 group transition-transform hover:scale-110 border border-gray-100">
                        <FaUserShield className="text-blue-600 text-4xl" />
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Admin Portal</h1>
                    <p className="mt-3 text-gray-500 font-medium tracking-wide border-t border-gray-200 pt-4 max-w-[200px] mx-auto uppercase text-[10px]">
                        Enterprise Security Active
                    </p>
                </div>

                <div className="bg-white/80 backdrop-blur-xl border border-white p-10 rounded-[40px] shadow-2xl shadow-blue-100/50">
                    {error && (
                        <div className="mb-8 bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center animate-in slide-in-from-top-2">
                            <FaExclamationCircle className="text-red-500 mr-3 flex-shrink-0" />
                            <p className="text-sm text-red-700 font-bold tracking-tight">{error}</p>
                        </div>
                    )}

                    <form className="space-y-8" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] ml-1">
                                Command Identity
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-600 text-gray-400">
                                    <FaEnvelope />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    className="bg-gray-50/50 border border-gray-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 block w-full pl-12 pr-4 py-4 text-gray-900 placeholder-gray-400 rounded-2xl transition-all font-bold"
                                    placeholder="admin@busbooking.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] ml-1">
                                Access Key
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-600 text-gray-400">
                                    <FaLock />
                                </div>
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    className="bg-gray-50/50 border border-gray-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 block w-full pl-12 pr-4 py-4 text-gray-900 placeholder-gray-400 rounded-2xl transition-all font-bold"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 px-6 rounded-2xl text-white font-black text-sm uppercase tracking-widest shadow-2xl shadow-blue-500/20 transition-all transform hover:-translate-y-1 active:scale-95 ${loading
                                    ? 'bg-gray-400 cursor-not-allowed opacity-50'
                                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500'
                                }`}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Initializing...
                                </span>
                            ) : 'Establish Connection'}
                        </button>
                    </form>
                </div>

                <p className="mt-8 text-center text-gray-400 text-xs font-bold">
                    &copy; {new Date().getFullYear()} BusBooking Intelligence Group
                </p>
            </div>
        </div>
    );
};

export default AdminLogin;
