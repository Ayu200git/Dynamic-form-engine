import { Request, Response } from 'express';
import { authService } from '../services/authService';

export const register = async (req: Request, res: Response) => {
    try {
        const result = await authService.register(req.body);
        res.status(201).json(result);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const result = await authService.login(req.body);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(401).json({ message: error.message });
    }
};

export const getMe = async (req: Request, res: Response) => {
    res.status(200).json(req.user);
};
