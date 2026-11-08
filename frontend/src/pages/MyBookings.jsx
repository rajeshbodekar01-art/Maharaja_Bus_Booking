import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaCalendar, FaClock, FaBus, FaRupeeSign, FaTicketAlt,
    FaTimes, FaPrint, FaExclamationTriangle, FaCheckCircle,
    FaTimesCircle, FaArrowRight
} from 'react-icons/fa';
import api from '../utils/api';

const MyBookings = () => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    // Cancel modal state
    const [cancelModal, setCancelModal] = useState({ open: false, bookingId: null, bookingRef: '' });
    const [cancelReason, setCancelReason] = useState('');
    const [cancelError, setCancelError] = useState('');
    const [cancelling, setCancelling] = useState(false);
    const [cancelSuccess, setCancelSuccess] = useState(false);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const response = await api.get('/bookings/user');
            setBookings(response.data.bookings);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const openCancelModal = (booking) => {
        setCancelModal({ open: true, bookingId: booking._id, bookingRef: booking._id.slice(-6).toUpperCase() });
        setCancelReason('');
        setCancelError('');
        setCancelSuccess(false);
    };

    const closeCancelModal = () => {
        if (cancelling) return;
        setCancelModal({ open: false, bookingId: null, bookingRef: '' });
        setCancelReason('');
        setCancelError('');
        setCancelSuccess(false);
    };

    const handleCancelSubmit = async (e) => {
        e.preventDefault();
        if (!cancelReason.trim()) {
            setCancelError('Please provide a reason for cancellation.');
            return;
        }
        try {
            setCancelling(true);
            setCancelError('');
            await api.put(`/bookings/${cancelModal.bookingId}/cancel`, { reason: cancelReason });
            setCancelSuccess(true);
            await fetchBookings();
            setTimeout(() => closeCancelModal(), 2500);
        } catch (error) {
            setCancelError(error.response?.data?.message || 'Failed to request cancellation. Please try again.');
        } finally {
            setCancelling(false);
        }
    };

    const handlePrintTicket = (bookingId) => {
        navigate(`/ticket/${bookingId}`);
        // Slight delay to let print trigger from ticket page
    };

    const statusBadge = (status) => {
        const map = {
            confirmed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            cancel_requested: 'bg-amber-100 text-amber-700 border-amber-200',
            cancelled: 'bg-red-100 text-red-600 border-red-200',
        };
        const labels = {
            confirmed: 'Confirmed',
            cancel_requested: 'Cancel Pending',
            cancelled: 'Cancelled',
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${map[status] || ''}`}>
                {labels[status] || status}
            </span>
        );
    };

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mb-4"></div>
            <p className="text-gray-500 font-medium">Loading your bookings...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-extrabold text-gray-900">My Bookings</h2>
                        <p className="text-gray-500 text-sm mt-1">Track and manage all your bus tickets</p>
                    </div>
                    <span className="bg-blue-100 text-blue-800 text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wider">
                        {bookings.length} {bookings.length === 1 ? 'Booking' : 'Bookings'}
                    </span>
                </div>

                {bookings.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-14 text-center">
                        <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-gray-100 text-gray-400 mb-6">
                            <FaTicketAlt className="text-4xl" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No bookings yet</h3>
                        <p className="text-gray-500 mb-8 max-w-sm mx-auto">You haven't made any bookings yet. Start your journey today!</p>
                        <button
                            onClick={() => navigate('/')}
                            className="inline-flex items-center gap-2 px-6 py-3 border border-transparent text-base font-bold rounded-xl shadow-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition-all transform hover:-translate-y-1"
                        >
                            Book Now <FaArrowRight />
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-5">
                        {bookings.map(booking => (
                            <div
                                key={booking._id}
                                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all"
                            >
                                {/* Top colored strip based on status */}
                                <div className={`h-1.5 w-full ${booking.status === 'confirmed' ? 'bg-emerald-400' : booking.status === 'cancel_requested' ? 'bg-amber-400' : 'bg-red-400'}`} />

                                <div className="p-6">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

                                        {/* Journey Info */}
                                        <div className="flex-grow">
                                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                                <h3 className="text-lg font-extrabold text-gray-900">
                                                    {booking.routeId?.source || 'N/A'}
                                                </h3>
                                                <span className="text-gray-400 text-xl">→</span>
                                                <h3 className="text-lg font-extrabold text-gray-900">
                                                    {booking.routeId?.destination || 'N/A'}
                                                </h3>
                                                {statusBadge(booking.status)}
                                            </div>

                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                <div className="flex items-center text-gray-600 gap-2">
                                                    <FaBus className="text-blue-500 flex-shrink-0" />
                                                    <span className="text-sm truncate">{booking.routeId?.busId?.busName || 'N/A'}</span>
                                                </div>
                                                <div className="flex items-center text-gray-600 gap-2">
                                                    <FaCalendar className="text-blue-500 flex-shrink-0" />
                                                    <span className="text-sm">{new Date(booking.routeId?.departureDate).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex items-center text-gray-600 gap-2">
                                                    <FaClock className="text-blue-500 flex-shrink-0" />
                                                    <span className="text-sm">{booking.routeId?.departureTime}</span>
                                                </div>
                                                <div className="flex items-center font-bold text-gray-900 gap-1">
                                                    <FaRupeeSign className="text-sm text-gray-400" />
                                                    <span className="text-base">{booking.totalAmount}</span>
                                                    <span className="text-xs text-gray-400 font-normal ml-1">
                                                        ({booking.seatNumbers?.length} seat{booking.seatNumbers?.length > 1 ? 's' : ''})
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Cancellation reason shown if pending */}
                                            {booking.status === 'cancel_requested' && booking.cancellationReason && (
                                                <div className="mt-3 flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5">
                                                    <FaExclamationTriangle className="text-amber-500 flex-shrink-0 mt-0.5 text-xs" />
                                                    <p className="text-xs text-amber-800 font-medium">
                                                        <span className="font-bold">Reason submitted:</span> {booking.cancellationReason}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-row md:flex-col gap-2.5 min-w-[160px]">
                                            {/* View / Print Ticket */}
                                            <button
                                                onClick={() => navigate(`/ticket/${booking._id}`)}
                                                className="flex-1 w-full bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold py-2.5 px-4 rounded-xl transition-colors text-center text-sm flex items-center justify-center gap-2"
                                            >
                                                <FaTicketAlt className="text-xs" /> View Ticket
                                            </button>

                                            {/* Print shortcut */}
                                            {booking.status === 'confirmed' && (
                                                <button
                                                    onClick={() => handlePrintTicket(booking._id)}
                                                    className="flex-1 w-full bg-gray-50 text-gray-600 hover:bg-gray-100 font-bold py-2.5 px-4 rounded-xl transition-colors text-sm flex items-center justify-center gap-2 border border-gray-100"
                                                >
                                                    <FaPrint className="text-xs" /> Print
                                                </button>
                                            )}

                                            {/* Cancel / Status */}
                                            {booking.status === 'confirmed' ? (
                                                <button
                                                    onClick={() => openCancelModal(booking)}
                                                    className="flex-1 w-full border border-red-100 text-red-600 hover:bg-red-50 font-bold py-2.5 px-4 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
                                                >
                                                    <FaTimes className="text-xs" /> Cancel
                                                </button>
                                            ) : booking.status === 'cancel_requested' ? (
                                                <div className="flex-1 w-full bg-amber-50 text-amber-600 font-bold py-2.5 px-4 rounded-xl text-center text-sm border border-amber-100 flex items-center justify-center gap-2">
                                                    <FaClock className="text-xs" /> Pending
                                                </div>
                                            ) : (
                                                <div className="flex-1 w-full bg-red-50 text-red-500 font-bold py-2.5 px-4 rounded-xl text-center text-sm border border-red-100 flex items-center justify-center gap-2">
                                                    <FaTimesCircle className="text-xs" /> Cancelled
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ─── Cancel Modal ─── */}
            {cancelModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={closeCancelModal}
                    />

                    <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Modal header */}
                        <div className="bg-red-600 px-8 py-7 text-white relative">
                            <h2 className="text-xl font-black">Cancel Booking</h2>
                            <p className="text-red-200 text-sm mt-1">
                                Booking Ref: <span className="font-bold text-white">#{cancelModal.bookingRef}</span>
                            </p>
                            <button
                                onClick={closeCancelModal}
                                disabled={cancelling}
                                className="absolute top-5 right-5 text-red-200 hover:text-white transition-colors disabled:opacity-50"
                            >
                                <FaTimes className="text-xl" />
                            </button>
                        </div>

                        {cancelSuccess ? (
                            <div className="p-10 text-center">
                                <div className="bg-green-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5">
                                    <FaCheckCircle className="text-4xl text-green-500" />
                                </div>
                                <h3 className="text-xl font-black text-gray-900 mb-2">Request Submitted!</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">
                                    Your cancellation request has been sent to the admin for review.
                                    You'll be notified once it's processed.
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleCancelSubmit} className="p-8 space-y-6">
                                <div>
                                    <label className="block text-xs font-black text-gray-700 uppercase tracking-widest mb-2">
                                        Reason for Cancellation <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        rows="4"
                                        className={`w-full bg-gray-50 border-2 rounded-2xl py-4 px-5 text-sm font-medium outline-none resize-none transition-all ${cancelError
                                                ? 'border-red-400 focus:border-red-500'
                                                : 'border-gray-100 focus:border-blue-500 focus:bg-white'
                                            }`}
                                        placeholder="Please tell us why you'd like to cancel this booking..."
                                        value={cancelReason}
                                        onChange={(e) => { setCancelReason(e.target.value); setCancelError(''); }}
                                        disabled={cancelling}
                                    />
                                    {cancelError && (
                                        <p className="mt-2 text-xs text-red-500 font-bold flex items-center gap-1">
                                            <FaExclamationTriangle /> {cancelError}
                                        </p>
                                    )}
                                </div>

                                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                                    <FaExclamationTriangle className="text-blue-400 mt-0.5 flex-shrink-0 text-sm" />
                                    <p className="text-xs text-blue-700 font-medium leading-relaxed">
                                        Your request will be reviewed by our team. Refunds are subject to our cancellation policy.
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        disabled={cancelling}
                                        className="flex-1 bg-red-600 text-white font-black py-4 rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-red-100 disabled:opacity-60 flex items-center justify-center gap-2 text-sm uppercase tracking-widest"
                                    >
                                        {cancelling ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            'Confirm Cancel'
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={closeCancelModal}
                                        disabled={cancelling}
                                        className="flex-1 bg-gray-100 text-gray-600 font-black py-4 rounded-2xl hover:bg-gray-200 transition-all text-sm uppercase tracking-widest"
                                    >
                                        Keep It
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyBookings;
