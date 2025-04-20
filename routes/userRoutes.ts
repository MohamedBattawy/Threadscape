import express from 'express';
import { changePassword, createUser, deleteUser, getSingleUser, getUsers, updateUser } from '../controllers/userController';
import { admin, protect } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import { createUserSchema, updateUserSchema } from '../schemaValidations/userSchema';

const router = express.Router();

// Public route for user registration
router.post('/', validateRequest(createUserSchema), createUser);

// Protected routes
router.get('/', protect, admin, getUsers);
router.get('/:id', protect, admin, getSingleUser);
router.put('/:id', protect, validateRequest(updateUserSchema), updateUser);
router.delete('/:id', protect, deleteUser);
router.post('/change-password', protect, changePassword);

export default router; 