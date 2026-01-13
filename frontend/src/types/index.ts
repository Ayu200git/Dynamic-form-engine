export interface IUser {
    id: string;
    username: string;
    email: string;
    role: 'admin' | 'user';
}

export interface IFieldConfig {
    name: string;
    label: string;
    type: 'text' | 'number' | 'password' | 'email' | 'select' | 'checkbox' | 'textarea';
    required?: boolean;
    placeholder?: string;
    options?: string[];
    validation?: {
        min?: number;
        max?: number;
        minLength?: number;
        maxLength?: number;
        pattern?: string;
    };
    ui?: {
        variant?: string;
        className?: string;
        hidden?: boolean;
    };
}

export interface IFormSchema {
    _id: string;
    slug: string;
    title: string;
    fields: IFieldConfig[];
}

export interface IProduct {
    _id: string;
    [key: string]: any;
}
