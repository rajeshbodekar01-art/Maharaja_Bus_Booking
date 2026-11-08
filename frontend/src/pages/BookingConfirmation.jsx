import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaCheckCircle, FaBus, FaTicketAlt, FaHome, FaCalendarAlt, FaClock, FaMapMarkerAlt } from 'react-icons/fa';
import api from '../utils/api';

const BookingConfirmation = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        if (!loading && booking) {
            const timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        navigate('/my-bookings');
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [loading, booking, navigate]);

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

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mb-4"></div>
            <p className="text-gray-500 font-medium">Confirming your booking...</p>
        </div>
    );

    if (!booking) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Booking Not Found</h2>
                <button onClick={() => navigate('/')} className="text-blue-600 hover:text-blue-800 font-bold">Return Home</button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
                    {/* Header with Success Icon */}
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-12 text-center text-white">
                        <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-white bg-opacity-20 mb-6 backdrop-blur-sm">
                            <FaCheckCircle className="text-5xl text-white" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-extrabold mb-2">Booking Confirmed!</h1>
                        <p className="text-green-50 text-lg">Your ticket has been booked successfully.</p>
                        <p className="mt-4 text-green-100 text-sm font-medium">
                            Redirecting to <span className="font-bold underline">My Bookings</span> in {countdown} seconds...
                        </p>
                    </div>

                    <div className="p-8 md:p-12">
                        {/* Booking Summary Card */}
                        <div className="bg-gray-50 rounded-2xl p-6 md:p-8 mb-8 border border-gray-100">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 pb-8 border-b border-gray-200">
                                <div>
                                    <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">From</p>
                                    <h3 className="text-2xl font-black text-gray-900">{booking.routeId.source}</h3>
                                    <div className="flex items-center text-gray-500 mt-1 font-medium">
                                        <FaClock className="mr-2 text-blue-400" />
                                        {booking.routeId.departureTime}
                                    </div>
                                </div>

                                <div className="hidden md:flex flex-1 flex-col items-center px-10">
                                    <div className="w-full flex items-center mb-1">
                                        <div className="h-0.5 bg-gray-300 flex-1 border-t-2 border-dashed"></div>
                                        <FaBus className="mx-4 text-blue-500 text-xl" />
                                        <div className="h-0.5 bg-gray-300 flex-1 border-t-2 border-dashed"></div>
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Confirmed Route</span>
                                </div>

                                <div className="md:text-right">
                                    <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">To</p>
                                    <h3 className="text-2xl font-black text-gray-900">{booking.routeId.destination}</h3>
                                    <div className="flex items-center md:justify-end text-gray-500 mt-1 font-medium">
                                        <FaClock className="mr-2 text-blue-400" />
                                        {booking.routeId.arrivalTime}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Bus Name</p>
                                    <p className="font-bold text-gray-900 truncate">{booking.routeId.busId.busName}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Bus Number</p>
                                    <p className="font-bold text-gray-900">{booking.routeId.busId.busNumber}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Date</p>
                                    <p className="font-bold text-gray-900">{new Date(booking.routeId.departureDate).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Booking ID</p>
                                    <p className="font-bold text-blue-600 font-mono">#{booking._id.slice(-6).toUpperCase()}</p>
                                </div>
                            </div>
                        </div>

                        {/* Passenger Details */}
                        <div className="mb-10">
                            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4 flex items-center">
                                <FaTicketAlt className="mr-2 text-blue-500" /> Passengers & Seats
                            </h4>
                            <div className="flex flex-wrap gap-3">
                                {booking.passengerDetails.map((passenger, idx) => (
                                    <div key={idx} className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm flex items-center gap-3">
                                        <div className="bg-blue-100 text-blue-600 h-8 w-8 rounded-full flex items-center justify-center font-black text-xs">
                                            {booking.seatNumbers[idx]}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 leading-tight">{passenger.name}</p>
                                            <p className="text-[10px] text-gray-500 uppercase tracking-tighter">Seat Reserved</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="text-center md:text-left">
                                <p className="text-sm text-gray-500 font-medium">Total Amount Paid</p>
                                <p className="text-3xl font-black text-green-600 flex items-center justify-center md:justify-start">
                                    <FaRupeeSign className="text-xl mr-1" />
                                    {booking.totalAmount}
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                                <Link
                                    to="/my-bookings"
                                    className="flex items-center justify-center px-6 py-3 border border-gray-200 text-base font-bold rounded-xl text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                                >
                                    <FaTicketAlt className="mr-2" /> My Bookings
                                </Link>
                                <button
                                    onClick={() => navigate(`/ticket/${booking._id}`)}
                                    className="flex items-center justify-center px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg transform hover:-translate-y-1"
                                >
                                    <FaTicketAlt className="mr-2" /> View E-Ticket
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 px-8 py-6 text-center border-t border-gray-100">
                        <p className="text-xs text-gray-400 font-medium">
                            A confirmation email has been sent to your registered email address. Please present the E-Ticket at the time of boarding.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingConfirmation;

