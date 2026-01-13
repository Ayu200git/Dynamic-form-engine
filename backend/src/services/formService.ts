import FormSchema, { IFormSchemaDocument } from '../models/FormSchema';
import { IFormSchema, FormType } from '../types/formSchema.types';

class FormService {
    async createSchema(data: IFormSchema) {
        // efficient upsert: if schema for this formType exists, update it, otherwise create
        const { formType } = data;
        const existing = await FormSchema.findOne({ formType });
        if (existing) {
            throw new Error(`Schema for ${formType} already exists. Use update instead.`);
        }
        return await FormSchema.create(data);
    }

    async getSchemaByType(formType: string): Promise<IFormSchemaDocument | null> {
        return await FormSchema.findOne({ formType });
    }

    async getAllSchemas(): Promise<IFormSchemaDocument[]> {
        return await FormSchema.find({});
    }

    async updateSchema(formType: string, data: Partial<IFormSchema>): Promise<IFormSchemaDocument | null> {
        return await FormSchema.findOneAndUpdate({ formType }, data, { new: true });
    }

    async deleteSchema(formType: string) {
        return await FormSchema.findOneAndDelete({ formType });
    }
}

export const formService = new FormService();
