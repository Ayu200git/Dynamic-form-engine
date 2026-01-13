import { Request, Response } from 'express';
import User from '../models/User';

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await User.find()
            .populate('role', 'name')
            .select('-password')
            .sort({ createdAt: -1 });

        res.status(200).json(users);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Prevent deleting yourself
        if (req.user && req.user._id?.toString() === id) {
            return res.status(400).json({ message: 'You cannot delete your own account' });
        }

        const user = await User.findByIdAndDelete(id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
