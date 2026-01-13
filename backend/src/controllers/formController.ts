import { Request, Response } from 'express';
import { formService } from '../services/formService';

export const createSchema = async (req: Request, res: Response) => {
    try {
        const result = await formService.createSchema(req.body);
        res.status(201).json(result);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const getSchema = async (req: Request, res: Response) => {
    try {
        const { formType } = req.params;
        const result = await formService.getSchemaByType(formType.toUpperCase());
        if (!result) {
            return res.status(404).json({ message: 'Schema not found' });
        }
        res.status(200).json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllSchemas = async (req: Request, res: Response) => {
    try {
        const result = await formService.getAllSchemas();
        res.status(200).json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateSchema = async (req: Request, res: Response) => {
    try {
        const { formType } = req.params;
        const result = await formService.updateSchema(formType.toUpperCase(), req.body);
        if (!result) {
            return res.status(404).json({ message: 'Schema not found' });
        }
        res.status(200).json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteSchema = async (req: Request, res: Response) => {
    try {
        const { formType } = req.params;
        const result = await formService.deleteSchema(formType.toUpperCase());
        if (!result) {
            return res.status(404).json({ message: 'Schema not found' });
        }
        res.status(200).json({ message: 'Schema deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}
