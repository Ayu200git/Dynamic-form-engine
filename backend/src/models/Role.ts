import mongoose, { Schema, Document } from 'mongoose';
import { IRole } from '../types/role.types';

export interface IRoleDocument extends Omit<IRole, '_id'>, Document { }

const RoleSchema = new Schema<IRoleDocument>({
    name: {
        type: String,
        required: true,
        unique: true,
        enum: ['ADMIN', 'USER']
    },
    permissions: [{
        type: String
    }],
}, { timestamps: true });

export default mongoose.model<IRoleDocument>('Role', RoleSchema);
