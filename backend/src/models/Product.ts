import mongoose, { Schema, Document } from 'mongoose';
import { IProduct } from '../types/product.types';

export interface IProductDocument extends Omit<IProduct, '_id'>, Document { }

// Using strict: false to allow dynamic fields based on schema
const ProductSchema = new Schema<IProductDocument>({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    }
    // Other fields will be saved dynamically
}, { timestamps: true, strict: false });

export default mongoose.model<IProductDocument>('Product', ProductSchema);
