import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaRupeeSign, FaInfoCircle, FaClock, FaMapMarkerAlt, FaLock, FaExclamationTriangle } from 'react-icons/fa';
import api from '../utils/api';
import SeatLayout from '../components/SeatLayout';

// Load Razorpay script dynamically
const loadRazorpayScript = () =>
    new Promise((resolve) => {
        if (document.getElementById('razorpay-script')) {
            resolve(true);
            return;
        }
        const script = document.createElement('script');
        script.id = 'razorpay-script';
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });

const SeatSelection = () => {
    const { routeId } = useParams();
    const navigate = useNavigate();

    const [route, setRoute] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Seat state
    const [bookedSeats, setBookedSeats] = useState([]);
    const [selectedSeats, setSelectedSeats] = useState([]);

    // Passenger details
    const [passengers, setPassengers] = useState([]);

    // Payment method
    const [paymentMethod, setPaymentMethod] = useState('digital');

    // Processing state
    const [processing, setProcessing] = useState(false);
    const [paymentError, setPaymentError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const routeRes = await api.get(`/routes/${routeId}`);
                setRoute(routeRes.data.route);
                const seatRes = await api.get(`/routes/${routeId}/seats`);
                setBookedSeats(seatRes.data.bookedSeats);
            } catch (err) {
                setError('Failed to load route details');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [routeId]);

    const handleSeatSelect = (seatNumber) => {
        if (selectedSeats.includes(seatNumber)) {
            setSelectedSeats(selectedSeats.filter(s => s !== seatNumber));
            setPassengers(passengers.filter(p => p.seatNumber !== seatNumber));
        } else {
            if (selectedSeats.length >= 5) {
                alert('You can only book up to 5 seats at a time');
                return;
            }
            setSelectedSeats([...selectedSeats, seatNumber]);
            setPassengers([...passengers, { seatNumber, name: '', age: '', gender: 'male' }]);
        }
    };

    const handlePassengerChange = (index, field, value) => {
        const updated = [...passengers];
        updated[index] = { ...updated[index], [field]: value };
        setPassengers(updated);
    };

    const validatePassengers = () => {
        const isValid = passengers.every(p => p.name.trim() && p.age && p.gender);
        if (!isValid) {
            setError('Please fill in all passenger details');
            return false;
        }
        setError('');
        return true;
    };

    // ─── DIGITAL PAYMENT via Razorpay ───
    const handleRazorpayPayment = async () => {
        if (!validatePassengers()) return;
        setProcessing(true);
        setPaymentError('');

        try {
            // Load Razorpay SDK
            const loaded = await loadRazorpayScript();
            if (!loaded) {
                setPaymentError('Failed to load payment gateway. Please check your internet connection and try again.');
                setProcessing(false);
                return;
            }

            // Create Razorpay order on our backend
            const orderRes = await api.post('/payments/create-order', {
                routeId,
                seatNumbers: selectedSeats,
                passengerDetails: passengers.map(({ name, age, gender }) => ({
                    name,
                    age: parseInt(age),
                    gender
                })),
            });

            if (!orderRes.data.success) {
                setPaymentError(orderRes.data.message || 'Could not create payment order');
                setProcessing(false);
                return;
            }

            const { order, keyId } = orderRes.data;

            // Open Razorpay checkout popup
            const options = {
                key: keyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: 'BusBooking',
                description: `${route.source} → ${route.destination}`,
                order_id: order.id,
                handler: async (response) => {
                    // Payment successful — verify on backend and create booking
                    try {
                        const verifyRes = await api.post('/payments/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            routeId,
                            seatNumbers: selectedSeats,
                            passengerDetails: passengers.map(({ name, age, gender }) => ({
                                name,
                                age: parseInt(age),
                                gender
                            })),
                        });

                        if (verifyRes.data.success) {
                            navigate('/my-bookings');
                        } else {
                            setPaymentError(verifyRes.data.message || 'Payment verification failed');
                        }
                    } catch (err) {
                        setPaymentError(err.response?.data?.message || 'Payment verified but booking failed. Please contact support.');
                    } finally {
                        setProcessing(false);
                    }
                },
                prefill: {
                    name: passengers[0]?.name || '',
                },
                theme: {
                    color: '#2563eb',
                },
                modal: {
                    ondismiss: () => {
                        setProcessing(false);
                        setPaymentError('Payment was cancelled. Please try again.');
                    },
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', (response) => {
                setPaymentError(`Payment failed: ${response.error.description}`);
                setProcessing(false);
            });
            rzp.open();

        } catch (err) {
            setPaymentError(err.response?.data?.message || 'Something went wrong. Please try again.');
            setProcessing(false);
        }
    };

    // ─── DEPOT PAYMENT (unchanged) ───
    const handleDepotBooking = async () => {
        if (!validatePassengers()) return;
        setProcessing(true);
        setPaymentError('');
        try {
            const response = await api.post('/bookings', {
                routeId,
                seatNumbers: selectedSeats,
                passengerDetails: passengers.map(({ name, age, gender }) => ({
                    name,
                    age: parseInt(age),
                    gender
                })),
                paymentMethod: 'depot',
            });
            if (response.data.success) {
                navigate('/my-bookings');
            }
        } catch (err) {
            setPaymentError(err.response?.data?.message || 'Booking failed. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    const handleBookingSubmit = () => {
        if (paymentMethod === 'digital') {
            handleRazorpayPayment();
        } else {
            handleDepotBooking();
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mb-4"></div>
            <p className="text-gray-500 font-medium">Loading seat map...</p>
        </div>
    );

    if (!route) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Route Not Found</h2>
                <button onClick={() => navigate('/')} className="text-blue-600 hover:text-blue-800 font-medium">Go Home</button>
            </div>
        </div>
    );

    const totalAmount = selectedSeats.length * route.price;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-6 flex items-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-gray-500 hover:text-blue-600 transition-colors bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100"
                    >
                        <FaArrowLeft className="mr-2" /> Back
                    </button>
                    <h1 className="ml-4 text-2xl font-bold text-gray-900">Select Seats</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Seat Map */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-6 border-b border-gray-100">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">{route.busId?.busName}</h2>
                                    <div className="flex items-center text-sm text-gray-500 mt-1">
                                        <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-semibold mr-2">{route.busId?.seatLayout} Layout</span>
                                        <span>{route.busId?.busNumber}</span>
                                    </div>
                                </div>
                                <div className="mt-4 md:mt-0 text-right">
                                    <p className="text-sm text-gray-500">Price per seat</p>
                                    <p className="text-2xl font-bold text-gray-900 flex items-center justify-end">
                                        <FaRupeeSign className="text-lg" />{route.price}
                                    </p>
                                </div>
                            </div>

                            <SeatLayout
                                totalSeats={route.busId.totalSeats}
                                seatLayout={route.busId.seatLayout}
                                bookedSeats={bookedSeats}
                                selectedSeats={selectedSeats}
                                onSeatSelect={handleSeatSelect}
                            />
                        </div>
                    </div>

                    {/* Right: Summary & Checkout */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 sticky top-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Booking Summary</h3>

                            {/* Trip Info */}
                            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                <div className="flex items-start mb-3">
                                    <FaMapMarkerAlt className="text-blue-500 mt-1 mr-3 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">{route.source}</p>
                                        <p className="text-xs text-gray-400 my-1 ml-1 pl-2 border-l-2 border-dashed border-gray-300 h-4"></p>
                                        <p className="text-sm font-bold text-gray-900">{route.destination}</p>
                                    </div>
                                </div>
                                <div className="flex items-center text-sm text-gray-600 mt-2 pt-2 border-t border-gray-200">
                                    <FaClock className="mr-2 text-gray-400" />
                                    <span>{new Date(route.departureDate).toLocaleDateString()} • {route.departureTime}</span>
                                </div>
                            </div>

                            {selectedSeats.length > 0 ? (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-bold text-gray-900">Passenger Details</h4>
                                        <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-full">{selectedSeats.length} Seats</span>
                                    </div>

                                    {error && (
                                        <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded" role="alert">
                                            <p className="text-xs text-red-700 font-medium">{error}</p>
                                        </div>
                                    )}

                                    <div className="space-y-4 max-h-[280px] overflow-y-auto pr-1">
                                        {passengers.map((passenger, index) => (
                                            <div key={passenger.seatNumber} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                                                <div className="flex items-center mb-3">
                                                    <div className="bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-2">
                                                        {passenger.seatNumber}
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-700">Passenger {index + 1}</span>
                                                </div>
                                                <div className="space-y-3">
                                                    <input
                                                        type="text"
                                                        placeholder="Full Name"
                                                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm py-2 px-3 border"
                                                        value={passenger.name}
                                                        onChange={(e) => handlePassengerChange(index, 'name', e.target.value)}
                                                    />
                                                    <div className="flex gap-3">
                                                        <div className="w-1/3">
                                                            <input
                                                                type="number"
                                                                placeholder="Age"
                                                                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm py-2 px-3 border"
                                                                value={passenger.age}
                                                                onChange={(e) => handlePassengerChange(index, 'age', e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="w-2/3">
                                                            <select
                                                                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm py-2 px-3 border"
                                                                value={passenger.gender}
                                                                onChange={(e) => handlePassengerChange(index, 'gender', e.target.value)}
                                                            >
                                                                <option value="male">Male</option>
                                                                <option value="female">Female</option>
                                                                <option value="other">Other</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Payment Method */}
                                    <div className="border-t border-gray-100 pt-5 mt-4">
                                        <h4 className="font-bold text-gray-900 mb-3">Payment Method</h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setPaymentMethod('digital')}
                                                className={`py-3 px-4 rounded-xl border-2 transition-all flex flex-col items-center gap-1.5 ${paymentMethod === 'digital'
                                                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                                                    : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'
                                                    }`}
                                            >
                                                <FaLock className="text-sm" />
                                                <span className="font-bold text-sm">Pay Now</span>
                                                <span className="text-[10px] uppercase tracking-wider font-black opacity-60">Razorpay</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setPaymentMethod('depot')}
                                                className={`py-3 px-4 rounded-xl border-2 transition-all flex flex-col items-center gap-1.5 ${paymentMethod === 'depot'
                                                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                                                    : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'
                                                    }`}
                                            >
                                                <span className="font-bold text-sm">Pay at Depot</span>
                                                <span className="text-[10px] uppercase tracking-wider font-black opacity-60">Cash / QR</span>
                                            </button>
                                        </div>

                                        {paymentMethod === 'depot' && (
                                            <div className="mt-3 bg-orange-50 border border-orange-100 p-3 rounded-xl flex items-start gap-2">
                                                <FaInfoCircle className="text-orange-500 mt-0.5 flex-shrink-0 text-sm" />
                                                <p className="text-[11px] text-orange-700 font-medium leading-relaxed">
                                                    Booking confirmed immediately. Please reach the depot 30 minutes early to pay.
                                                </p>
                                            </div>
                                        )}

                                        {paymentMethod === 'digital' && (
                                            <div className="mt-3 bg-blue-50 border border-blue-100 p-3 rounded-xl flex items-start gap-2">
                                                <FaLock className="text-blue-400 mt-0.5 flex-shrink-0 text-sm" />
                                                <p className="text-[11px] text-blue-700 font-medium leading-relaxed">
                                                    Secure payment via Razorpay. Pay with UPI, card, or net banking.
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Price Breakdown */}
                                    <div className="border-t border-gray-100 pt-4 mt-2">
                                        <div className="flex justify-between items-center mb-2 text-sm text-gray-500">
                                            <span>Base Fare ({selectedSeats.length} × ₹{route.price})</span>
                                            <span>₹{totalAmount}</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-3 border-t border-dashed border-gray-200">
                                            <span className="font-bold text-gray-900">Total Amount</span>
                                            <span className="text-xl font-bold text-blue-600 flex items-center">
                                                <FaRupeeSign className="text-sm" />
                                                {totalAmount}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Payment error */}
                                    {paymentError && (
                                        <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                                            <FaExclamationTriangle className="text-red-500 mt-0.5 flex-shrink-0 text-sm" />
                                            <p className="text-xs text-red-700 font-medium">{paymentError}</p>
                                        </div>
                                    )}

                                    {/* Submit Button */}
                                    <button
                                        onClick={handleBookingSubmit}
                                        disabled={processing}
                                        className="w-full bg-blue-600 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-blue-700 shadow-lg transform hover:-translate-y-0.5 transition duration-200 mt-2 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                                    >
                                        {processing ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Processing...
                                            </>
                                        ) : paymentMethod === 'digital' ? (
                                            <><FaLock className="text-sm" /> Pay ₹{totalAmount} Securely</>
                                        ) : (
                                            'Confirm Booking'
                                        )}
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                    <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                        <FaInfoCircle className="text-gray-400 text-xl" />
                                    </div>
                                    <p className="text-gray-500 font-medium">Select seats to proceed</p>
                                    <p className="text-xs text-gray-400 mt-1">Click on available seats in the layout</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SeatSelection;
