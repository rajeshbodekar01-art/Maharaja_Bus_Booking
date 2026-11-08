const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Booking = require('../models/Booking');
const Route = require('../models/Route');
const authMiddleware = require('../middleware/authMiddleware');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @route  POST /api/payments/create-order
// @desc   Create a Razorpay order before payment
// @access Private
router.post('/create-order', authMiddleware, async (req, res) => {
    try {
        const { routeId, seatNumbers, passengerDetails } = req.body;

        if (!routeId || !seatNumbers || !passengerDetails || seatNumbers.length === 0) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        if (seatNumbers.length !== passengerDetails.length) {
            return res.status(400).json({ success: false, message: 'Passengers must match seats' });
        }

        // Verify route exists
        const route = await Route.findById(routeId).populate('busId');
        if (!route) {
            return res.status(404).json({ success: false, message: 'Route not found' });
        }

        // Check seat availability
        const existingBookings = await Booking.find({ routeId, status: 'confirmed' });
        const bookedSeats = existingBookings.reduce((acc, b) => acc.concat(b.seatNumbers), []);
        const unavailable = seatNumbers.filter(s => bookedSeats.includes(s));
        if (unavailable.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Seats ${unavailable.join(', ')} are already booked`
            });
        }

        const totalAmount = route.price * seatNumbers.length;

        // Create Razorpay order (amount in paise)
        const order = await razorpay.orders.create({
            amount: totalAmount * 100,
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
            notes: {
                routeId: routeId.toString(),
                userId: req.user._id.toString(),
                seatNumbers: seatNumbers.join(','),
            }
        });

        res.json({
            success: true,
            order,
            totalAmount,
            keyId: process.env.RAZORPAY_KEY_ID,
        });
    } catch (error) {
        console.error('Create Razorpay order error:', error);
        res.status(500).json({ success: false, message: 'Failed to create payment order' });
    }
});

// @route  POST /api/payments/verify
// @desc   Verify Razorpay payment signature and create booking
// @access Private
router.post('/verify', authMiddleware, async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            routeId,
            seatNumbers,
            passengerDetails,
        } = req.body;

        // Validate signature
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: 'Payment verification failed. Invalid signature.' });
        }

        // Verify route
        const route = await Route.findById(routeId).populate('busId');
        if (!route) {
            return res.status(404).json({ success: false, message: 'Route not found' });
        }

        // Final seat availability check (race condition safety)
        const existingBookings = await Booking.find({ routeId, status: 'confirmed' });
        const bookedSeats = existingBookings.reduce((acc, b) => acc.concat(b.seatNumbers), []);
        const unavailable = seatNumbers.filter(s => bookedSeats.includes(s));
        if (unavailable.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Seats ${unavailable.join(', ')} were just booked by someone else. Please contact support for a refund.`
            });
        }

        const totalAmount = route.price * seatNumbers.length;

        // Create confirmed booking
        const booking = await Booking.create({
            userId: req.user._id,
            routeId,
            seatNumbers,
            passengerDetails,
            totalAmount,
            paymentMethod: 'digital',
            paymentStatus: 'paid',
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
        });

        const populatedBooking = await Booking.findById(booking._id)
            .populate('userId', 'name email')
            .populate({ path: 'routeId', populate: { path: 'busId' } });

        res.status(201).json({
            success: true,
            message: 'Payment verified and booking confirmed!',
            booking: populatedBooking,
        });
    } catch (error) {
        console.error('Verify payment error:', error);
        res.status(500).json({ success: false, message: 'Server error during payment verification' });
    }
});

module.exports = router;
