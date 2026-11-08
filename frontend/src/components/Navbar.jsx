import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { FaUser, FaTicketAlt, FaBars, FaTimes } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="bg-blue-600 shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center">
                            <img
                                src="/logo.png"
                                alt="Maharaja Bus Booking"
                                className="h-34 w-auto object-contain"
                                style={{
                                    maxWidth: '800px',
                                    clipPath: 'inset(0 0 18% 0)' // Keeps the black road part hidden
                                }}
                            />
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-center space-x-4">
                            <Link to="/" className="text-white hover:bg-blue-500 hover:bg-opacity-75 px-3 py-2 rounded-md text-sm font-medium transition duration-200">
                                Home
                            </Link>

                            {user ? (
                                <>
                                    <Link to="/my-bookings" className="text-white hover:bg-blue-500 hover:bg-opacity-75 px-3 py-2 rounded-md text-sm font-medium flex items-center transition duration-200">
                                        <FaTicketAlt className="mr-2" /> My Bookings
                                    </Link>
                                    <div className="flex items-center ml-4 pl-4 border-l border-blue-400">
                                        <span className="text-white mr-4 text-sm font-medium flex items-center">
                                            <FaUser className="mr-2" /> {user.name}
                                        </span>
                                        <button
                                            onClick={handleLogout}
                                            className="bg-white text-blue-600 hover:bg-blue-50 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm transition duration-200"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="text-white hover:bg-blue-500 hover:bg-opacity-75 px-3 py-2 rounded-md text-sm font-medium transition duration-200">
                                        Login
                                    </Link>
                                    <Link to="/register" className="bg-white text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-md text-sm font-bold shadow-md transition duration-200 transform hover:-translate-y-0.5 ml-2">
                                        Sign Up
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="-mr-2 flex md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="bg-blue-700 inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-600 focus:ring-white"
                        >
                            <span className="sr-only">Open main menu</span>
                            {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-blue-700 pb-3 shadow-inner">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <Link to="/" onClick={() => setIsOpen(false)} className="text-white block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-600">
                            Home
                        </Link>
                        {user ? (
                            <>
                                <Link to="/my-bookings" onClick={() => setIsOpen(false)} className="text-white block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-600 flex items-center">
                                    <FaTicketAlt className="mr-2" /> My Bookings
                                </Link>
                                <div className="text-blue-100 px-3 py-2 text-sm font-medium border-t border-blue-600 mt-2 pt-2">
                                    Signed in as: <span className="text-white">{user.name}</span>
                                </div>
                                <button
                                    onClick={() => { handleLogout(); setIsOpen(false); }}
                                    className="w-full text-left text-white block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-600"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" onClick={() => setIsOpen(false)} className="text-white block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-600">
                                    Login
                                </Link>
                                <Link to="/register" onClick={() => setIsOpen(false)} className="text-white block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-600">
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
