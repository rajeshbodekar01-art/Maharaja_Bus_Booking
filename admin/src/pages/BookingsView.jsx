import { useState, useEffect } from 'react';
import {
    FaTicketAlt, FaBus, FaCalendarAlt, FaUser, FaClock,
    FaRupeeSign, FaCircle, FaCheckCircle, FaTimesCircle,
    FaExclamationCircle, FaCommentAlt
} from 'react-icons/fa';
import api from '../utils/api';

const STATUS_TABS = [
    { label: 'All', value: 'all' },
    { label: 'Confirmed', value: 'confirmed' },
    { label: 'Cancel Requested', value: 'cancel_requested' },
    { label: 'Cancelled', value: 'cancelled' },
];

const BookingsView = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [expandedReason, setExpandedReason] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const response = await api.get('/bookings');
            setBookings(response.data.bookings);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePaymentStatus = async (id, status) => {
        try {
            setActionLoading(id + '-pay');
            await api.put(`/bookings/${id}/payment-status`, { paymentStatus: status });
            fetchBookings();
        } catch (error) {
            console.error('Error updating payment status:', error);
            alert('Failed to update payment status');
        } finally {
            setActionLoading(null);
        }
    };

    const handleApproveCancellation = async (id) => {
        if (!window.confirm('Are you sure you want to approve this cancellation?')) return;
        try {
            setActionLoading(id + '-approve');
            await api.put(`/bookings/${id}/approve-cancel`);
            fetchBookings();
        } catch (error) {
            console.error('Error approving cancellation:', error);
            alert('Failed to approve cancellation');
        } finally {
            setActionLoading(null);
        }
    };

    const handleRejectCancellation = async (id) => {
        if (!window.confirm('Reject this cancellation request? The booking will be restored to confirmed.')) return;
        try {
            setActionLoading(id + '-reject');
            await api.put(`/bookings/${id}/reject-cancel`);
            fetchBookings();
        } catch (error) {
            console.error('Error rejecting cancellation:', error);
            alert('Failed to reject cancellation');
        } finally {
            setActionLoading(null);
        }
    };

    const filtered = activeTab === 'all' ? bookings : bookings.filter(b => b.status === activeTab);

    const counts = {
        all: bookings.length,
        confirmed: bookings.filter(b => b.status === 'confirmed').length,
        cancel_requested: bookings.filter(b => b.status === 'cancel_requested').length,
        cancelled: bookings.filter(b => b.status === 'cancelled').length,
    };

    const statusBadge = (status) => {
        const cfg = {
            confirmed: { cls: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: <FaCheckCircle className="mr-1.5 text-[8px]" />, label: 'Confirmed' },
            cancel_requested: { cls: 'bg-amber-50 text-amber-700 border-amber-100', icon: <FaExclamationCircle className="mr-1.5 text-[8px]" />, label: 'Cancel Requested' },
            cancelled: { cls: 'bg-red-50 text-red-700 border-red-100', icon: <FaTimesCircle className="mr-1.5 text-[8px]" />, label: 'Cancelled' },
        };
        const c = cfg[status] || { cls: 'bg-gray-50 text-gray-600 border-gray-100', icon: <FaCircle className="mr-1.5 text-[8px]" />, label: status };
        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${c.cls}`}>
                {c.icon}{c.label}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Bookings Management</h2>
                    <p className="text-gray-500 text-sm mt-1 font-medium">Manage ticket bookings, cancellations, and payments</p>
                </div>
                <div className="flex gap-3">
                    <div className="bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-xl text-center">
                        <p className="text-xs font-black text-emerald-700 uppercase tracking-wider">{counts.confirmed}</p>
                        <p className="text-[9px] text-emerald-600 font-bold mt-0.5">Confirmed</p>
                    </div>
                    <div className="bg-amber-50 border border-amber-100 px-4 py-2 rounded-xl text-center">
                        <p className="text-xs font-black text-amber-700 uppercase tracking-wider">{counts.cancel_requested}</p>
                        <p className="text-[9px] text-amber-600 font-bold mt-0.5">Pending</p>
                    </div>
                </div>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex flex-wrap gap-2 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                {STATUS_TABS.map(tab => (
                    <button
                        key={tab.value}
                        onClick={() => setActiveTab(tab.value)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.value
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-100'
                                : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-100'
                            }`}
                    >
                        {tab.label}
                        <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-black ${activeTab === tab.value ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
                            }`}>
                            {counts[tab.value]}
                        </span>
                    </button>
                ))}
            </div>

            {/* Bookings Table */}
            <div className="bg-white shadow-xl rounded-3xl overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Booking</th>
                                <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Passenger</th>
                                <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Route & Bus</th>
                                <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Payment</th>
                                <th className="px-6 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Status & Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-10 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
                                            <p className="text-gray-400 font-medium">Loading bookings...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-16 text-center">
                                        <div className="flex flex-col items-center text-gray-300">
                                            <FaTicketAlt className="text-5xl mb-4" />
                                            <p className="text-gray-500 font-bold text-lg">No bookings found</p>
                                            <p className="text-sm text-gray-400">
                                                {activeTab !== 'all' ? `No ${activeTab.replace('_', ' ')} bookings` : 'Once users start booking, they will appear here'}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map(booking => (
                                    <tr key={booking._id} className="hover:bg-blue-50/30 transition-colors group">
                                        {/* Booking ID */}
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <div className="text-sm font-black text-gray-900 font-mono">#{booking._id.slice(-6).toUpperCase()}</div>
                                                <div className="text-[10px] font-bold text-gray-400 flex items-center mt-1 uppercase tracking-tighter">
                                                    <FaCalendarAlt className="mr-1 text-blue-400" />
                                                    {new Date(booking.bookingDate).toLocaleDateString()}
                                                </div>
                                                <div className="text-[10px] text-gray-400 mt-0.5 font-medium">
                                                    {booking.seatNumbers?.length} seat{booking.seatNumbers?.length > 1 ? 's' : ''}
                                                </div>
                                            </div>
                                        </td>

                                        {/* Passenger */}
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 mr-3 flex-shrink-0">
                                                    <FaUser className="text-sm" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-gray-700">{booking.userId?.name || 'Guest'}</div>
                                                    <div className="text-[10px] text-gray-400 font-medium">{booking.userId?.email || 'N/A'}</div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Route */}
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="flex flex-col gap-1">
                                                <div className="text-xs font-black text-gray-800 flex items-center gap-1.5">
                                                    <FaBus className="text-blue-400 text-[10px]" />
                                                    {booking.routeId?.busId?.busName || 'Unknown'}
                                                </div>
                                                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">
                                                    {booking.routeId?.source} → {booking.routeId?.destination}
                                                </div>
                                                <div className="text-[10px] text-gray-400 flex items-center gap-1">
                                                    <FaClock className="text-[8px]" />
                                                    {booking.routeId?.departureTime} &nbsp;·&nbsp;
                                                    {new Date(booking.routeId?.departureDate).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </td>

                                        {/* Payment */}
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="text-sm font-black text-gray-900 flex items-center">
                                                    <FaRupeeSign className="text-xs opacity-50 mr-0.5" />{booking.totalAmount}
                                                </div>
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter border ${booking.paymentMethod === 'depot'
                                                            ? 'bg-orange-50 text-orange-600 border-orange-100'
                                                            : 'bg-blue-50 text-blue-600 border-blue-100'
                                                        }`}>{booking.paymentMethod === 'depot' ? 'Depot' : 'Digital'}</span>
                                                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter border ${booking.paymentStatus === 'paid'
                                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                            : booking.paymentStatus === 'refunded'
                                                                ? 'bg-purple-50 text-purple-600 border-purple-100'
                                                                : 'bg-red-50 text-red-600 border-red-100'
                                                        }`}>{booking.paymentStatus}</span>
                                                </div>
                                                {booking.paymentMethod === 'depot' && booking.paymentStatus === 'pending' && (
                                                    <button
                                                        onClick={() => handleUpdatePaymentStatus(booking._id, 'paid')}
                                                        disabled={actionLoading === booking._id + '-pay'}
                                                        className="text-[9px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 underline text-left disabled:opacity-50 mt-0.5"
                                                    >
                                                        {actionLoading === booking._id + '-pay' ? 'Updating...' : '✓ Mark as Paid'}
                                                    </button>
                                                )}
                                            </div>
                                        </td>

                                        {/* Status & Actions */}
                                        <td className="px-6 py-5 whitespace-nowrap text-right">
                                            <div className="flex flex-col items-end gap-2.5">
                                                {statusBadge(booking.status)}

                                                {/* Cancel Requested actions */}
                                                {booking.status === 'cancel_requested' && (
                                                    <div className="flex flex-col items-end gap-2">
                                                        {/* Reason */}
                                                        {booking.cancellationReason && (
                                                            <div className="max-w-[220px] text-right">
                                                                <button
                                                                    onClick={() => setExpandedReason(expandedReason === booking._id ? null : booking._id)}
                                                                    className="flex items-center gap-1 text-[9px] text-gray-400 hover:text-blue-500 font-bold uppercase tracking-widest transition-colors justify-end"
                                                                >
                                                                    <FaCommentAlt className="text-[8px]" />
                                                                    {expandedReason === booking._id ? 'Hide Reason' : 'View Reason'}
                                                                </button>
                                                                {expandedReason === booking._id && (
                                                                    <div className="mt-1.5 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 text-left">
                                                                        <p className="text-[10px] text-amber-800 font-medium leading-relaxed">
                                                                            "{booking.cancellationReason}"
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                        {/* Action buttons */}
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleRejectCancellation(booking._id)}
                                                                disabled={!!actionLoading}
                                                                className="px-3 py-1.5 bg-gray-100 text-gray-600 text-[9px] font-black rounded-lg hover:bg-gray-200 transition-colors uppercase tracking-widest disabled:opacity-50"
                                                            >
                                                                {actionLoading === booking._id + '-reject' ? '...' : 'Reject'}
                                                            </button>
                                                            <button
                                                                onClick={() => handleApproveCancellation(booking._id)}
                                                                disabled={!!actionLoading}
                                                                className="px-3 py-1.5 bg-red-600 text-white text-[9px] font-black rounded-lg hover:bg-red-700 shadow-sm transition-colors uppercase tracking-widest disabled:opacity-50"
                                                            >
                                                                {actionLoading === booking._id + '-approve' ? '...' : 'Approve'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
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

export default BookingsView;
