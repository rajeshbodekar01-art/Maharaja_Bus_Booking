import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaRoute, FaCalendarAlt, FaClock, FaRupeeSign, FaBus } from 'react-icons/fa';
import api from '../utils/api';
import RouteFormModal from '../components/RouteFormModal';

const RouteManagement = () => {
    const [routes, setRoutes] = useState([]);
    const [buses, setBuses] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedRoute, setSelectedRoute] = useState(null);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        fetchRoutes();
        fetchBuses();
    }, []);

    const fetchRoutes = async () => {
        setFetching(true);
        try {
            const response = await api.get('/routes');
            setRoutes(response.data.routes);
        } catch (error) {
            console.error('Error fetching routes:', error);
        } finally {
            setFetching(false);
        }
    };

    const fetchBuses = async () => {
        try {
            const response = await api.get('/buses');
            setBuses(response.data.buses);
        } catch (error) {
            console.error('Error fetching buses:', error);
        }
    };

    const handleShow = (route = null) => {
        setSelectedRoute(route);
        setShowModal(true);
    };


    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this route? This will affect existing bookings.')) {
            try {
                await api.delete(`/routes/${id}`);
                fetchRoutes();
            } catch (err) {
                alert('Failed to delete route');
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Routes & Schedules</h2>
                    <p className="text-gray-500 text-sm mt-1 font-medium">Plan your journeys and set pricing for your fleet</p>
                </div>
                <button
                    onClick={() => handleShow()}
                    className="mt-4 sm:mt-0 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl flex items-center shadow-lg transition-all transform hover:-translate-y-1 active:scale-95"
                >
                    <FaPlus className="mr-2" /> Add New Route
                </button>
            </div>

            <div className="bg-white shadow-xl rounded-3xl overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Bus Info</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Journey</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Schedule</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Pricing</th>
                                <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-50">
                            {fetching ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-10 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
                                            <p className="text-gray-400 font-medium">Loading schedules...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : routes.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-16 text-center">
                                        <div className="flex flex-col items-center text-gray-300">
                                            <FaRoute className="text-5xl mb-4" />
                                            <p className="text-gray-500 font-bold text-lg">No routes scheduled</p>
                                            <p className="text-sm">Start by adding your first travel route</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                routes.map(route => (
                                    <tr key={route._id} className="hover:bg-blue-50/30 transition-colors group">
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-xl bg-gray-100 text-gray-500 flex items-center justify-center mr-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                    <FaBus />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-black text-gray-900">{route.busId?.busName || 'N/A'}</div>
                                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{route.busId?.busNumber || 'UNASSIGNED'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <div className="text-sm font-bold text-gray-700">{route.source}</div>
                                                <div className="h-px w-4 bg-gray-300"></div>
                                                <div className="text-sm font-bold text-gray-700">{route.destination}</div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center text-xs font-bold text-gray-600">
                                                    <FaCalendarAlt className="mr-2 text-blue-500" />
                                                    {new Date(route.departureDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </div>
                                                <div className="flex items-center text-xs font-black text-blue-600">
                                                    <FaClock className="mr-2" />
                                                    {route.departureTime}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <div className="inline-flex items-center px-3 py-1 bg-green-50 text-green-700 rounded-lg border border-green-100 font-black">
                                                <FaRupeeSign className="text-xs mr-1 opacity-70" />
                                                {route.price}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleShow(route)}
                                                    className="p-2 bg-white border border-gray-200 text-gray-400 hover:text-blue-600 hover:border-blue-200 rounded-xl shadow-sm transition-all"
                                                >
                                                    <FaEdit className="text-base" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(route._id)}
                                                    className="p-2 bg-white border border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-200 rounded-xl shadow-sm transition-all"
                                                >
                                                    <FaTrash className="text-base" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <RouteFormModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSuccess={fetchRoutes}
                route={selectedRoute}
                buses={buses}
            />
        </div>
    );
};

export default RouteManagement;

