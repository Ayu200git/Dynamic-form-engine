import { IRole } from './role.types';

export interface IUser {
    _id?: string;
    username: string;
    email: string;
    password?: string;
    role: string | IRole; // Reference to Role ID or populated Role object
    createdAt?: Date;
    updatedAt?: Date;
}
