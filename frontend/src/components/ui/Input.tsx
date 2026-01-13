import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    startIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, helperText, startIcon, className = '', ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
                        {label} {props.required && <span className="text-red-500">*</span>}
                    </label>
                )}
                <div className="relative group">
                    {startIcon && (
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                            {startIcon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={`
                            w-full 
                            bg-white 
                            text-gray-900 
                            placeholder-gray-400
                            border-2
                            rounded-xl
                            py-2.5
                            ${startIcon ? 'pl-10' : 'px-4'}
                            transition-all duration-200
                            outline-none
                            ${error
                                ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-50'
                                : 'border-gray-200 hover:border-gray-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50'
                            }
                            ${className}
                        `}
                        {...props}
                    />
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

Input.displayName = 'Input';
