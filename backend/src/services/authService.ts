import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User, { IUserDocument } from '../models/User';
import Role, { IRoleDocument } from '../models/Role';
import { IUser } from '../types/user.types';
import { config } from '../configs';

class AuthService {
    async register(userData: IUser) {
        const { username, email, password, role } = userData;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new Error('User already exists');
        }

        // Find role (default to USER if not provided or valid)
        let roleId = role;
        let roleName = 'USER';

        if (typeof role === 'string') {
            const roleDoc = await Role.findOne({ name: role.toUpperCase() });
            if (roleDoc) {
                roleName = roleDoc.name;

                // SECURITY: Only allow ONE admin - check if admin already exists
                if (roleName === 'ADMIN') {
                    const existingAdmin = await User.findOne({ role: roleDoc._id });
                    if (existingAdmin) {
                        throw new Error('Admin account already exists. Only one admin is allowed. Please signup as a User.');
                    }
                }

                roleId = roleDoc._id as unknown as string;
            } else {
                const defaultRole = await Role.findOne({ name: 'USER' });
                if (defaultRole) roleId = defaultRole._id as unknown as string;
            }
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password!, salt);

        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            role: roleId
        });

        return this.generateToken(user);
    }

    async login(userData: Partial<IUser>) {
        const { email, password } = userData;

        const user = await User.findOne({ email }).select('+password').populate('role');
        if (!user) {
            throw new Error('Invalid credentials - User not found');
        }

        const isMatch = await bcrypt.compare(password!, user.password!);
        if (!isMatch) {
            throw new Error('Invalid credentials - Incorrect password');
        }

        const result = this.generateToken(user);
        console.log('Login successful for:', email, 'Role:', result.user.role);
        return result;
    }

    private generateToken(user: IUserDocument) {
        const roleName = (user.role as any).name || 'USER';

        const payload = {
            _id: user._id,
            username: user.username,
            email: user.email,
            role: roleName
        };

        const token = jwt.sign(payload, config.JWT_SECRET, {
            expiresIn: config.JWT_EXPIRES_IN as any
        });

        return { user: { ...payload }, token };
    }
}

export const authService = new AuthService();
