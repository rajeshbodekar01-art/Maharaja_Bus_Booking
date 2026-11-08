import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaBus } from 'react-icons/fa';
import api from '../utils/api';
import BusFormModal from '../components/BusFormModal';

const BusManagement = () => {
    const [buses, setBuses] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedBus, setSelectedBus] = useState(null);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        fetchBuses();
    }, []);

    const fetchBuses = async () => {
        setFetching(true);
        try {
            const response = await api.get('/buses');
            setBuses(response.data.buses);
        } catch (error) {
            console.error('Error fetching buses:', error);
        } finally {
            setFetching(false);
        }
    };

    const handleShow = (bus = null) => {
        setSelectedBus(bus);
        setShowModal(true);
    };


    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this bus? This action cannot be undone.')) {
            try {
                await api.delete(`/buses/${id}`);
                fetchBuses();
            } catch (err) {
                alert('Failed to delete bus');
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Bus Fleet</h2>
                    <p className="text-gray-500 text-sm mt-1 font-medium">Manage and monitor all your transport vehicles</p>
                </div>
                <button
                    onClick={() => handleShow()}
                    className="mt-4 sm:mt-0 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl flex items-center shadow-lg transition-all transform hover:-translate-y-1 active:scale-95"
                >
                    <FaPlus className="mr-2" /> Add New Bus
                </button>
            </div>

            <div className="bg-white shadow-xl rounded-3xl overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Bus Details</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Specifications</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-50">
                            {fetching ? (
                                <tr>
                                    <td colSpan="4" className="px-8 py-10 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
                                            <p className="text-gray-400 font-medium">Fetching fleet data...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : buses.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-8 py-16 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="p-4 bg-gray-50 rounded-full mb-4">
                                                <FaBus className="text-4xl text-gray-300" />
                                            </div>
                                            <p className="text-gray-500 font-bold text-lg">No buses in fleet</p>
                                            <p className="text-gray-400 text-sm">Create your first bus to get started</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                buses.map(bus => (
                                    <tr key={bus._id} className="hover:bg-blue-50/30 transition-colors group">
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mr-4 flex-shrink-0 overflow-hidden shadow-sm">
                                                    {bus.image ? (
                                                        <img
                                                            src={`http://localhost:5000${bus.image}`}
                                                            alt={bus.busName}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <FaBus className="text-xl group-hover:text-blue-600 transition-colors" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-black text-gray-900">{bus.busName}</div>
                                                    <div className="flex gap-2 mt-1">
                                                        <span className="text-[10px] font-bold text-blue-500 font-mono tracking-tighter uppercase">{bus.busNumber}</span>
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">• {bus.totalSeats} Seats</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${bus.busType === 'AC' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                                                    {bus.busType}
                                                </span>
                                                <span className="px-2 py-0.5 bg-gray-50 text-gray-500 border border-gray-100 rounded text-[9px] font-black uppercase tracking-widest">
                                                    {bus.category}
                                                </span>
                                                <span className="px-2 py-0.5 bg-gray-50 text-gray-500 border border-gray-100 rounded text-[9px] font-black uppercase tracking-widest">
                                                    {bus.seatLayout}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-[9px] font-black rounded-full uppercase tracking-widest border ${bus.status === 'active'
                                                ? 'bg-green-50 text-green-700 border-green-100'
                                                : 'bg-red-50 text-red-700 border-red-100'
                                                }`}>
                                                {bus.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleShow(bus)}
                                                    className="p-2 bg-white border border-gray-100 text-gray-400 hover:text-blue-600 hover:border-blue-200 rounded-xl shadow-sm transition-all"
                                                    title="Edit Bus"
                                                >
                                                    <FaEdit className="text-lg" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(bus._id)}
                                                    className="p-2 bg-white border border-gray-100 text-gray-400 hover:text-red-600 hover:border-red-200 rounded-xl shadow-sm transition-all"
                                                    title="Delete Bus"
                                                >
                                                    <FaTrash className="text-lg" />
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

            <BusFormModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSuccess={fetchBuses}
                bus={selectedBus}
            />
        </div>
    );
};

export default BusManagement;
