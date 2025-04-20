import express from 'express';
import { getProducts } from '../controllers/productController';

const router = express.Router();

// @route   GET /api/products
// @desc    Get all products
// @access  Public
router.get('/', getProducts);

export default router; 