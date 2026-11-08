import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    FaPrint, FaArrowLeft, FaBus, FaClock, FaMapMarkerAlt,
    FaRupeeSign, FaTicketAlt, FaInfoCircle, FaExclamationTriangle,
    FaTimesCircle, FaCheckCircle, FaUser
} from 'react-icons/fa';
import api from '../utils/api';

const Ticket = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const ticketRef = useRef(null);

    useEffect(() => {
        const fetchBooking = async () => {
            try {
                const response = await api.get(`/bookings/${bookingId}`);
                setBooking(response.data.booking);
            } catch (error) {
                console.error('Error fetching booking:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchBooking();
    }, [bookingId]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mb-4"></div>
            <p className="text-gray-500 font-medium">Generating your ticket...</p>
        </div>
    );

    if (!booking) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Ticket Not Found</h2>
                <button onClick={() => navigate('/')} className="text-blue-600 hover:text-blue-800 font-bold">
                    Return Home
                </button>
            </div>
        </div>
    );

    const isCancelled = booking.status === 'cancelled';
    const isCancelRequested = booking.status === 'cancel_requested';

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
            {/* Print-only CSS */}
            <style>{`
                @media print {
                    @page {
                        margin: 10mm;
                        size: A4;
                    }
                    html, body {
                        background: white !important;
                    }
                    nav, footer, .no-print {
                        display: none !important;
                    }
                    .ticket-wrapper {
                        padding: 0 !important;
                        max-width: 100% !important;
                    }
                    .ticket-container {
                        box-shadow: none !important;
                        border: 1px solid #e5e7eb !important;
                        border-radius: 12px !important;
                        margin: 0 !important;
                        max-width: 100% !important;
                    }
                    .bg-blue-700 {
                        background-color: #1d4ed8 !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .bg-gray-50, .bg-blue-50, .bg-orange-50, .bg-red-50, .bg-green-50, .bg-gray-900 {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                }
            `}</style>

            <div className="max-w-4xl mx-auto ticket-wrapper">

                {/* Action Bar — hidden on print */}
                <div className="flex justify-between items-center mb-8 no-print">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-gray-600 hover:text-blue-600 font-bold transition-colors bg-white px-4 py-2.5 rounded-xl shadow-sm border border-gray-100 gap-2"
                    >
                        <FaArrowLeft /> Back
                    </button>
                    <button
                        onClick={handlePrint}
                        className="flex items-center bg-blue-600 text-white px-7 py-2.5 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all transform hover:-translate-y-0.5 gap-2"
                    >
                        <FaPrint /> Print Ticket
                    </button>
                </div>

                {/* Status Banner (cancelled / cancel_requested) — hidden on print for cancelled */}
                {(isCancelled || isCancelRequested) && (
                    <div className={`mb-5 rounded-2xl px-6 py-4 flex items-start gap-4 no-print ${isCancelled
                            ? 'bg-red-50 border border-red-200'
                            : 'bg-amber-50 border border-amber-200'
                        }`}>
                        {isCancelled ? (
                            <FaTimesCircle className="text-red-500 text-xl flex-shrink-0 mt-0.5" />
                        ) : (
                            <FaExclamationTriangle className="text-amber-500 text-xl flex-shrink-0 mt-0.5" />
                        )}
                        <div>
                            <p className={`font-black text-sm uppercase tracking-wider ${isCancelled ? 'text-red-700' : 'text-amber-700'}`}>
                                {isCancelled ? 'This Booking Has Been Cancelled' : 'Cancellation Pending Admin Approval'}
                            </p>
                            {booking.cancellationReason && (
                                <p className={`text-xs mt-1 font-medium ${isCancelled ? 'text-red-600' : 'text-amber-600'}`}>
                                    Reason: {booking.cancellationReason}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Ticket Card */}
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 ticket-container" ref={ticketRef}>

                    {/* Header */}
                    <div className="bg-blue-700 px-8 py-10 text-white relative">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <FaBus className="text-9xl transform -rotate-12" />
                        </div>
                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="text-center md:text-left">
                                <h1 className="text-3xl font-black tracking-tight mb-1">BusBooking</h1>
                                <p className="text-blue-200 text-sm font-medium uppercase tracking-widest">Official E-Ticket</p>
                            </div>
                            <div className="text-center md:text-right bg-white rounded-2xl p-4 shadow-inner min-w-[200px]">
                                <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Booking ID</p>
                                <p className="text-2xl font-mono font-black text-gray-900">#{booking._id.slice(-6).toUpperCase()}</p>
                                <span className={`mt-2 inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${booking.status === 'confirmed'
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : booking.status === 'cancel_requested'
                                            ? 'bg-amber-100 text-amber-700'
                                            : 'bg-red-100 text-red-700'
                                    }`}>
                                    {booking.status === 'cancel_requested' ? 'Cancel Requested' : booking.status}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 md:p-12">

                        {/* Bus & Booking Info */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 pb-8 border-b border-gray-100">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                                    <FaBus className="text-2xl" />
                                </div>
                                <div>
                                    <h5 className="text-xl font-black text-gray-900 leading-tight">{booking.routeId.busId.busName}</h5>
                                    <p className="text-sm text-gray-500 font-medium">{booking.routeId.busId.busNumber}</p>
                                    <span className="mt-2 inline-block px-3 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-full uppercase tracking-wider">
                                        {booking.routeId.busId.seatLayout} Layout
                                    </span>
                                </div>
                            </div>
                            <div className="text-left md:text-right">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Booked On</p>
                                <p className="text-sm font-bold text-gray-700">
                                    {new Date(booking.bookingDate).toLocaleDateString(undefined, { dateStyle: 'long' })}
                                </p>
                            </div>
                        </div>

                        {/* Journey Details */}
                        <div className="bg-gray-50 rounded-3xl p-8 mb-10 border border-gray-100 relative overflow-hidden">
                            <div className="relative z-10 flex flex-col md:flex-row items-center gap-10 md:gap-4">
                                <div className="flex-1 text-center md:text-left">
                                    <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-2">FROM</p>
                                    <h4 className="text-2xl font-black text-gray-900 mb-2">{booking.routeId.source}</h4>
                                    <div className="flex items-center justify-center md:justify-start text-blue-600 font-black text-xl">
                                        <FaClock className="mr-2 text-blue-400" />
                                        {booking.routeId.departureTime}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1 font-medium">
                                        {new Date(booking.routeId.departureDate).toLocaleDateString(undefined, { dateStyle: 'full' })}
                                    </p>
                                </div>

                                <div className="flex flex-col items-center justify-center">
                                    <div className="w-12 h-12 bg-white rounded-full shadow-sm border border-gray-200 flex items-center justify-center text-blue-500 mb-2">
                                        <FaMapMarkerAlt />
                                    </div>
                                    <div className="h-20 w-px border-l-2 border-dashed border-gray-300 hidden md:block"></div>
                                </div>

                                <div className="flex-1 text-center md:text-right">
                                    <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-2">TO</p>
                                    <h4 className="text-2xl font-black text-gray-900 mb-2">{booking.routeId.destination}</h4>
                                    <div className="flex items-center justify-center md:justify-end text-blue-600 font-black text-xl">
                                        <FaClock className="mr-2 text-blue-400" />
                                        {booking.routeId.arrivalTime}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1 font-medium">
                                        {new Date(booking.routeId.departureDate).toLocaleDateString(undefined, { dateStyle: 'full' })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Passenger Details */}
                        <div className="mb-10">
                            <h5 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                                <FaUser className="text-blue-400" /> Passenger Details
                            </h5>
                            <div className="overflow-x-auto rounded-2xl border border-gray-100">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            <th className="px-5 py-4">Seat</th>
                                            <th className="px-5 py-4">Name</th>
                                            <th className="px-5 py-4">Age</th>
                                            <th className="px-5 py-4">Gender</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {booking.passengerDetails.map((passenger, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-5 py-4">
                                                    <span className="bg-blue-600 text-white w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black shadow-sm">
                                                        {booking.seatNumbers[idx]}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 font-bold text-gray-900">{passenger.name}</td>
                                                <td className="px-5 py-4 text-gray-600 font-medium">{passenger.age}</td>
                                                <td className="px-5 py-4">
                                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide capitalize">{passenger.gender}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Payment Info */}
                        <div className={`rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between border ${booking.paymentStatus === 'paid'
                                ? 'bg-blue-50 border-blue-100'
                                : booking.paymentStatus === 'pending'
                                    ? 'bg-orange-50 border-orange-100'
                                    : 'bg-red-50 border-red-100'
                            }`}>
                            <div className="flex items-center gap-4 mb-4 md:mb-0">
                                <div className={`h-12 w-12 bg-white rounded-full flex items-center justify-center shadow-sm border ${booking.paymentStatus === 'paid'
                                        ? 'text-green-500 border-green-100'
                                        : booking.paymentStatus === 'pending'
                                            ? 'text-orange-500 border-orange-100'
                                            : 'text-red-500 border-red-100'
                                    }`}>
                                    <FaTicketAlt />
                                </div>
                                <div>
                                    <p className={`text-[10px] font-bold uppercase tracking-widest ${booking.paymentStatus === 'paid' ? 'text-blue-500'
                                            : booking.paymentStatus === 'pending' ? 'text-orange-500' : 'text-red-500'
                                        }`}>{booking.paymentMethod === 'depot' ? 'Depot Payment' : 'Digital Payment'}</p>
                                    <p className={`text-lg font-black uppercase ${booking.paymentStatus === 'paid' ? 'text-green-600'
                                            : booking.paymentStatus === 'pending' ? 'text-orange-600' : 'text-red-600'
                                        }`}>
                                        {booking.paymentStatus === 'paid' ? 'Paid Successfully'
                                            : booking.paymentStatus === 'pending' ? 'Payment Pending' : 'Refunded'}
                                    </p>
                                </div>
                            </div>
                            <div className="text-center md:text-right">
                                <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${booking.paymentStatus === 'paid' ? 'text-blue-500' : 'text-gray-400'}`}>
                                    Total Amount
                                </p>
                                <p className={`text-3xl font-black flex items-center justify-center md:justify-end leading-none ${booking.paymentStatus === 'paid' ? 'text-blue-700' : 'text-gray-900'}`}>
                                    <FaRupeeSign className="text-xl mr-1 opacity-50" />
                                    {booking.totalAmount}
                                </p>
                            </div>
                        </div>

                        {/* Depot payment notice */}
                        {booking.paymentMethod === 'depot' && booking.paymentStatus === 'pending' && (
                            <div className="mt-6 bg-orange-50 border border-orange-100 p-6 rounded-2xl flex items-start gap-4">
                                <div className="p-3 bg-white rounded-xl text-orange-500 shadow-sm border border-orange-100">
                                    <FaInfoCircle className="text-xl" />
                                </div>
                                <div>
                                    <h6 className="font-bold text-orange-900 text-sm mb-1 uppercase tracking-tight">Depot Payment Required</h6>
                                    <p className="text-orange-800 text-xs leading-relaxed font-medium">
                                        Please arrive at the depot at least 30 minutes before departure to complete payment and collect your physical ticket.
                                        Reference Booking ID <span className="font-black">#{booking._id.slice(-6).toUpperCase()}</span>.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-900 p-8 text-center text-white">
                        <div className="flex items-center justify-center gap-2 mb-3 text-blue-400">
                            <FaInfoCircle />
                            <p className="text-xs font-bold uppercase tracking-widest">Important Information</p>
                        </div>
                        <p className="text-sm text-gray-400 mb-2">Please carry a valid photo ID along with this e-ticket during your journey.</p>
                        <p className="text-[10px] text-gray-500 font-medium">For assistance, contact our support at support@busbooking.com or +91 98765 43210</p>
                    </div>
                </div>

                {/* Print button at bottom (desktop) — hidden on print */}
                <div className="mt-6 flex justify-center no-print">
                    <button
                        onClick={handlePrint}
                        className="flex items-center bg-blue-600 text-white px-10 py-3.5 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all transform hover:-translate-y-0.5 gap-2 text-base"
                    >
                        <FaPrint /> Print / Download Ticket
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Ticket;
