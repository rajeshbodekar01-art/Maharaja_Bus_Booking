const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Route = require('../models/Route');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// @route   POST /api/bookings
// @desc    Create new booking
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { routeId, seatNumbers, passengerDetails, paymentMethod = 'digital' } = req.body;

        // Validation
        if (!routeId || !seatNumbers || !passengerDetails || seatNumbers.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Validate passenger details count matches seat count
        if (seatNumbers.length !== passengerDetails.length) {
            return res.status(400).json({
                success: false,
                message: 'Number of passengers must match number of seats'
            });
        }

        // Check if route exists
        const route = await Route.findById(routeId).populate('busId');
        if (!route) {
            return res.status(404).json({
                success: false,
                message: 'Route not found'
            });
        }

        // Check if seats are available
        const existingBookings = await Booking.find({
            routeId,
            status: 'confirmed'
        });

        const bookedSeats = existingBookings.reduce((acc, booking) => {
            return acc.concat(booking.seatNumbers);
        }, []);

        const unavailableSeats = seatNumbers.filter(seat => bookedSeats.includes(seat));

        if (unavailableSeats.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Seats ${unavailableSeats.join(', ')} are already booked`
            });
        }

        // Calculate total amount
        const totalAmount = route.price * seatNumbers.length;

        // Create booking
        const booking = await Booking.create({
            userId: req.user._id,
            routeId,
            seatNumbers,
            passengerDetails,
            totalAmount,
            paymentMethod,
            paymentStatus: paymentMethod === 'depot' ? 'pending' : 'paid'
        });

        const populatedBooking = await Booking.findById(booking._id)
            .populate('userId', 'name email')
            .populate({
                path: 'routeId',
                populate: { path: 'busId' }
            });

        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            booking: populatedBooking
        });
    } catch (error) {
        console.error('Create booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error creating booking'
        });
    }
});

// @route   GET /api/bookings/user
// @desc    Get user's booking history
// @access  Private
router.get('/user', authMiddleware, async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.user._id })
            .populate({
                path: 'routeId',
                populate: { path: 'busId' }
            })
            .sort({ bookingDate: -1 });

        res.json({
            success: true,
            count: bookings.length,
            bookings
        });
    } catch (error) {
        console.error('Get user bookings error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching bookings'
        });
    }
});

// @route   GET /api/bookings/:id
// @desc    Get booking details (for e-ticket)
// @access  Private
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('userId', 'name email')
            .populate({
                path: 'routeId',
                populate: { path: 'busId' }
            });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check if user owns this booking or is admin
        if (booking.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        res.json({
            success: true,
            booking
        });
    } catch (error) {
        console.error('Get booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching booking'
        });
    }
});

// @route   PUT /api/bookings/:id/cancel
// @desc    Cancel booking
// @access  Private
router.put('/:id/cancel', authMiddleware, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check if user owns this booking
        if (booking.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Check if already cancelled
        if (booking.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: 'Booking is already cancelled'
            });
        }

        // Check if cancellation already requested
        if (booking.status === 'cancel_requested') {
            return res.status(400).json({
                success: false,
                message: 'Cancellation already requested'
            });
        }

        const { reason } = req.body;
        if (!reason) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a reason for cancellation'
            });
        }

        booking.status = 'cancel_requested';
        booking.cancellationReason = reason;
        await booking.save();

        const populatedBooking = await Booking.findById(booking._id)
            .populate('userId', 'name email')
            .populate({
                path: 'routeId',
                populate: { path: 'busId' }
            });

        res.json({
            success: true,
            message: 'Booking cancelled successfully',
            booking: populatedBooking
        });
    } catch (error) {
        console.error('Cancel booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error cancelling booking'
        });
    }
});

// @route   GET /api/bookings
// @desc    Get all bookings (admin)
// @access  Private/Admin
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('userId', 'name email')
            .populate({
                path: 'routeId',
                populate: { path: 'busId' }
            })
            .sort({ bookingDate: -1 });

        res.json({
            success: true,
            count: bookings.length,
            bookings
        });
    } catch (error) {
        console.error('Get all bookings error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching bookings'
        });
    }
});

// @route   PUT /api/bookings/:id/payment-status
// @desc    Update booking payment status (admin)
// @access  Private/Admin
router.put('/:id/payment-status', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { paymentStatus } = req.body;

        if (!['pending', 'paid', 'refunded'].includes(paymentStatus)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment status'
            });
        }

        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        booking.paymentStatus = paymentStatus;
        await booking.save();

        const populatedBooking = await Booking.findById(booking._id)
            .populate('userId', 'name email')
            .populate({
                path: 'routeId',
                populate: { path: 'busId' }
            });

        res.json({
            success: true,
            message: 'Payment status updated successfully',
            booking: populatedBooking
        });
    } catch (error) {
        console.error('Update payment status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error updating payment status'
        });
    }
});

// @route   PUT /api/bookings/:id/approve-cancel
// @desc    Approve booking cancellation (admin)
// @access  Private/Admin
router.put('/:id/approve-cancel', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        if (booking.status !== 'cancel_requested') {
            return res.status(400).json({
                success: false,
                message: 'No cancellation request found for this booking'
            });
        }

        booking.status = 'cancelled';
        await booking.save();

        const populatedBooking = await Booking.findById(booking._id)
            .populate('userId', 'name email')
            .populate({
                path: 'routeId',
                populate: { path: 'busId' }
            });

        res.json({
            success: true,
            message: 'Booking cancellation approved successfully',
            booking: populatedBooking
        });
    } catch (error) {
        console.error('Approve cancel error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error approving cancellation'
        });
    }
});

// @route   PUT /api/bookings/:id/reject-cancel
// @desc    Reject booking cancellation request (admin) - revert to confirmed
// @access  Private/Admin
router.put('/:id/reject-cancel', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        if (booking.status !== 'cancel_requested') {
            return res.status(400).json({
                success: false,
                message: 'No cancellation request found for this booking'
            });
        }

        booking.status = 'confirmed';
        booking.cancellationReason = undefined;
        await booking.save();

        const populatedBooking = await Booking.findById(booking._id)
            .populate('userId', 'name email')
            .populate({
                path: 'routeId',
                populate: { path: 'busId' }
            });

        res.json({
            success: true,
            message: 'Booking cancellation rejected. Booking is now confirmed.',
            booking: populatedBooking
        });
    } catch (error) {
        console.error('Reject cancel error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error rejecting cancellation'
        });
    }
});

module.exports = router;
