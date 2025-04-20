import express from 'express';
import {
    cancelOrder,
    createOrder,
    fulfillOrder,
    getAllOrders,
    getOrderById,
    getUserOrders,
    updateOrderStatus,
    updateOrderStatusByUser
} from '../controllers/orderController';
import { admin, protect } from '../middleware/authMiddleware';

const router = express.Router();

// All order routes are protected - only logged in users can access
router.use(protect);

// User order routes
router.get('/', getUserOrders);
router.post('/', createOrder);
router.get('/:id', getOrderById);
router.put('/:id/cancel', cancelOrder);
router.put('/:id/fulfill', fulfillOrder);
router.put('/:id/update-status', updateOrderStatusByUser);

// Admin routes
router.get('/admin/all', admin, getAllOrders);
router.put('/:id/status', admin, updateOrderStatus);

export default router; 