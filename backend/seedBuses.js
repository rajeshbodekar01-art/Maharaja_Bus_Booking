require('dotenv').config();
const mongoose = require('mongoose');
const Bus = require('./models/Bus');
const Route = require('./models/Route');

const MONGODB_URI = process.env.MONGODB_URI;

// ── Helper ────────────────────────────────────────────────────────────────────
const addDays = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    d.setHours(0, 0, 0, 0);
    return d;
};

// ── 15 Buses ──────────────────────────────────────────────────────────────────
const buses = [
    { busNumber: 'KA-01-F-1001', busName: 'Kaveri Express', totalSeats: 40, seatLayout: '2x2', busType: 'AC', category: 'Seater' },
    { busNumber: 'MH-12-AB-2002', busName: 'Deccan Queen', totalSeats: 36, seatLayout: '2x2', busType: 'AC', category: 'Sleeper' },
    { busNumber: 'TN-09-CD-3003', busName: 'Coromandel Travels', totalSeats: 45, seatLayout: '2x3', busType: 'Non-AC', category: 'Seater' },
    { busNumber: 'AP-28-EF-4004', busName: 'Godavari Liner', totalSeats: 40, seatLayout: '2x2', busType: 'AC', category: 'Semi-Sleeper' },
    { busNumber: 'RJ-14-GH-5005', busName: 'Rajputana Travels', totalSeats: 50, seatLayout: '2x3', busType: 'Non-AC', category: 'Seater' },
    { busNumber: 'DL-01-IJ-6006', busName: 'Capital Cruiser', totalSeats: 40, seatLayout: '2x2', busType: 'AC', category: 'Sleeper' },
    { busNumber: 'GJ-05-KL-7007', busName: 'Saurashtra Express', totalSeats: 36, seatLayout: '2x2', busType: 'AC', category: 'Seater' },
    { busNumber: 'UP-32-MN-8008', busName: 'Ganga Travels', totalSeats: 54, seatLayout: '3x2', busType: 'Non-AC', category: 'Seater' },
    { busNumber: 'MP-09-OP-9009', busName: 'Narmada Express', totalSeats: 40, seatLayout: '2x2', busType: 'AC', category: 'Semi-Sleeper' },
    { busNumber: 'WB-20-QR-1010', busName: 'Hooghly Liner', totalSeats: 36, seatLayout: '2x2', busType: 'AC', category: 'Sleeper' },
    { busNumber: 'KL-07-ST-1111', busName: 'Malabar Coast', totalSeats: 40, seatLayout: '2x2', busType: 'AC', category: 'Seater' },
    { busNumber: 'OR-02-UV-1212', busName: 'Odisha Deluxe', totalSeats: 45, seatLayout: '2x3', busType: 'Non-AC', category: 'Seater' },
    { busNumber: 'HR-26-WX-1313', busName: 'Haryana Roadways', totalSeats: 50, seatLayout: '2x3', busType: 'Non-AC', category: 'Seater' },
    { busNumber: 'PB-10-YZ-1414', busName: 'Punjab Premier', totalSeats: 40, seatLayout: '2x2', busType: 'AC', category: 'Semi-Sleeper' },
    { busNumber: 'TS-09-AA-1515', busName: 'Telangana Express', totalSeats: 36, seatLayout: '2x2', busType: 'AC', category: 'Sleeper' },
];

// ── 2 routes per bus (30 total) ───────────────────────────────────────────────
// Each entry: [source, destination, depTime, arrTime, price, daysFromNow]
const routeTemplates = [
    // Bus 0 – Kaveri Express
    [['Bengaluru', 'Mysuru', '06:00', '09:00', 350, 1],
    ['Mysuru', 'Bengaluru', '18:00', '21:00', 350, 2]],
    // Bus 1 – Deccan Queen
    [['Pune', 'Mumbai', '07:30', '11:00', 550, 1],
    ['Mumbai', 'Pune', '20:00', '23:30', 550, 3]],
    // Bus 2 – Coromandel Travels
    [['Chennai', 'Coimbatore', '22:00', '06:00', 480, 1],
    ['Coimbatore', 'Chennai', '21:00', '05:00', 480, 2]],
    // Bus 3 – Godavari Liner
    [['Hyderabad', 'Vijayawada', '08:00', '13:00', 420, 1],
    ['Vijayawada', 'Hyderabad', '16:00', '21:00', 420, 4]],
    // Bus 4 – Rajputana Travels
    [['Jaipur', 'Jodhpur', '07:00', '12:00', 380, 1],
    ['Jodhpur', 'Jaipur', '15:00', '20:00', 380, 2]],
    // Bus 5 – Capital Cruiser
    [['Delhi', 'Agra', '06:30', '10:00', 450, 1],
    ['Agra', 'Delhi', '17:00', '20:30', 450, 3]],
    // Bus 6 – Saurashtra Express
    [['Ahmedabad', 'Rajkot', '09:00', '13:00', 320, 2],
    ['Rajkot', 'Ahmedabad', '14:00', '18:00', 320, 5]],
    // Bus 7 – Ganga Travels
    [['Lucknow', 'Varanasi', '05:30', '11:00', 290, 1],
    ['Varanasi', 'Lucknow', '16:00', '21:30', 290, 2]],
    // Bus 8 – Narmada Express
    [['Bhopal', 'Indore', '08:00', '11:30', 260, 1],
    ['Indore', 'Bhopal', '15:00', '18:30', 260, 3]],
    // Bus 9 – Hooghly Liner
    [['Kolkata', 'Bhubaneswar', '21:00', '06:00', 600, 1],
    ['Bhubaneswar', 'Kolkata', '20:00', '05:00', 600, 4]],
    // Bus 10 – Malabar Coast
    [['Kochi', 'Thiruvananthapuram', '07:00', '11:00', 310, 2],
    ['Thiruvananthapuram', 'Kochi', '16:00', '20:00', 310, 5]],
    // Bus 11 – Odisha Deluxe
    [['Bhubaneswar', 'Puri', '06:00', '08:00', 180, 1],
    ['Puri', 'Bhubaneswar', '17:00', '19:00', 180, 2]],
    // Bus 12 – Haryana Roadways
    [['Chandigarh', 'Delhi', '06:00', '10:00', 350, 1],
    ['Delhi', 'Chandigarh', '18:00', '22:00', 350, 3]],
    // Bus 13 – Punjab Premier
    [['Amritsar', 'Ludhiana', '07:00', '09:30', 220, 2],
    ['Ludhiana', 'Amritsar', '15:00', '17:30', 220, 4]],
    // Bus 14 – Telangana Express
    [['Hyderabad', 'Warangal', '08:30', '11:00', 240, 1],
    ['Warangal', 'Hyderabad', '16:00', '18:30', 240, 3]],
];

// ── Main ──────────────────────────────────────────────────────────────────────
async function seed() {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Remove existing seeded buses (by bus numbers in our list)
    const busNumbers = buses.map(b => b.busNumber);
    const existing = await Bus.find({ busNumber: { $in: busNumbers } });
    if (existing.length > 0) {
        const ids = existing.map(b => b._id);
        await Route.deleteMany({ busId: { $in: ids } });
        await Bus.deleteMany({ busNumber: { $in: busNumbers } });
        console.log(`🗑  Removed ${existing.length} existing seeded buses and their routes`);
    }

    // Insert buses
    const insertedBuses = await Bus.insertMany(buses);
    console.log(`🚌 Inserted ${insertedBuses.length} buses`);

    // Insert routes
    const routeDocs = [];
    for (let i = 0; i < insertedBuses.length; i++) {
        const busId = insertedBuses[i]._id;
        for (const [src, dst, dep, arr, price, days] of routeTemplates[i]) {
            routeDocs.push({
                busId,
                source: src,
                destination: dst,
                departureDate: addDays(days),
                departureTime: dep,
                arrivalTime: arr,
                price,
                status: 'active'
            });
        }
    }
    await Route.insertMany(routeDocs);
    console.log(`🗺  Inserted ${routeDocs.length} routes`);

    console.log('🎉 Seeding complete!');
    await mongoose.disconnect();
}

seed().catch(err => {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
});
