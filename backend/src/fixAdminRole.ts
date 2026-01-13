import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const fixAdminRole = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dynamic-form-engine');
        console.log('MongoDB Connected\n');

        const Role = (await import('./models/Role')).default;
        const User = (await import('./models/User')).default;

        // Find ADMIN role
        const adminRole = await Role.findOne({ name: 'ADMIN' });
        if (!adminRole) {
            console.log('❌ ADMIN role not found!');
            process.exit(1);
        }

        console.log('✅ ADMIN Role ID:', adminRole._id);

        // Update user to have ADMIN role
        const adminEmail = 'ayuuu098@gmail.com';
        const user = await User.findOne({ email: adminEmail });

        if (!user) {
            console.log('❌ User not found!');
            process.exit(1);
        }

        console.log('📧 User found:', adminEmail);
        console.log('🔄 Current role ID:', user.role);
        console.log('🔄 Setting role to ADMIN...');

        user.role = adminRole._id as any;
        await user.save();

        console.log('✅ User role updated successfully!');
        console.log('🎉 You can now login as admin with:', adminEmail);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

fixAdminRole();
