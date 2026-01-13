export type FieldType = 'text' | 'number' | 'email' | 'password' | 'select' | 'checkbox' | 'date';

export interface IValidationRule {
    type: 'required' | 'min' | 'max' | 'pattern' | 'minLength' | 'maxLength';
    value?: string | number | boolean;
    message: string;
}

export interface IFieldUIConfig {
    variant?: 'outlined' | 'filled' | 'standard';
    label: string;
    placeholder?: string;
    autocomplete?: string;
    hidden?: boolean;
    className?: string;
    options?: { label: string; value: string | number }[];
}

export interface IFormField {
    name: string;
    type: FieldType;
    required?: boolean;
    validation?: IValidationRule[];
    ui: IFieldUIConfig;
    defaultValue?: any;
}

export type FormType = 'LOGIN' | 'SIGNUP' | 'ADD_PRODUCT' | 'UPDATE_PRODUCT';

export interface IFormSchema {
    _id: string;
    formType: FormType;
    title: string;
    fields: IFormField[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
