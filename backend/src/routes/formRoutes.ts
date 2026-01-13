import express from 'express';
import { createSchema, getSchema, getAllSchemas, updateSchema, deleteSchema } from '../controllers/formController';
import { protect } from '../middlewares/authMiddleware';
import { checkRole } from '../middlewares/rbacMiddleware';

const router = express.Router();

// Public routes (for fetching Login/Signup implementations)
// Note: We might want to make specific form types public and others private, but for simplicity we allow reading single schema.
// A better approach: Middleware to check if formType is PUBLIC_TYPES = ['LOGIN', 'SIGNUP']
router.get('/:formType', getSchema);

// Protected Routes (Admin Only)
router.get('/', protect, checkRole(['ADMIN']), getAllSchemas);
router.post('/', protect, checkRole(['ADMIN']), createSchema);
router.put('/:formType', protect, checkRole(['ADMIN']), updateSchema);
router.delete('/:formType', protect, checkRole(['ADMIN']), deleteSchema);

export default router;
