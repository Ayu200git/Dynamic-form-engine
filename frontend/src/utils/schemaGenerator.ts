import { z } from 'zod';
import { IFormSchema, IFormField } from '../types/schema.types';

/**
 * Dynamically generates a Zod validation schema from IFormSchema
 * This version uses improved Zod builders and better error handling.
 */
export const generateZodSchema = (formSchema: IFormSchema) => {
    const schemaShape: Record<string, z.ZodTypeAny> = {};

    formSchema.fields.forEach((field: IFormField) => {
        let fieldSchema: z.ZodTypeAny;

        // Base schema based on type
        switch (field.type) {
            case 'number':
                fieldSchema = z.coerce.number({ message: `${field.ui.label} is required` });
                break;
            case 'checkbox':
                fieldSchema = z.boolean({ message: `${field.ui.label} is required` });
                break;
            case 'email':
                fieldSchema = z.string({ message: `${field.ui.label} is required` }).email({ message: "Invalid email address" });
                break;
            default:
                fieldSchema = z.string({ message: `${field.ui.label} is required` });
                break;
        }

        // Apply validation rules to the base schema
        if (field.validation && Array.isArray(field.validation)) {
            field.validation.forEach((rule) => {
                const customMsg = rule.message || undefined;
                switch (rule.type) {
                    case 'min':
                        if (field.type === 'number' && (fieldSchema as any).min) {
                            fieldSchema = (fieldSchema as z.ZodNumber).min(Number(rule.value), customMsg || `Minimum value is ${rule.value}`);
                        }
                        break;
                    case 'max':
                        if (field.type === 'number' && (fieldSchema as any).max) {
                            fieldSchema = (fieldSchema as z.ZodNumber).max(Number(rule.value), customMsg || `Maximum value is ${rule.value}`);
                        }
                        break;
                    case 'minLength':
                        if ((fieldSchema as any).min) {
                            fieldSchema = (fieldSchema as z.ZodString).min(Number(rule.value), customMsg || `${field.ui.label} must be at least ${rule.value} characters`);
                        }
                        break;
                    case 'maxLength':
                        if ((fieldSchema as any).max) {
                            fieldSchema = (fieldSchema as z.ZodString).max(Number(rule.value), customMsg || `${field.ui.label} must not exceed ${rule.value} characters`);
                        }
                        break;
                    case 'pattern':
                        try {
                            const regex = new RegExp(rule.value as string);
                            if ((fieldSchema as any).regex) {
                                fieldSchema = (fieldSchema as z.ZodString).regex(regex, customMsg || 'Invalid format');
                            }
                        } catch (e) {
                            console.error(`Invalid regex pattern for field ${field.name}:`, rule.value);
                        }
                        break;
                }
            });
        }

        // Handle Required
        if (field.required) {
            const requiredMsg = `${field.ui.label} is required`;
            if (field.type === 'checkbox') {
                fieldSchema = fieldSchema.refine(val => val === true, {
                    message: requiredMsg
                });
            } else if (field.type === 'number') {
                fieldSchema = fieldSchema.refine(val => val !== undefined && val !== null && val !== '', {
                    message: requiredMsg
                });
            } else {
                fieldSchema = (fieldSchema as z.ZodString).min(1, requiredMsg);
            }
        } else {
            // Allow empty string or null if not required
            if (field.type !== 'checkbox') {
                fieldSchema = z.union([fieldSchema, z.literal(''), z.null(), z.undefined()]).optional();
            }
        }

        schemaShape[field.name] = fieldSchema;
    });

    return z.object(schemaShape);
};

/**
 * Prepares form values by converting types before submission
 */
export const prepareFormValues = (values: any, formSchema: IFormSchema) => {
    const preparedValues = { ...values };

    formSchema.fields.forEach((field) => {
        const val = preparedValues[field.name];

        if (field.type === 'number' && val !== undefined && val !== null && val !== '') {
            preparedValues[field.name] = Number(val);
        } else if (field.type === 'checkbox') {
            preparedValues[field.name] = !!val;
        } else if (val === '') {
            preparedValues[field.name] = null;
        }
    });

    return preparedValues;
};
