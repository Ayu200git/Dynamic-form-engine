import React from 'react';
import { useField } from 'formik';
import { IFormField } from '../../types/schema.types';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

interface FieldRendererProps {
    field: IFormField;
}

export const FieldRenderer: React.FC<FieldRendererProps> = ({ field }) => {
    const [fieldProps, meta] = useField(field.name);
    const { name, type, ui } = field;

    const errorMsg = meta.touched && meta.error ? meta.error : undefined;

    switch (type) {
        case 'checkbox':
            return (
                <div className="flex items-center gap-3 py-2">
                    <input
                        type="checkbox"
                        {...fieldProps}
                        checked={fieldProps.value}
                        id={name}
                        className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 transition-all cursor-pointer"
                    />
                    <label htmlFor={name} className="text-gray-700 font-medium cursor-pointer select-none">
                        {ui.label}
                    </label>
                    {errorMsg && <p className="text-red-500 text-xs mt-1">{errorMsg}</p>}
                </div>
            );
        case 'select':
            return (
                <Select
                    label={ui.label}
                    options={ui.options || []}
                    error={errorMsg}
                    {...fieldProps}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                        fieldProps.onChange(e);
                    }}
                />
            );
        case 'text':
        case 'email':
        case 'password':
        case 'number':
        case 'date':
        default:
            return (
                <Input
                    type={type}
                    label={ui.label}
                    placeholder={ui.placeholder}
                    error={errorMsg}
                    {...fieldProps}
                />
            );
    }
};
