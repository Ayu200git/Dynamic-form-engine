export interface IProduct {
    _id?: string;
    title: string;
    price: number;
    // Products will have dynamic fields based on the Form Schema
    // We use a flexible index signature to allow any other properties
    [key: string]: any;
}
