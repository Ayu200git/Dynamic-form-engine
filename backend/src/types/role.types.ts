export type RoleType = 'ADMIN' | 'USER';

export interface IRole {
    _id?: string;
    name: RoleType;
    permissions: string[];
    createdAt?: Date;
    updatedAt?: Date;
}
