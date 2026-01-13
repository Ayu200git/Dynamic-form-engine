import express from 'express';
import { getStats } from '../controllers/analyticsController';
import { protect as authMiddleware } from '../middlewares/authMiddleware';
import { checkRole as rbacMiddleware } from '../middlewares/rbacMiddleware';

const router = express.Router();

// Admin only route
router.get('/stats', authMiddleware, rbacMiddleware(['ADMIN']), getStats);

export default router;
