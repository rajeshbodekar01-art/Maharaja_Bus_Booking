import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaSearch, FaBus, FaMapMarkerAlt, FaCalendar, FaShieldAlt, FaClock,
    FaRupeeSign, FaChair, FaArrowRight, FaSnowflake, FaBed, FaTimes,
    FaRoute, FaCalendarAlt
} from 'react-icons/fa';
import api from '../utils/api';

const API_BASE = 'http://localhost:5000';

// ── Bus Routes Modal ─────────────────────────────────────────────────────────
const BusRoutesModal = ({ bus, onClose, onSelectRoute }) => {
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!bus) return;
        const fetchRoutes = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/routes/bus/${bus._id}`);
                setRoutes(res.data.routes || []);
            } catch (err) {
                console.error('Failed to fetch bus routes:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchRoutes();
    }, [bus]);

    if (!bus) return null;

    const formatTime = (time) =>
        new Date(`2000-01-01 ${time}`).toLocaleTimeString('en-US', {
            hour: 'numeric', minute: '2-digit', hour12: true
        });

    const formatDate = (dateStr) =>
        new Date(dateStr).toLocaleDateString('en-IN', {
            weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
        });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
                {/* Header */}
                <div className="relative">
                    {/* Bus image or gradient header */}
                    <div className="h-36 bg-gradient-to-r from-blue-600 to-indigo-600 overflow-hidden">
                        {bus.image ? (
                            <img
                                src={`${API_BASE}${bus.image}`}
                                alt={bus.busName}
                                className="w-full h-full object-cover opacity-60"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <FaBus className="text-7xl text-white/30" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>

                    {/* Bus info overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                        <div className="flex items-end justify-between">
                            <div>
                                <h2 className="text-2xl font-black">{bus.busName}</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs font-mono font-bold text-blue-200">{bus.busNumber}</span>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${bus.busType === 'AC' ? 'bg-blue-500' : 'bg-orange-500'}`}>
                                        {bus.busType === 'AC' ? <><FaSnowflake className="inline mr-1" />AC</> : 'Non-AC'}
                                    </span>
                                    <span className="px-2 py-0.5 bg-white/20 rounded-full text-[10px] font-black uppercase">{bus.category}</span>
                                </div>
                            </div>
                            <div className="text-right text-sm text-white/80">
                                <FaChair className="inline mr-1" />{bus.totalSeats} Seats
                            </div>
                        </div>
                    </div>

                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 p-2 bg-black/30 hover:bg-black/50 text-white rounded-full transition-all"
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* Routes list */}
                <div className="flex-1 overflow-y-auto p-5">
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <FaRoute /> Available Routes
                    </h3>

                    {loading ? (
                        <div className="flex justify-center py-10">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-blue-600" />
                        </div>
                    ) : routes.length === 0 ? (
                        <div className="text-center py-10">
                            <FaRoute className="text-4xl text-gray-200 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium">No upcoming routes for this bus.</p>
                            <p className="text-gray-400 text-sm mt-1">Check back later for scheduled trips.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {routes.map(route => (
                                <div
                                    key={route._id}
                                    onClick={() => onSelectRoute(route._id)}
                                    className="group bg-gray-50 hover:bg-blue-50 border border-gray-100 hover:border-blue-200 rounded-xl p-4 cursor-pointer transition-all"
                                >
                                    <div className="flex items-center justify-between">
                                        {/* Route path */}
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                                                <div className="w-0.5 h-6 bg-gray-300" />
                                                <div className="w-2 h-2 rounded-full bg-red-500" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-gray-900 truncate">{route.source}</p>
                                                <p className="text-xs text-gray-400 my-0.5">
                                                    {formatTime(route.departureTime)} → {formatTime(route.arrivalTime)}
                                                </p>
                                                <p className="font-bold text-gray-900 truncate">{route.destination}</p>
                                            </div>
                                        </div>

                                        {/* Date & Price */}
                                        <div className="text-right ml-4 flex-shrink-0">
                                            <div className="flex items-center justify-end text-blue-600 font-black text-lg">
                                                <FaRupeeSign className="text-sm" />{route.price}
                                            </div>
                                            <p className="text-[10px] text-gray-400 font-medium mt-0.5 flex items-center justify-end gap-1">
                                                <FaCalendarAlt className="text-[9px]" />
                                                {formatDate(route.departureDate)}
                                            </p>
                                            <span className="inline-block mt-1 text-[10px] font-black text-blue-600 group-hover:text-white bg-blue-50 group-hover:bg-blue-600 px-2 py-0.5 rounded-full transition-all">
                                                Book Now →
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ── Main Home Component ───────────────────────────────────────────────────────
const Home = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ source: '', destination: '', date: '' });
    const [availableBuses, setAvailableBuses] = useState([]);
    const [loadingBuses, setLoadingBuses] = useState(true);
    const [selectedBus, setSelectedBus] = useState(null);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.source && formData.destination && formData.date) {
            navigate(`/search?source=${formData.source}&destination=${formData.destination}&date=${formData.date}`);
        }
    };

    useEffect(() => {
        const fetchAvailableBuses = async () => {
            try {
                setLoadingBuses(true);
                // Only fetch buses that have at least one upcoming active route
                const res = await api.get('/routes/available-buses');
                setAvailableBuses(res.data.buses || []);
            } catch (err) {
                console.error('Failed to fetch available buses:', err);
            } finally {
                setLoadingBuses(false);
            }
        };
        fetchAvailableBuses();
    }, []);

    const today = new Date().toISOString().split('T')[0];

    const handleSelectRoute = (routeId) => {
        setSelectedBus(null);
        navigate(`/seat-selection/${routeId}`);
    };

    const formatDate = (dateStr) =>
        new Date(dateStr).toLocaleDateString('en-IN', {
            weekday: 'short', day: 'numeric', month: 'short'
        });

    const formatTime = (time) =>
        new Date(`2000-01-01 ${time}`).toLocaleTimeString('en-US', {
            hour: 'numeric', minute: '2-digit', hour12: true
        });

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-700 to-blue-500 text-white py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path d="M0 0 L100 100 M100 0 L0 100" stroke="white" strokeWidth="0.5" />
                    </svg>
                </div>
                <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center">
                    <div className="md:w-1/2 mb-10 md:mb-0 text-center md:text-left">
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
                            Travel with Comfort <br />
                            <span className="text-yellow-300">Book Your Bus Today</span>
                        </h1>
                        <p className="text-xl text-blue-100 mb-8 max-w-lg mx-auto md:mx-0">
                            Experience the safest and most comfortable bus journeys across the country.
                        </p>
                    </div>
                    <div className="md:w-1/2 flex justify-center">
                        <FaBus className="text-9xl text-white opacity-20 transform -rotate-12" />
                    </div>
                </div>
            </div>

            {/* Search Card */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-20">
                <div className="bg-white rounded-xl shadow-2xl p-6 md:p-10 border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Find Your Route</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaMapMarkerAlt className="text-blue-500" />
                                </div>
                                <input type="text" name="source"
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                                    placeholder="Source City" value={formData.source} onChange={handleChange} required />
                            </div>
                        </div>
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaMapMarkerAlt className="text-red-500" />
                                </div>
                                <input type="text" name="destination"
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                                    placeholder="Destination City" value={formData.destination} onChange={handleChange} required />
                            </div>
                        </div>
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaCalendar className="text-green-500" />
                                </div>
                                <input type="date" name="date"
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                                    value={formData.date} onChange={handleChange} min={today} required />
                            </div>
                        </div>
                        <div className="md:col-span-3 flex justify-center mt-4">
                            <button type="submit"
                                className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 shadow-lg transform hover:-translate-y-1 transition duration-200 flex items-center justify-center text-lg">
                                <FaSearch className="mr-2" /> Search Buses
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Buses with Available Routes Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-extrabold text-gray-900">Buses with Available Routes</h2>
                    <p className="mt-3 text-gray-500 max-w-xl mx-auto">
                        Click on any bus to view its upcoming routes and book your seat instantly
                    </p>
                </div>

                {loadingBuses ? (
                    <div className="flex justify-center items-center py-16">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600" />
                    </div>
                ) : availableBuses.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <FaBus className="text-5xl text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 font-medium">No buses with upcoming routes at the moment.</p>
                        <p className="text-gray-400 text-sm mt-1">Routes will appear here once the admin schedules trips.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {availableBuses.map(({ bus, nextRoute, routeCount }) => (
                            <div
                                key={bus._id}
                                onClick={() => setSelectedBus(bus)}
                                className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden cursor-pointer transform hover:-translate-y-1"
                            >
                                {/* Bus Image */}
                                <div className="relative h-44 bg-gradient-to-br from-blue-100 to-indigo-100 overflow-hidden">
                                    {bus.image ? (
                                        <img
                                            src={`${API_BASE}${bus.image}`}
                                            alt={bus.busName}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <FaBus className="text-7xl text-blue-200 group-hover:scale-110 transition-transform duration-300" />
                                        </div>
                                    )}
                                    {/* Hover overlay */}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                                        <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-blue-600 font-black text-xs uppercase tracking-widest px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                                            <FaRoute /> View Routes
                                        </span>
                                    </div>
                                    {/* Badges */}
                                    <div className="absolute top-3 left-3 flex gap-2">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow ${bus.busType === 'AC' ? 'bg-blue-600 text-white' : 'bg-orange-500 text-white'}`}>
                                            {bus.busType === 'AC' ? <><FaSnowflake className="inline mr-1" />AC</> : 'Non-AC'}
                                        </span>
                                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/90 text-gray-700 shadow">
                                            {bus.category}
                                        </span>
                                    </div>
                                    {/* Route count badge */}
                                    <div className="absolute top-3 right-3">
                                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-green-500 text-white shadow">
                                            {routeCount} {routeCount === 1 ? 'Route' : 'Routes'}
                                        </span>
                                    </div>
                                </div>

                                {/* Bus Info */}
                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{bus.busName}</h3>
                                            <p className="text-xs font-mono text-blue-500 font-bold mt-0.5">{bus.busNumber}</p>
                                        </div>
                                        <span className="flex h-2.5 w-2.5 rounded-full bg-green-400 mt-1.5 flex-shrink-0" title="Active" />
                                    </div>

                                    {/* Next route preview */}
                                    {nextRoute && (
                                        <div className="bg-blue-50 rounded-xl px-4 py-3 mb-3 border border-blue-100">
                                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1.5">Next Departure</p>
                                            <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
                                                <FaMapMarkerAlt className="text-blue-500 text-xs flex-shrink-0" />
                                                <span className="truncate">{nextRoute.source}</span>
                                                <FaArrowRight className="text-gray-400 text-xs flex-shrink-0" />
                                                <span className="truncate">{nextRoute.destination}</span>
                                            </div>
                                            <div className="flex items-center justify-between mt-1.5 text-xs text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <FaCalendarAlt className="text-[9px]" />
                                                    {formatDate(nextRoute.departureDate)} · {formatTime(nextRoute.departureTime)}
                                                </span>
                                                <span className="font-black text-blue-600 flex items-center">
                                                    <FaRupeeSign className="text-[9px]" />{nextRoute.price}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-4 text-sm text-gray-500 border-t border-gray-50 pt-3 mb-4">
                                        <div className="flex items-center gap-1.5">
                                            {bus.category === 'Sleeper' || bus.category === 'Semi-Sleeper'
                                                ? <FaBed className="text-indigo-500" />
                                                : <FaChair className="text-blue-500" />}
                                            <span className="font-medium">{bus.totalSeats} Seats</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <FaBus className="text-gray-400 text-xs" />
                                            <span className="font-medium">{bus.seatLayout} Layout</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={(e) => { e.stopPropagation(); setSelectedBus(bus); }}
                                        className="w-full py-2.5 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white font-bold text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-2 group-hover:bg-blue-600 group-hover:text-white"
                                    >
                                        <FaRoute className="text-xs" /> View All Routes <FaArrowRight className="text-xs" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Features Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-extrabold text-gray-900">Why Travel With Us?</h2>
                    <p className="mt-4 text-gray-500">We provide the best travel experience in the industry</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white p-8 rounded-xl shadow-md text-center hover:shadow-xl transition duration-300">
                        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-600 mb-6">
                            <FaBus className="text-3xl" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Modern Fleet</h3>
                        <p className="text-gray-500">Travel in our latest Volvo and Scania buses equipped with WiFi and Entertainment.</p>
                    </div>
                    <div className="bg-white p-8 rounded-xl shadow-md text-center hover:shadow-xl transition duration-300">
                        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 text-green-600 mb-6">
                            <FaClock className="text-3xl" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">On-Time Guarantee</h3>
                        <p className="text-gray-500">We value your time. Our buses adhere strictly to the schedule.</p>
                    </div>
                    <div className="bg-white p-8 rounded-xl shadow-md text-center hover:shadow-xl transition duration-300">
                        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 text-indigo-600 mb-6">
                            <FaShieldAlt className="text-3xl" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Safe & Secure</h3>
                        <p className="text-gray-500">Sanitized buses, professional drivers, and secure payment gateways.</p>
                    </div>
                </div>
            </div>

            {/* Bus Routes Modal */}
            {selectedBus && (
                <BusRoutesModal
                    bus={selectedBus}
                    onClose={() => setSelectedBus(null)}
                    onSelectRoute={handleSelectRoute}
                />
            )}
        </div>
    );
};

export default Home;

