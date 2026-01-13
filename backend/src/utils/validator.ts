import { IFormField } from '../types/formSchema.types';

/**
 * Validates dynamic data against a list of schema fields.
 * This version includes type coercion and more descriptive default error messages.
 */
export const validateDynamicData = (schemaFields: IFormField[], data: any) => {
    const errors: string[] = [];

    schemaFields.forEach((field) => {
        let value = data[field.name];

        // 1. Check Required
        if (field.required && (value === undefined || value === null || value === '')) {
            errors.push(`${field.ui.label} is required`);
            return; // Skip other validations if required and missing
        }

        // 2. Handle numeric coercion if needed
        if (field.type === 'number' && value !== undefined && value !== null && value !== '') {
            if (typeof value === 'string') {
                const num = Number(value);
                if (!isNaN(num)) value = num;
            }
        }

        // 3. Check Custom Validation Rules
        if (field.validation && value !== undefined && value !== null && value !== '') {
            field.validation.forEach((rule) => {
                const ruleVal = typeof rule.value === 'string' ? Number(rule.value) : rule.value;
                const customMsg = rule.message;

                switch (rule.type) {
                    case 'min':
                        if (typeof value === 'number' && value < (ruleVal as number)) {
                            errors.push(customMsg || `${field.ui.label} must be at least ${ruleVal}`);
                        }
                        break;
                    case 'max':
                        if (typeof value === 'number' && value > (ruleVal as number)) {
                            errors.push(customMsg || `${field.ui.label} must not exceed ${ruleVal}`);
                        }
                        break;
                    case 'minLength':
                        if (typeof value === 'string' && value.length < (ruleVal as number)) {
                            errors.push(customMsg || `${field.ui.label} must be at least ${ruleVal} characters`);
                        }
                        break;
                    case 'maxLength':
                        if (typeof value === 'string' && value.length > (ruleVal as number)) {
                            errors.push(customMsg || `${field.ui.label} must not exceed ${ruleVal} characters`);
                        }
                        break;
                    case 'pattern':
                        if (typeof value === 'string' && rule.value) {
                            try {
                                const regex = new RegExp(rule.value as string);
                                if (!regex.test(value)) {
                                    errors.push(customMsg || `${field.ui.label} has an invalid format`);
                                }
                            } catch (e) {
                                console.error(`Invalid regex in validator for ${field.name}`);
                            }
                        }
                        break;
                }
            });
        }
    });

    return errors;
};
