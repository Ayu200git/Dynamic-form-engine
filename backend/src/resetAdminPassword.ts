import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

// Import User model after dotenv config
const User = require('./models/User').default;

dotenv.config();

const resetAdminPassword = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dynamic-form-engine');
        console.log('MongoDB Connected');

        // Find admin user by email
        const adminEmail = 'ayuuu098@gmail.com'; // Your admin email
        const newPassword = 'admin123'; // New password

        const admin = await User.findOne({ email: adminEmail });

        if (!admin) {
            console.log('❌ Admin user not found!');
            process.exit(1);
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        admin.password = hashedPassword;
        await admin.save();

        console.log('✅ Admin password reset successfully!');
        console.log('📧 Email:', adminEmail);
        console.log('🔑 New Password:', newPassword);
        console.log('\nYou can now login with these credentials.');

        process.exit(0);
    } catch (error) {
        console.error('Error resetting password:', error);
        process.exit(1);
    }
};

resetAdminPassword();
