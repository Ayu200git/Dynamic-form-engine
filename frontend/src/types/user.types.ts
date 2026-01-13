export type RoleType = 'ADMIN' | 'USER';

export interface IUser {
    _id: string;
    username: string;
    email: string;
    role: RoleType; // In frontend, we assume role is the role name string for simplicity in Auth slice
}

export interface IAuthResponse {
    user: IUser;
    token: string;
}
