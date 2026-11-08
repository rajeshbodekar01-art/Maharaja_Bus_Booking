const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
    busNumber: {
        type: String,
        required: [true, 'Bus number is required'],
        unique: true,
        trim: true
    },
    busName: {
        type: String,
        required: [true, 'Bus name is required'],
        trim: true
    },
    totalSeats: {
        type: Number,
        required: [true, 'Total seats is required'],
        min: [1, 'Total seats must be at least 1']
    },
    seatLayout: {
        type: String,
        enum: ['2x2', '2x3', '3x2', '2x1', '4x4'],
        default: '2x2'
    },
    busType: {
        type: String,
        enum: ['AC', 'Non-AC'],
        default: 'AC'
    },
    category: {
        type: String,
        enum: ['Sleeper', 'Seater', 'Semi-Sleeper'],
        default: 'Seater'
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    image: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Bus', busSchema);
