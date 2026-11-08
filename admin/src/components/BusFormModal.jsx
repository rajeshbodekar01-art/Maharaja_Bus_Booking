import { useState, useEffect, useRef } from 'react';
import { FaBus, FaChair, FaTimes, FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaImage, FaUpload } from 'react-icons/fa';
import api from '../utils/api';

const API_BASE = 'http://localhost:5000';

const BusFormModal = ({ isOpen, onClose, onSuccess, bus = null }) => {
    const [formData, setFormData] = useState({
        busNumber: '',
        busName: '',
        totalSeats: '',
        seatLayout: '2x2',
        busType: 'AC',
        category: 'Seater',
        status: 'active'
    });
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (bus) {
            setEditingId(bus._id);
            setFormData({
                busNumber: bus.busNumber,
                busName: bus.busName,
                totalSeats: bus.totalSeats,
                seatLayout: bus.seatLayout,
                busType: bus.busType || 'AC',
                category: bus.category || 'Seater',
                status: bus.status
            });
            setImagePreview(bus.image ? `${API_BASE}${bus.image}` : '');
        } else {
            setEditingId(null);
            setFormData({
                busNumber: '',
                busName: '',
                totalSeats: '',
                seatLayout: '2x2',
                busType: 'AC',
                category: 'Seater',
                status: 'active'
            });
            setImagePreview('');
        }
        setImageFile(null);
        setError('');
    }, [bus, isOpen]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            setError('Image must be less than 5MB');
            return;
        }
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Use FormData to support file upload
            const data = new FormData();
            data.append('busNumber', formData.busNumber);
            data.append('busName', formData.busName);
            data.append('totalSeats', parseInt(formData.totalSeats));
            data.append('seatLayout', formData.seatLayout);
            data.append('busType', formData.busType);
            data.append('category', formData.category);
            data.append('status', formData.status);
            if (imageFile) {
                data.append('image', imageFile);
            }

            if (editingId) {
                await api.put(`/buses/${editingId}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await api.post('/buses', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Operation failed. Please check your connection.');
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
            <div className="relative w-full max-w-xl bg-white rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] overflow-hidden border border-slate-100 transform transition-all animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 max-h-[90vh] overflow-y-auto">

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-50 rounded-full -ml-32 -mb-32 blur-3xl opacity-50 pointer-events-none"></div>

                {/* Header Section */}
                <div className="relative px-10 pt-10 pb-6 flex justify-between items-start">
                    <div className="flex gap-5 items-center">
                        <div className="group relative">
                            <div className="absolute inset-0 bg-blue-400 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity"></div>
                            <div className="relative w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-xl rotate-3 transition-transform hover:rotate-0">
                                <FaBus className="text-white text-3xl" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">
                                {editingId ? 'Refine Vehicle' : 'Deploy New Bus'}
                            </h3>
                            <div className="flex items-center gap-2">
                                <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                                    Fleet Management Core
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

                        {/* Bus Image Upload */}
                        <div className="space-y-2.5">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                Bus Photo <FaImage className="text-slate-300" />
                            </label>
                            <div
                                className="relative w-full h-40 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[1.5rem] flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all overflow-hidden"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {imagePreview ? (
                                    <>
                                        <img
                                            src={imagePreview}
                                            alt="Bus preview"
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                            <span className="text-white text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                                <FaUpload /> Change Photo
                                            </span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <FaBus className="text-4xl text-slate-300 mb-2" />
                                        <p className="text-slate-400 text-xs font-bold">Click to upload bus photo</p>
                                        <p className="text-slate-300 text-[10px] mt-1">JPG, PNG, WEBP up to 5MB</p>
                                    </>
                                )}
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                className="hidden"
                                onChange={handleImageChange}
                            />
                        </div>

                        {/* Identification Fields */}
                        <div className="grid grid-cols-2 gap-5">
                            <div className="space-y-2.5">
                                <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                    Registration No. <FaInfoCircle className="text-slate-200 text-[10px]" />
                                </label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-[1.5rem] py-4 px-6 transition-all font-mono font-black placeholder:text-slate-300 outline-none text-blue-600 uppercase text-lg shadow-sm focus:shadow-blue-100"
                                    placeholder="MH 01 AB 1234"
                                    value={formData.busNumber}
                                    onChange={(e) => setFormData({ ...formData, busNumber: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2.5">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Vehicle Model</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-[1.5rem] py-4 px-6 transition-all font-bold placeholder:text-slate-300 outline-none text-lg shadow-sm focus:shadow-blue-100"
                                    placeholder="Volvo 9600"
                                    value={formData.busName}
                                    onChange={(e) => setFormData({ ...formData, busName: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        {/* Specs Fields */}
                        <div className="grid grid-cols-2 gap-5">
                            <div className="space-y-2.5">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    Seating Capacity <FaChair className="text-slate-300" />
                                </label>
                                <input
                                    type="number"
                                    className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-[1.5rem] py-4 px-6 transition-all font-black outline-none text-lg shadow-sm focus:shadow-blue-100"
                                    placeholder="45"
                                    value={formData.totalSeats}
                                    onChange={(e) => setFormData({ ...formData, totalSeats: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2.5">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Layout Configuration</label>
                                <div className="relative">
                                    <select
                                        className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-[1.5rem] py-4 px-6 transition-all font-bold outline-none appearance-none cursor-pointer text-lg shadow-sm"
                                        value={formData.seatLayout}
                                        onChange={(e) => setFormData({ ...formData, seatLayout: e.target.value })}
                                    >
                                        <option value="2x2">2x2 Executive</option>
                                        <option value="2x3">2x3 Economy</option>
                                        <option value="3x2">3x2 Comfort</option>
                                        <option value="2x1">2x1 Premium</option>
                                        <option value="4x4">4x4 Luxury Sleeper</option>
                                    </select>
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Type & Category */}
                        <div className="grid grid-cols-2 gap-5 items-end">
                            <div className="space-y-2.5">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Environment Control</label>
                                <div className="flex bg-slate-50 p-1.5 rounded-[1.5rem] border border-slate-100 shadow-inner">
                                    {['AC', 'Non-AC'].map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, busType: type })}
                                            className={`flex-1 py-3.5 text-xs font-black uppercase tracking-widest rounded-[1.2rem] transition-all ${formData.busType === type ? 'bg-white text-blue-600 shadow-md border border-slate-50' : 'text-slate-400 hover:text-slate-600'}`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2.5">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Service Tier</label>
                                <div className="relative">
                                    <select
                                        className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-[1.5rem] py-4 px-6 transition-all font-bold outline-none appearance-none cursor-pointer text-lg shadow-sm"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option value="Seater">Standard Seater</option>
                                        <option value="Sleeper">Luxury Sleeper</option>
                                        <option value="Semi-Sleeper">Semi-Sleeper</option>
                                    </select>
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Status Toggle */}
                        {editingId && (
                            <div className="pt-4 border-t border-slate-100 space-y-4">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Fleet Deployment Status</label>
                                <div className="grid grid-cols-2 gap-5">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, status: 'active' })}
                                        className={`group py-5 px-6 rounded-[1.5rem] border-2 transition-all flex items-center justify-center gap-4 font-black text-sm shadow-sm ${formData.status === 'active'
                                            ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-emerald-50'
                                            : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                                            }`}
                                    >
                                        <div className={`p-1.5 rounded-full ${formData.status === 'active' ? 'bg-emerald-500' : 'bg-slate-100'}`}>
                                            <FaCheckCircle className="text-white text-xs" />
                                        </div>
                                        <span>Active Service</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, status: 'inactive' })}
                                        className={`py-5 px-6 rounded-[1.5rem] border-2 transition-all flex items-center justify-center gap-4 font-black text-sm shadow-sm ${formData.status === 'inactive'
                                            ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-rose-50'
                                            : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                                            }`}
                                    >
                                        <div className={`p-1.5 rounded-full ${formData.status === 'inactive' ? 'bg-rose-500' : 'bg-slate-100'}`}>
                                            <FaExclamationCircle className="text-white text-xs" />
                                        </div>
                                        <span>Maintenance</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="mt-12 flex flex-col sm:flex-row-reverse gap-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`flex-[2] py-6 px-10 rounded-[1.8rem] bg-blue-600 text-white font-black text-sm uppercase tracking-[0.25em] shadow-[0_20px_40px_-12px_rgba(37,99,235,0.4)] hover:bg-blue-700 hover:shadow-[0_25px_50px_-12px_rgba(37,99,235,0.5)] transition-all transform hover:-translate-y-1.5 active:scale-[0.98] disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none`}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-3">
                                    <div className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin"></div>
                                    Syncing Fleet...
                                </span>
                            ) : (
                                editingId ? 'Update Specifications' : 'Commission Vehicle'
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

export default BusFormModal;
