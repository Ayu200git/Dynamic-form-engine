import mongoose, { Schema, Document } from 'mongoose';
import { IFormSchema } from '../types/formSchema.types';

export interface IFormSchemaDocument extends Omit<IFormSchema, '_id'>, Document { }

const FormSchemaSchema = new Schema<IFormSchemaDocument>({
    formType: {
        type: String,
        required: true,
        unique: true,
        enum: ['LOGIN', 'SIGNUP', 'ADD_PRODUCT', 'UPDATE_PRODUCT']
    },
    title: {
        type: String,
        required: true
    },
    fields: [{
        name: { type: String, required: true },
        type: { type: String, required: true },
        required: { type: Boolean, default: false },
        validation: [{
            type: { type: String, required: true },
            value: Schema.Types.Mixed,
            message: { type: String, required: true }
        }],
        ui: {
            variant: { type: String },
            label: { type: String, required: true },
            placeholder: { type: String },
            autocomplete: { type: String },
            hidden: { type: Boolean, default: false },
            className: { type: String },
            options: [{ label: String, value: Schema.Types.Mixed }]
        },
        defaultValue: Schema.Types.Mixed
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

export default mongoose.model<IFormSchemaDocument>('FormSchema', FormSchemaSchema);
