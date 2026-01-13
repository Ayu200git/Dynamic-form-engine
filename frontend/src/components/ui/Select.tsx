import React, { forwardRef } from 'react';

interface Option {
    label: string;
    value: string | number;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: Option[];
    helperText?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, error, options, helperText, className = '', ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
                        {label} {props.required && <span className="text-red-500">*</span>}
                    </label>
                )}
                <div className="relative">
                    <select
                        ref={ref}
                        className={`
                            w-full 
                            bg-white 
                            text-gray-900 
                            border-2
                            rounded-xl
                            py-2.5
                            px-4
                            appearance-none
                            transition-all duration-200
                            outline-none
                            cursor-pointer
                            ${error
                                ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-50'
                                : 'border-gray-200 hover:border-gray-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50'
                            }
                            ${className}
                        `}
                        {...props}
                    >
                        <option value="" disabled>Select an option</option>
                        {options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
                {error && (
                    <p className="mt-1.5 ml-1 text-xs font-medium text-red-500 flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-red-500 inline-block"></span>
                        {error}
                    </p>
                )}
                {helperText && !error && (
                    <p className="mt-1.5 ml-1 text-xs text-gray-500">{helperText}</p>
                )}
            </div>
        );
    }
);

Select.displayName = 'Select';
