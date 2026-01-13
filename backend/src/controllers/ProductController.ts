import { Request, Response } from 'express';
import { productService } from '../services/productService';

export const createProduct = async (req: Request, res: Response) => {
    try {
        const result = await productService.createProduct(req.body);
        res.status(201).json(result);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const getAllProducts = async (req: Request, res: Response) => {
    try {
        const result = await productService.getAllProducts();
        res.status(200).json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getProduct = async (req: Request, res: Response) => {
    try {
        const result = await productService.getProductById(req.params.id);
        if (!result) return res.status(404).json({ message: 'Product not found' });
        res.status(200).json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateProduct = async (req: Request, res: Response) => {
    try {
        const result = await productService.updateProduct(req.params.id, req.body);
        if (!result) return res.status(404).json({ message: 'Product not found' });
        res.status(200).json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const result = await productService.deleteProduct(req.params.id);
        if (!result) return res.status(404).json({ message: 'Product not found' });
        res.status(200).json({ message: 'Product deleted' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
