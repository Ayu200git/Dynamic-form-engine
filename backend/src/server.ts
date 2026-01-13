import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import * as fs from 'fs';
import { config } from './configs';
import authRoutes from './routes/authRoutes';
import formRoutes from './routes/formRoutes';
import productRoutes from './routes/productRoutes';
import userRoutes from './routes/userRoutes';
import analyticsRoutes from './routes/analyticsRoutes';

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/forms', formRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health Check
app.get('/', (req, res) => {
    res.send('Dynamic Form Engine API is running');
});

// Database Connection
mongoose
    .connect(config.MONGO_URI)
    .then(() => {
        console.log('MongoDB Connected');
        app.listen(config.PORT, () => {
            console.log(`Server running on port ${config.PORT}`);
        });
    })
    .catch((err) => {
        console.error('Database connection error:', err);
        process.exit(1);
    });
