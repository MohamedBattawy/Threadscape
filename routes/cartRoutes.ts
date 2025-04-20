import express from 'express';
import {
    addToCart,
    clearCart,
    getCart,
    removeFromCart,
    updateCartItem
} from '../controllers/cartController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// All cart routes are protected - only logged in users can access
router.use(protect);

// Get cart and add items to cart
router.route('/')
  .get(getCart)
  .post(addToCart)
  .delete(clearCart);

// Manage specific cart items
router.route('/:id')
  .put(updateCartItem)
  .delete(removeFromCart);

export default router; 