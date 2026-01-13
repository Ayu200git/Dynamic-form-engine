import { Request, Response } from 'express';
import User from '../models/User';
import Product from '../models/Product';

export const getStats = async (req: Request, res: Response) => {
    try {
        // Get counts
        const totalUsers = await User.countDocuments();
        const totalProducts = await Product.countDocuments();

        // Get recent signups (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentSignups = await User.countDocuments({
            createdAt: { $gte: sevenDaysAgo }
        });

        // Get products by category (if category field exists)
        const productsByCategory = await Product.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.status(200).json({
            totalUsers,
            totalProducts,
            recentSignups,
            productsByCategory: productsByCategory.map(item => ({
                category: item._id || 'Uncategorized',
                count: item.count
            }))
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
