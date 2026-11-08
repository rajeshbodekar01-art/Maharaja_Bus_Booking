import { useState, useEffect } from 'react';
import { FaRoute, FaTimes, FaMapMarkerAlt, FaCalendarAlt, FaClock, FaRupeeSign, FaExclamationCircle, FaBus, FaHistory, FaMapSigns } from 'react-icons/fa';
import api from '../utils/api';

const RouteFormModal = ({ isOpen, onClose, onSuccess, route = null, buses = [] }) => {
    const [formData, setFormData] = useState({
        busId: '',
        source: '',
        destination: '',
        departureDate: '',
        departureTime: '',
        arrivalTime: '',
        price: ''
    });
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (route) {
            setEditingId(route._id);
            setFormData({
                busId: route.busId?._id || '',
                source: route.source,
                destination: route.destination,
                departureDate: new Date(route.departureDate).toISOString().split('T')[0],
                departureTime: route.departureTime,
                arrivalTime: route.arrivalTime,
                price: route.price
            });
        } else {
            setEditingId(null);
            setFormData({
                busId: '',
                source: '',
                destination: '',
                departureDate: '',
                departureTime: '',
                arrivalTime: '',
                price: ''
            });
        }
        setError('');
    }, [route, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const payload = {
                ...formData,
                price: parseFloat(formData.price)
            };

            if (editingId) {
                await api.put(`/routes/${editingId}`, payload);
            } else {
                await api.post('/routes', payload);
            }
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save route. Check if all fields are correct.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] overflow-hidden flex items-center justify-center p-4">
            {/* Elegant Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity duration-500 animate-in fade-in"
                onClick={() => !loading && onClose()}
            ></div>

            {/* Modal Container */}
            <div className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] overflow-hidden border border-slate-100 transform transition-all animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">

                {/* Decorative Accents */}
                <div className="absolute top-0 left-0 w-80 h-80 bg-indigo-50 rounded-full -ml-40 -mt-40 blur-3xl opacity-60 pointer-events-none"></div>
                <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-50 rounded-full -mr-40 -mb-40 blur-3xl opacity-60 pointer-events-none"></div>

                {/* Header Section */}
                <div className="relative px-10 pt-10 pb-6 flex justify-between items-start">
                    <div className="flex gap-6 items-center">
                        <div className="group relative">
                            <div className="absolute inset-0 bg-indigo-400 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity"></div>
                            <div className="relative w-16 h-16 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-xl -rotate-3 transition-transform hover:rotate-0">
                                <FaRoute className="text-white text-3xl" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">
                                {editingId ? 'Modify Schedule' : 'Launch New Route'}
                            </h3>
                            <div className="flex items-center gap-2">
                                <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                                    Network Expansion Hub
                                </p>
                            </div>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-3 bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-3xl transition-all active:scale-90"
                    >
                        <FaTimes size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="relative px-10 pb-10">
                    <div className="space-y-6">
                        {error && (
                            <div className="bg-rose-50 border border-rose-100 p-5 rounded-[2rem] flex items-center gap-4 animate-in slide-in-from-top-4">
                                <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <FaExclamationCircle className="text-rose-600 text-xl" />
                                </div>
                                <p className="text-sm text-rose-700 font-bold leading-relaxed">{error}</p>
                            </div>
                        )}

                        {/* Fleet Selection */}
                        <div className="space-y-2.5">
                            <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                Assign Vehicle <FaBus className="text-slate-200" />
                            </label>
                            <div className="relative">
                                <select
                                    className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-[1.5rem] py-4.5 px-6 transition-all font-bold outline-none appearance-none cursor-pointer text-lg shadow-sm focus:shadow-indigo-100"
                                    value={formData.busId}
                                    onChange={(e) => setFormData({ ...formData, busId: e.target.value })}
                                    required
                                >
                                    <option value="">Select bus from active fleet</option>
                                    {buses.map(bus => (
                                        <option key={bus._id} value={bus._id}>
                                            {bus.busName} — {bus.busNumber} ({bus.totalSeats} seats)
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </div>

                        {/* Journey Group */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2.5">
                                <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                    Departure Point <FaMapMarkerAlt className="text-emerald-400" />
                                </label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-[1.5rem] py-4.5 px-6 transition-all font-bold placeholder:text-slate-300 outline-none text-lg shadow-sm"
                                    placeholder="Source city"
                                    value={formData.source}
                                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2.5">
                                <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                    Arrival Point <FaMapSigns className="text-rose-400" />
                                </label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-[1.5rem] py-4.5 px-6 transition-all font-bold placeholder:text-slate-300 outline-none text-lg shadow-sm"
                                    placeholder="Destination city"
                                    value={formData.destination}
                                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        {/* Schedule Group */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div className="space-y-2.5">
                                <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                    Date <FaCalendarAlt className="text-slate-300" />
                                </label>
                                <input
                                    type="date"
                                    className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-[1.5rem] py-4.5 px-5 transition-all font-black outline-none text-lg shadow-sm"
                                    value={formData.departureDate}
                                    onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2.5">
                                <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                    Depart <FaClock className="text-blue-400" />
                                </label>
                                <input
                                    type="time"
                                    className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-[1.5rem] py-4.5 px-5 transition-all font-black outline-none text-lg shadow-sm"
                                    value={formData.departureTime}
                                    onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2.5">
                                <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                    Arrive <FaHistory className="text-emerald-400" />
                                </label>
                                <input
                                    type="time"
                                    className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-[1.5rem] py-4.5 px-5 transition-all font-black outline-none text-lg shadow-sm"
                                    value={formData.arrivalTime}
                                    onChange={(e) => setFormData({ ...formData, arrivalTime: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        {/* Financial Group */}
                        <div className="space-y-2.5">
                            <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                Ticket Inventory Price <FaRupeeSign className="text-slate-300" />
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-indigo-600">
                                    <FaRupeeSign className="text-xl" />
                                </div>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-[1.5rem] py-4.5 pl-14 pr-8 transition-all font-black outline-none text-xl shadow-sm focus:shadow-indigo-100"
                                    placeholder="0.00"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-12 flex flex-col sm:flex-row-reverse gap-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`flex-[2] py-6 px-10 rounded-[1.8rem] bg-indigo-600 text-white font-black text-sm uppercase tracking-[0.25em] shadow-[0_20px_40px_-12px_rgba(79,70,229,0.4)] hover:bg-indigo-700 hover:shadow-[0_25px_50px_-12px_rgba(79,70,229,0.5)] transition-all transform hover:-translate-y-1.5 active:scale-[0.98] disabled:opacity-50 disabled:translate-y-0`}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-3">
                                    <div className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin"></div>
                                    Processing...
                                </span>
                            ) : (
                                editingId ? 'Update Connection' : 'Register Route'
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-6 px-10 rounded-[1.8rem] bg-slate-50 text-slate-500 font-black text-[11px] uppercase tracking-widest hover:bg-slate-100 hover:text-slate-900 transition-all active:scale-[0.98]"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RouteFormModal;
