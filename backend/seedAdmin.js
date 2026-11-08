require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./config/db');

const seedAdmin = async () => {
    try {
        console.log('Connecting to database...');
        await connectDB();
        console.log('Database connected.');

        const adminEmail = process.env.ADMIN_EMAIL || 'maharaja@busbooking.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'Rajesh@123';

        console.log(`Checking for existing admin with email: ${adminEmail}`);
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log('✅ Admin account already exists');
            process.exit();
        }

        console.log('Creating new admin user...');
        const adminUser = new User({
            name: 'Super Admin',
            email: adminEmail,
            password: adminPassword,
            role: 'admin'
        });

        await adminUser.save();

        console.log('🎉 Admin account created successfully!');
        console.log(`Email: ${adminEmail}`);
        console.log(`Password: ${adminPassword}`);

        process.exit();
    } catch (error) {
        console.error('❌ Error creating admin:', error);
        process.exit(1);
    }
};

seedAdmin();
