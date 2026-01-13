import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from '../types/user.types';

export interface IUserDocument extends Omit<IUser, '_id'>, Document { }

const UserSchema = new Schema<IUserDocument>({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        select: false // Do not return password by default
    },
    role: {
        type: Schema.Types.ObjectId,
        ref: 'Role',
        required: true
    },
}, { timestamps: true });

export default mongoose.model<IUserDocument>('User', UserSchema);
