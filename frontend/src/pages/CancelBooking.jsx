import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft, FaExclamationTriangle, FaBus, FaCalendarAlt, FaClock, FaCheckCircle, FaTrashAlt } from 'react-icons/fa';
import api from '../utils/api';

const CancelBooking = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);
    const [reason, setReason] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        fetchBooking();
    }, [bookingId]);

    const fetchBooking = async () => {
        try {
            const response = await api.get(`/bookings/${bookingId}`);
            setBooking(response.data.booking);
        } catch (error) {
            console.error('Error fetching booking:', error);
            setError('Failed to load booking details');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelSubmit = async (e) => {
        e.preventDefault();
        if (!reason.trim()) {
            setError('Please provide a reason for cancellation');
            return;
        }

        try {
            setCancelling(true);
            setError('');
            await api.put(`/bookings/${bookingId}/cancel`, { reason });
            setSuccess(true);
            // Automatic redirect after 3 seconds
            setTimeout(() => {
                navigate('/my-bookings');
            }, 3000);
        } catch (error) {
            console.error('Error requesting cancellation:', error);
            setError(error.response?.data?.message || 'Failed to request cancellation');
        } finally {
            setCancelling(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mb-4"></div>
            <p className="text-gray-500 font-medium">Loading booking details...</p>
        </div>
    );

    if (!booking && !success) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="text-center p-8 bg-white rounded-3xl shadow-xl border border-gray-100 max-w-md w-full">
                <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FaExclamationTriangle className="text-3xl text-red-500" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">Booking Not Found</h2>
                <p className="text-gray-500 mb-8">We couldn't find the booking you're looking for.</p>
                <button
                    onClick={() => navigate('/my-bookings')}
                    className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 transition-all shadow-lg"
                >
                    Back to My Bookings
                </button>
            </div>
        </div>
    );

    if (success) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="text-center p-10 bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-md w-full">
                <div className="bg-green-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                    <FaCheckCircle className="text-5xl text-green-500" />
                </div>
                <h2 className="text-3xl font-black text-gray-900 mb-4">Request Sent!</h2>
                <p className="text-gray-500 mb-8 leading-relaxed">
                    Your cancellation request has been submitted to the admin for approval. You'll be notified once it's processed.
                </p>
                <div className="space-y-4">
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 animate-[loading_3s_ease-in-out]"></div>
                    </div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Redirecting in a few seconds...</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <button
                    onClick={() => navigate('/my-bookings')}
                    className="flex items-center text-gray-500 hover:text-blue-600 transition-colors mb-8 font-bold group"
                >
                    <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100 mr-3 group-hover:bg-blue-50 transition-colors">
                        <FaArrowLeft />
                    </div>
                    Back to Bookings
                </button>

                <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100">
                    <div className="bg-red-600 px-8 py-10 text-white relative">
                        <div className="relative z-10">
                            <h1 className="text-3xl font-black mb-2">Cancel Booking</h1>
                            <p className="text-red-100 font-medium">Requesting cancellation for Booking #{booking._id.slice(-6).toUpperCase()}</p>
                        </div>
                        <FaTrashAlt className="absolute top-1/2 right-10 -translate-y-1/2 text-8xl text-white opacity-10" />
                    </div>

                    <div className="p-8 md:p-12">
                        {/* Booking Preview Card */}
                        <div className="bg-gray-50 rounded-3xl p-6 mb-10 border border-gray-100">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-100 p-2.5 rounded-xl text-blue-600">
                                        <FaBus />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Bus Name</p>
                                        <p className="font-bold text-gray-900">{booking.routeId?.busId?.busName || 'Premium Bus'}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Total Seats</p>
                                    <p className="font-black text-blue-600 text-lg">{booking.seatNumbers?.length || 0}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="flex items-center gap-3">
                                    <FaCalendarAlt className="text-gray-400" />
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Date</p>
                                        <p className="text-sm font-bold text-gray-800">{new Date(booking.routeId?.departureDate).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <FaClock className="text-gray-400" />
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Departure</p>
                                        <p className="text-sm font-bold text-gray-800">{booking.routeId?.departureTime}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleCancelSubmit} className="space-y-8">
                            <div className="space-y-4">
                                <label className="block">
                                    <span className="text-sm font-black text-gray-900 uppercase tracking-widest ml-1">Reason for Cancellation</span>
                                    <textarea
                                        rows="4"
                                        className={`mt-2 block w-full bg-slate-50 border-2 rounded-[1.5rem] py-5 px-6 transition-all font-bold outline-none resize-none text-lg shadow-sm ${error ? 'border-red-500 focus:bg-white' : 'border-transparent focus:border-blue-500 focus:bg-white'
                                            }`}
                                        placeholder="Tell us why you need to cancel..."
                                        value={reason}
                                        onChange={(e) => {
                                            setReason(e.target.value);
                                            setError('');
                                        }}
                                        disabled={cancelling}
                                    ></textarea>
                                </label>
                                {error && (
                                    <p className="text-red-500 text-xs font-black uppercase tracking-widest ml-4 flex items-center">
                                        <FaExclamationTriangle className="mr-2" /> {error}
                                    </p>
                                )}
                            </div>

                            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-4">
                                <FaExclamationTriangle className="text-blue-500 mt-1 flex-shrink-0" />
                                <p className="text-xs text-blue-700 font-bold leading-relaxed">
                                    Note: Your request will be sent to our admin team for verification. Refund eligibility depends on our cancellation policy.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <button
                                    type="submit"
                                    disabled={cancelling}
                                    className={`flex-1 bg-red-600 text-white font-black py-5 px-8 rounded-[1.5rem] hover:bg-red-700 transition-all shadow-xl shadow-red-100 transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 text-lg uppercase tracking-widest`}
                                >
                                    {cancelling ? (
                                        <>
                                            <div className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <FaTrashAlt /> Confirm Request
                                        </>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigate('/my-bookings')}
                                    disabled={cancelling}
                                    className="sm:w-1/3 bg-gray-100 text-gray-600 font-black py-5 px-8 rounded-[1.5rem] hover:bg-gray-200 transition-all active:scale-95 text-lg uppercase tracking-widest"
                                >
                                    Keep It
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes loading {
                    from { width: 0%; }
                    to { width: 100%; }
                }
            `}} />
        </div>
    );
};

export default CancelBooking;
