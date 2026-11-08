const express = require('express');
const router = express.Router();
const Route = require('../models/Route');
const Bus = require('../models/Bus');
const Booking = require('../models/Booking');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// @route   GET /api/routes/search
// @desc    Search routes by source, destination, and date
// @access  Public
router.get('/search', async (req, res) => {
    try {
        const { source, destination, date } = req.query;

        if (!source || !destination || !date) {
            return res.status(400).json({
                success: false,
                message: 'Please provide source, destination, and date'
            });
        }

        // Parse the date and set to start of day
        const searchDate = new Date(date);
        searchDate.setHours(0, 0, 0, 0);

        const nextDay = new Date(searchDate);
        nextDay.setDate(nextDay.getDate() + 1);

        const routes = await Route.find({
            source: { $regex: new RegExp(source, 'i') },
            destination: { $regex: new RegExp(destination, 'i') },
            departureDate: {
                $gte: searchDate,
                $lt: nextDay
            },
            status: 'active'
        }).populate('busId').sort({ departureTime: 1 });

        res.json({
            success: true,
            count: routes.length,
            routes
        });
    } catch (error) {
        console.error('Search routes error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error searching routes'
        });
    }
});

// @route   GET /api/routes/bus/:busId
// @desc    Get all active routes for a specific bus (public)
// @access  Public
router.get('/bus/:busId', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const routes = await Route.find({
            busId: req.params.busId,
            status: 'active',
            departureDate: { $gte: today }
        }).populate('busId').sort({ departureDate: 1, departureTime: 1 });

        res.json({
            success: true,
            count: routes.length,
            routes
        });
    } catch (error) {
        console.error('Get bus routes error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching bus routes'
        });
    }
});

// @route   GET /api/routes/available-buses
// @desc    Get all unique buses that have at least one upcoming active route (public)
// @access  Public
router.get('/available-buses', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get all upcoming active routes, populated with bus data
        const routes = await Route.find({
            status: 'active',
            departureDate: { $gte: today }
        }).populate('busId').sort({ departureDate: 1, departureTime: 1 });

        // Build a map of unique buses (by busId), attaching their soonest route info
        const busMap = new Map();
        for (const route of routes) {
            if (!route.busId || route.busId.status !== 'active') continue;
            const busId = route.busId._id.toString();
            if (!busMap.has(busId)) {
                busMap.set(busId, {
                    bus: route.busId,
                    routeCount: 1,
                    nextRoute: {
                        source: route.source,
                        destination: route.destination,
                        departureDate: route.departureDate,
                        departureTime: route.departureTime,
                        price: route.price
                    }
                });
            } else {
                busMap.get(busId).routeCount += 1;
            }
        }

        const result = Array.from(busMap.values());

        res.json({
            success: true,
            count: result.length,
            buses: result
        });
    } catch (error) {
        console.error('Get available buses error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching available buses'
        });
    }
});


// @route   GET /api/routes/:id
// @desc    Get single route
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const route = await Route.findById(req.params.id).populate('busId');

        if (!route) {
            return res.status(404).json({
                success: false,
                message: 'Route not found'
            });
        }

        res.json({
            success: true,
            route
        });
    } catch (error) {
        console.error('Get route error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching route'
        });
    }
});

// @route   GET /api/routes/:id/seats
// @desc    Get available seats for a route
// @access  Public
router.get('/:id/seats', async (req, res) => {
    try {
        const route = await Route.findById(req.params.id).populate('busId');

        if (!route) {
            return res.status(404).json({
                success: false,
                message: 'Route not found'
            });
        }

        // Get all confirmed bookings for this route
        const bookings = await Booking.find({
            routeId: req.params.id,
            status: 'confirmed'
        });

        // Extract booked seat numbers
        const bookedSeats = bookings.reduce((acc, booking) => {
            return acc.concat(booking.seatNumbers);
        }, []);

        // Generate all seat numbers based on bus layout
        const totalSeats = route.busId.totalSeats;
        const allSeats = [];

        const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
        const seatsPerRow = route.busId.seatLayout === '2x2' ? 4 :
            route.busId.seatLayout === '2x3' ? 5 : 5;

        let seatCount = 0;
        for (let row of rows) {
            for (let i = 1; i <= seatsPerRow; i++) {
                if (seatCount >= totalSeats) break;
                allSeats.push(`${row}${i}`);
                seatCount++;
            }
            if (seatCount >= totalSeats) break;
        }

        // Calculate available seats
        const availableSeats = allSeats.filter(seat => !bookedSeats.includes(seat));

        res.json({
            success: true,
            totalSeats: allSeats.length,
            bookedSeats,
            availableSeats,
            availableCount: availableSeats.length
        });
    } catch (error) {
        console.error('Get seats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching seat availability'
        });
    }
});

// @route   GET /api/routes
// @desc    Get all routes (admin)
// @access  Private/Admin
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const routes = await Route.find().populate('busId').sort({ departureDate: -1 });

        res.json({
            success: true,
            count: routes.length,
            routes
        });
    } catch (error) {
        console.error('Get routes error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching routes'
        });
    }
});

// @route   POST /api/routes
// @desc    Add new route
// @access  Private/Admin
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { busId, source, destination, departureDate, departureTime, arrivalTime, price } = req.body;

        // Validation
        if (!busId || !source || !destination || !departureDate || !departureTime || !arrivalTime || !price) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Check if bus exists
        const bus = await Bus.findById(busId);
        if (!bus) {
            return res.status(404).json({
                success: false,
                message: 'Bus not found'
            });
        }

        const route = await Route.create({
            busId,
            source,
            destination,
            departureDate,
            departureTime,
            arrivalTime,
            price
        });

        const populatedRoute = await Route.findById(route._id).populate('busId');

        res.status(201).json({
            success: true,
            message: 'Route added successfully',
            route: populatedRoute
        });
    } catch (error) {
        console.error('Add route error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error adding route'
        });
    }
});

// @route   PUT /api/routes/:id
// @desc    Update route
// @access  Private/Admin
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        let route = await Route.findById(req.params.id);

        if (!route) {
            return res.status(404).json({
                success: false,
                message: 'Route not found'
            });
        }

        // If busId is being updated, verify it exists
        if (req.body.busId) {
            const bus = await Bus.findById(req.body.busId);
            if (!bus) {
                return res.status(404).json({
                    success: false,
                    message: 'Bus not found'
                });
            }
        }

        route = await Route.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('busId');

        res.json({
            success: true,
            message: 'Route updated successfully',
            route
        });
    } catch (error) {
        console.error('Update route error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error updating route'
        });
    }
});

// @route   DELETE /api/routes/:id
// @desc    Delete route
// @access  Private/Admin
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const route = await Route.findById(req.params.id);

        if (!route) {
            return res.status(404).json({
                success: false,
                message: 'Route not found'
            });
        }

        await Route.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Route deleted successfully'
        });
    } catch (error) {
        console.error('Delete route error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error deleting route'
        });
    }
});

module.exports = router;
