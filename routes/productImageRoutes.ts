import express from 'express';
import {
    deleteProductImage,
    setMainProductImage,
    uploadMultipleProductImages,
    uploadProductImage
} from '../controllers/productImageController';
import { admin, protect } from '../middleware/authMiddleware';
import { productUpload } from '../utils/cloudinaryConfig';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Upload a single product image
router.post(
  '/:productId',
  admin, // Only admins can upload product images
  productUpload.single('image'),
  uploadProductImage
);

// Upload multiple product images
router.post(
  '/:productId/multiple',
  admin,
  productUpload.array('images', 10), // Allow up to 10 images
  uploadMultipleProductImages
);

// Delete a product image
router.delete('/:id', admin, deleteProductImage);

// Set an image as the main product image
router.put('/:id/main', admin, setMainProductImage);

export default router; 