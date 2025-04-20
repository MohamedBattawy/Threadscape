import express from 'express';
import { getCurrentUser, login, logout } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import { loginUserSchema } from '../schemaValidations/userSchema';

const router = express.Router();

// Public routes
router.post('/login', validateRequest(loginUserSchema), login);
router.post('/logout', logout);

// Protected routes
router.get('/me', protect, getCurrentUser);

export default router; 