const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required']
    },
    routeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Route',
        required: [true, 'Route is required']
    },
    seatNumbers: {
        type: [String],
        required: [true, 'At least one seat must be selected'],
        validate: {
            validator: function (v) {
                return v && v.length > 0;
            },
            message: 'At least one seat must be selected'
        }
    },
    passengerDetails: [{
        name: {
            type: String,
            required: true
        },
        age: {
            type: Number,
            required: true,
            min: 1
        },
        gender: {
            type: String,
            enum: ['male', 'female', 'other'],
            required: true
        }
    }],
    totalAmount: {
        type: Number,
        required: [true, 'Total amount is required'],
        min: [0, 'Total amount cannot be negative']
    },
    paymentMethod: {
        type: String,
        enum: ['digital', 'depot'],
        default: 'digital'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'refunded'],
        default: 'paid'
    },
    status: {
        type: String,
        enum: ['confirmed', 'cancelled', 'cancel_requested'],
        default: 'confirmed'
    },
    cancellationReason: {
        type: String,
        trim: true
    },
    bookingDate: {
        type: Date,
        default: Date.now
    },
    razorpayOrderId: {
        type: String,
        trim: true
    },
    razorpayPaymentId: {
        type: String,
        trim: true
    }
});

// Index for faster user booking queries
bookingSchema.index({ userId: 1, bookingDate: -1 });

module.exports = mongoose.model('Booking', bookingSchema);
