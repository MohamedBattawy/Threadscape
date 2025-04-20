import express from 'express';
import {
    createProduct,
    discontinueProduct,
    getProductById,
    getProducts,
    getProductsByCategory,
    restoreProduct,
    updateProduct
} from '../controllers/productController';
import { admin, protect } from '../middleware/authMiddleware';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/category/:category', getProductsByCategory);
router.get('/:id', getProductById);

// Protected routes - Admin only
router.post('/', protect, admin, createProduct);
router.put('/:id', protect, admin, updateProduct);
router.put('/:id/discontinue', protect, admin, discontinueProduct);
router.put('/:id/restore', protect, admin, restoreProduct);

export default router; 