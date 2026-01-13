import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const checkRoles = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dynamic-form-engine');
        console.log('MongoDB Connected\n');

        const Role = (await import('./models/Role')).default;
        const User = (await import('./models/User')).default;

        const roles = await Role.find();
        console.log('=== ROLES ===');
        roles.forEach(role => {
            console.log(`ID: ${role._id}, Name: ${role.name}`);
        });

        console.log('\n=== USERS ===');
        const users = await User.find().populate('role');
        users.forEach(user => {
            console.log(`Email: ${user.email}, Role: ${(user.role as any).name}, RoleID: ${user.role}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkRoles();
