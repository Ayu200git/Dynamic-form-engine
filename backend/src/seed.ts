import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Role from './models/Role';
import User from './models/User';
import FormSchema from './models/FormSchema';
import bcrypt from 'bcryptjs';

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/dynamic-form-engine');
        console.log('MongoDB Connected');

        // Check if database is already seeded
        const existingRoles = await Role.countDocuments();
        if (existingRoles > 0) {
            console.log('Database already seeded. Skipping to prevent data loss.');
            console.log('If you want to reset the database, manually delete all collections first.');
            process.exit(0);
        }

        console.log('Database is empty. Starting initial seed...');

        // Clear existing data (only runs if database was empty)
        await Role.deleteMany({});
        await User.deleteMany({});
        await FormSchema.deleteMany({});

        // Create Roles
        const adminRole = await Role.create({
            name: 'ADMIN',
            permissions: ['ALL']
        });

        const userRole = await Role.create({
            name: 'USER',
            permissions: ['READ_PRODUCTS']
        });

        console.log('Roles Created');

        // Create Admin User
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        await User.create({
            username: 'admin',
            email: 'admin@example.com',
            password: hashedPassword,
            role: adminRole._id
        });

        console.log('Admin User Created');

        // Create Form Schemas
        await FormSchema.create({
            formType: 'LOGIN',
            title: 'Login',
            fields: [
                {
                    name: 'email',
                    type: 'email',
                    required: true,
                    ui: { label: 'Email Address', placeholder: 'Enter your email' }
                },
                {
                    name: 'password',
                    type: 'password',
                    required: true,
                    ui: { label: 'Password', placeholder: 'Enter your password' }
                }
            ]
        });

        await FormSchema.create({
            formType: 'SIGNUP',
            title: 'Sign Up',
            fields: [
                {
                    name: 'username',
                    type: 'text',
                    required: true,
                    ui: { label: 'Username', placeholder: 'Choose a username' }
                },
                {
                    name: 'email',
                    type: 'email',
                    required: true,
                    ui: { label: 'Email Address', placeholder: 'Enter your email' }
                },
                {
                    name: 'password',
                    type: 'password',
                    required: true,
                    ui: { label: 'Password', placeholder: 'Choose a password' }
                },
                {
                    name: 'role',
                    type: 'select',
                    required: true,
                    ui: {
                        label: 'I am a...',
                        placeholder: 'Select Role',
                        options: [
                            { label: 'User', value: 'USER' },
                            { label: 'Admin', value: 'ADMIN' }
                        ]
                    }
                }
            ]
        });

        await FormSchema.create({
            formType: 'ADD_PRODUCT',
            title: 'Add New Product',
            fields: [
                {
                    name: 'title',
                    type: 'text',
                    required: true,
                    ui: { label: 'Product Title', placeholder: 'e.g. iPhone 15' }
                },
                {
                    name: 'price',
                    type: 'number',
                    required: true,
                    ui: { label: 'Price ($)', placeholder: 'e.g. 999' }
                },
                {
                    name: 'category',
                    type: 'select',
                    required: true,
                    ui: {
                        label: 'Category',
                        placeholder: 'Select category',
                        options: [
                            { label: 'Electronics', value: 'Electronics' },
                            { label: 'Computers', value: 'Computers' },
                            { label: 'Audio', value: 'Audio' },
                            { label: 'Accessories', value: 'Accessories' }
                        ]
                    }
                },
                {
                    name: 'brand',
                    type: 'text',
                    required: true,
                    ui: { label: 'Brand', placeholder: 'e.g. Apple' }
                },
                {
                    name: 'inStock',
                    type: 'select',
                    required: true,
                    ui: {
                        label: 'Stock Status',
                        placeholder: 'Select status',
                        options: [
                            { label: 'In Stock', value: 'true' },
                            { label: 'Out of Stock', value: 'false' }
                        ]
                    }
                }
            ]
        });

        console.log('Form Schemas Created');

        // Seed Dummy Products
        const Product = (await import('./models/Product')).default;
        await Product.deleteMany({});

        await Product.insertMany([
            {
                title: 'iPhone 15 Pro',
                price: 999,
                category: 'Electronics',
                brand: 'Apple',
                inStock: true
            },
            {
                title: 'MacBook Pro 16"',
                price: 2499,
                category: 'Computers',
                brand: 'Apple',
                inStock: true
            },
            {
                title: 'Sony WH-1000XM5',
                price: 399,
                category: 'Audio',
                brand: 'Sony',
                inStock: true
            },
            {
                title: 'Samsung Galaxy S24',
                price: 899,
                category: 'Electronics',
                brand: 'Samsung',
                inStock: false
            },
            {
                title: 'Dell XPS 13',
                price: 1299,
                category: 'Computers',
                brand: 'Dell',
                inStock: true
            },
            {
                title: 'AirPods Pro',
                price: 249,
                category: 'Audio',
                brand: 'Apple',
                inStock: true
            }
        ]);

        console.log('Dummy Products Created');
        console.log('✅ Database seeded successfully!');
        console.log('Admin credentials: admin@example.com / admin123');

        process.exit();
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
