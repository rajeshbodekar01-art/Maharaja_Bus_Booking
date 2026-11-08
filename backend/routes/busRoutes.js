const express = require('express');
const router = express.Router();
const Bus = require('../models/Bus');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, 'bus-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error('Only image files (jpeg, jpg, png, webp) are allowed'));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// @route   GET /api/buses
// @desc    Get all buses
// @access  Public
router.get('/', async (req, res) => {
    try {
        const buses = await Bus.find().sort({ createdAt: -1 });

        res.json({
            success: true,
            count: buses.length,
            buses
        });
    } catch (error) {
        console.error('Get buses error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching buses'
        });
    }
});

// @route   GET /api/buses/:id
// @desc    Get single bus
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const bus = await Bus.findById(req.params.id);

        if (!bus) {
            return res.status(404).json({
                success: false,
                message: 'Bus not found'
            });
        }

        res.json({
            success: true,
            bus
        });
    } catch (error) {
        console.error('Get bus error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching bus'
        });
    }
});

// @route   POST /api/buses
// @desc    Add new bus (with optional image)
// @access  Private/Admin
router.post('/', authMiddleware, adminMiddleware, upload.single('image'), async (req, res) => {
    try {
        const { busNumber, busName, totalSeats, seatLayout, busType, category } = req.body;

        // Validation
        if (!busNumber || !busName || !totalSeats) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Check if bus number already exists
        const existingBus = await Bus.findOne({ busNumber });
        if (existingBus) {
            return res.status(400).json({
                success: false,
                message: 'Bus with this number already exists'
            });
        }

        // Build image URL if file was uploaded
        let imageUrl = '';
        if (req.file) {
            imageUrl = `/uploads/${req.file.filename}`;
        }

        const bus = await Bus.create({
            busNumber,
            busName,
            totalSeats,
            seatLayout: seatLayout || '2x2',
            busType: busType || 'AC',
            category: category || 'Seater',
            image: imageUrl
        });

        res.status(201).json({
            success: true,
            message: 'Bus added successfully',
            bus
        });
    } catch (error) {
        console.error('Add bus error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error adding bus'
        });
    }
});

// @route   PUT /api/buses/:id
// @desc    Update bus (with optional image)
// @access  Private/Admin
router.put('/:id', authMiddleware, adminMiddleware, upload.single('image'), async (req, res) => {
    try {
        const { busNumber, busName, totalSeats, seatLayout, status, busType, category } = req.body;

        let bus = await Bus.findById(req.params.id);

        if (!bus) {
            return res.status(404).json({
                success: false,
                message: 'Bus not found'
            });
        }

        // Check if new bus number already exists (if changing)
        if (busNumber && busNumber !== bus.busNumber) {
            const existingBus = await Bus.findOne({ busNumber });
            if (existingBus) {
                return res.status(400).json({
                    success: false,
                    message: 'Bus with this number already exists'
                });
            }
        }

        // Handle image update
        let imageUrl = bus.image; // keep existing image by default
        if (req.file) {
            // Delete old image if exists
            if (bus.image) {
                const oldImagePath = path.join(__dirname, '..', bus.image);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            imageUrl = `/uploads/${req.file.filename}`;
        }

        bus = await Bus.findByIdAndUpdate(
            req.params.id,
            { busNumber, busName, totalSeats, seatLayout, status, busType, category, image: imageUrl },
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: 'Bus updated successfully',
            bus
        });
    } catch (error) {
        console.error('Update bus error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error updating bus'
        });
    }
});

// @route   DELETE /api/buses/:id
// @desc    Delete bus
// @access  Private/Admin
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const bus = await Bus.findById(req.params.id);

        if (!bus) {
            return res.status(404).json({
                success: false,
                message: 'Bus not found'
            });
        }

        // Delete image file if exists
        if (bus.image) {
            const imagePath = path.join(__dirname, '..', bus.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await Bus.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Bus deleted successfully'
        });
    } catch (error) {
        console.error('Delete bus error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error deleting bus'
        });
    }
});

module.exports = router;
