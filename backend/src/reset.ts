import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Role from './models/Role';
import User from './models/User';
import FormSchema from './models/FormSchema';
import bcrypt from 'bcryptjs';

dotenv.config();

const resetDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dynamic-form-engine');
        console.log('MongoDB Connected');

        console.log('🗑️  Deleting all data...');

        // Delete all collections
        await Role.deleteMany({});
        await User.deleteMany({});
        await FormSchema.deleteMany({});
        const Product = (await import('./models/Product')).default;
        await Product.deleteMany({});

        console.log('✅ All data deleted successfully!');
        console.log('Now run: npm run seed');

        process.exit(0);
    } catch (error) {
        console.error('Error resetting database:', error);
        process.exit(1);
    }
};

resetDatabase();
