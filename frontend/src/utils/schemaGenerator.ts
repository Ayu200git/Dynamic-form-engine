import { z } from 'zod';
import { IFormSchema, IFormField } from '../types/schema.types';

/**
 * Dynamically generates a Zod validation schema from IFormSchema
 * This version uses improved Zod builders and better error handling.
 */
export const generateZodSchema = (formSchema: IFormSchema) => {
    const schemaShape: Record<string, z.ZodTypeAny> = {};

    formSchema.fields.forEach((field: IFormField) => {
        let fieldSchema: any;
        const requiredMsg = `${field.ui.label} is required`;

        // 1. Initialize Base Schema
        switch (field.type) {
            case 'email':
                fieldSchema = z.string({ message: requiredMsg })
                    .email({ message: "Invalid email address" });
                break;
            case 'number':
                fieldSchema = z.coerce.number({ message: `${field.ui.label} must be a number` });
                break;
            case 'checkbox':
                fieldSchema = z.boolean({ message: requiredMsg });
                break;
            case 'date':
                fieldSchema = z.string({ message: requiredMsg });
                break;
            case 'password':
            case 'text':
            default:
                fieldSchema = z.string({ message: requiredMsg });
                break;
        }

        // 2. Apply Custom Validation Rules
        if (field.validation && Array.isArray(field.validation)) {
            field.validation.forEach((rule) => {
                const customMsg = rule.message || undefined;
                switch (rule.type) {
                    case 'minLength':
                        if (typeof fieldSchema.min === 'function' && field.type !== 'number') {
                            fieldSchema = fieldSchema.min(Number(rule.value), customMsg);
                        }
                        break;
                    case 'maxLength':
                        if (typeof fieldSchema.max === 'function' && field.type !== 'number') {
                            fieldSchema = fieldSchema.max(Number(rule.value), customMsg);
                        }
                        break;
                    case 'min':
                        if (field.type === 'number' && typeof fieldSchema.min === 'function') {
                            fieldSchema = fieldSchema.min(Number(rule.value), customMsg);
                        }
                        break;
                    case 'max':
                        if (field.type === 'number' && typeof fieldSchema.max === 'function') {
                            fieldSchema = fieldSchema.max(Number(rule.value), customMsg);
                        }
                        break;
                    case 'pattern':
                        if (typeof fieldSchema.regex === 'function') {
                            try {
                                fieldSchema = fieldSchema.regex(new RegExp(rule.value as string), customMsg);
                            } catch (e) {
                                console.error(`Invalid regex: ${rule.value}`);
                            }
                        }
                        break;
                }
            });
        }

        // 3. Handle Required state
        if (field.required) {
            if (field.type === 'checkbox') {
                fieldSchema = fieldSchema.refine((val: any) => val === true, requiredMsg);
            } else if (field.type === 'number') {
                // For Formik/Zod interop on numbers
                fieldSchema = z.any()
                    .refine(val => val !== '' && val !== undefined && val !== null, requiredMsg)
                    .transform(val => Number(val))
                    .pipe(z.number({ message: `${field.ui.label} must be a number` }));
            } else {
                fieldSchema = fieldSchema.min(1, requiredMsg);
            }
        } else {
            // Optional: allow empty string or null
            if (field.type !== 'checkbox') {
                fieldSchema = z.union([fieldSchema, z.literal(''), z.null()]).optional();
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
