import express from 'express';
import { createProduct, getAllProducts, getProduct, updateProduct, deleteProduct } from '../controllers/productController';
import { protect } from '../middlewares/authMiddleware';
import { checkRole } from '../middlewares/rbacMiddleware';

const router = express.Router();

// Public: View products
router.get('/', getAllProducts);
router.get('/:id', getProduct);

// Protected: Edit products (Admin only for now, or maybe User can create? Requirements said "Admins control all... Admin actions include Add/Edit/Delete fields". Usually Admins manage products too in this context, or maybe users. Let's assume Admin only for safety, or allow USER to create if needed. Prompt implies Admin Panel manages the FIELDS, but who manages DATA? "Admin actions include... Add / edit / delete fields". 
// But "Admins control all form fields from an Admin Panel... those changes instantly reflect on the User Side UI".
// This implies Users fill out the forms. So Users create Products? 
// "Low-code form engine inside a real SaaS product" -> Users likely Create Products.
// Let's allow Authenticated Users to Create/Update products.

router.post('/', protect, createProduct); // Any logged in user
router.put('/:id', protect, updateProduct);
router.delete('/:id', protect, checkRole(['ADMIN']), deleteProduct); // Only Admin delete

export default router;
