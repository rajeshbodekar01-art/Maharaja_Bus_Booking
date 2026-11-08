import { Link, useLocation } from 'react-router-dom';
import { FaTachometerAlt, FaBus, FaRoute, FaTicketAlt, FaUsers, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ onLinkClick }) => {
    const location = useLocation();
    const { logout } = useAuth();

    const isActive = (path) => location.pathname === path;

    const linkClasses = (path) => `flex items-center px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors duration-200 ${isActive(path) ? 'bg-gray-800 text-white border-r-4 border-blue-500' : ''}`;

    return (
        <div className="flex flex-col h-full bg-gray-900 text-white">
            <div className="flex items-center justify-center h-16 bg-gray-900 border-b border-gray-800 shadow-md">
                <span className="text-xl font-bold text-white tracking-wider flex items-center">
                    <FaBus className="mr-2 text-blue-500" /> Panel
                </span>
            </div>

            <nav className="flex-1 overflow-y-auto py-4 space-y-1">
                <Link to="/" className={linkClasses('/')} onClick={onLinkClick}>
                    <FaTachometerAlt className="mr-3 text-lg" />
                    <span className="font-medium">Dashboard</span>
                </Link>
                <Link to="/buses" className={linkClasses('/buses')} onClick={onLinkClick}>
                    <FaBus className="mr-3 text-lg" />
                    <span className="font-medium">Buses</span>
                </Link>
                <Link to="/routes" className={linkClasses('/routes')} onClick={onLinkClick}>
                    <FaRoute className="mr-3 text-lg" />
                    <span className="font-medium">Routes</span>
                </Link>
                <Link to="/bookings" className={linkClasses('/bookings')} onClick={onLinkClick}>
                    <FaTicketAlt className="mr-3 text-lg" />
                    <span className="font-medium">Bookings</span>
                </Link>
                <Link to="/users" className={linkClasses('/users')} onClick={onLinkClick}>
                    <FaUsers className="mr-3 text-lg" />
                    <span className="font-medium">Users</span>
                </Link>
            </nav>

            <div className="p-4 border-t border-gray-800">
                <button
                    onClick={logout}
                    className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 rounded-lg hover:from-red-700 hover:to-red-800 focus:outline-none shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                    <FaSignOutAlt className="mr-2" /> Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
