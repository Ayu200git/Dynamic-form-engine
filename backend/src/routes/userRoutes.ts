import express from 'express';
import { getAllUsers, deleteUser } from '../controllers/userController';
import { protect as authMiddleware } from '../middlewares/authMiddleware';
import { checkRole as rbacMiddleware } from '../middlewares/rbacMiddleware';

const router = express.Router();

// Admin only routes
router.get('/', authMiddleware, rbacMiddleware(['ADMIN']), getAllUsers);
router.delete('/:id', authMiddleware, rbacMiddleware(['ADMIN']), deleteUser);

export default router;
