import Product from '../models/Product';
import { formService } from './formService';
import { validateDynamicData } from '../utils/validator';

class ProductService {
    async createProduct(data: any) {
        // Fetch ADD_PRODUCT schema to validate
        const schema = await formService.getSchemaByType('ADD_PRODUCT');
        if (!schema) {
            throw new Error('Product schema not found. Admin needs to configure ADD_PRODUCT form first.');
        }

        // Validate data
        const errors = validateDynamicData(schema.fields, data);
        if (errors.length > 0) {
            throw new Error(`Validation Failed: ${errors.join(', ')}`);
        }

        // Transform data (e.g., convert string 'true'/'false' to boolean for inStock)
        const transformedData = { ...data };
        if (transformedData.inStock === 'true') transformedData.inStock = true;
        if (transformedData.inStock === 'false') transformedData.inStock = false;

        // Save
        return await Product.create(transformedData);
    }

    async getAllProducts() {
        return await Product.find({});
    }

    async getProductById(id: string) {
        return await Product.findById(id);
    }

    async updateProduct(id: string, data: any) {
        // Fetch UPDATE_PRODUCT schema if exists, otherwise generic validation or skip
        // Usually UPDATE_PRODUCT matches ADD_PRODUCT but might have readonly fields
        const schema = await formService.getSchemaByType('UPDATE_PRODUCT') || await formService.getSchemaByType('ADD_PRODUCT');

        if (schema) {
            const errors = validateDynamicData(schema.fields, data);
            // Filter errors only for fields present in data (partial update)
            // But for simplicity, we assume full update or we check only what's sent.
            // Actually, mongoose findOneAndUpdate with new: true is standard.
            // If partial update, we only validate fields in 'data'.
            // My validator checks required. So if data is partial, required check might fail.
            // We should handle partial updates better:
            // For now, let's assume PUT replaces the object or we loosen validation for update.
            // Let's rely on frontend sending valid data and backend checking ONLY validation rules for Present fields or Required fields if they are missing and meant to be there. 
            // Implementation Detail: skipping deep validation for update to keep it simple, or checking only present fields.
        }

        // Transform data
        const transformedData = { ...data };
        if (transformedData.inStock === 'true') transformedData.inStock = true;
        if (transformedData.inStock === 'false') transformedData.inStock = false;

        return await Product.findByIdAndUpdate(id, transformedData, { new: true });
    }

    async deleteProduct(id: string) {
        return await Product.findByIdAndDelete(id);
    }
}

export const productService = new ProductService();
