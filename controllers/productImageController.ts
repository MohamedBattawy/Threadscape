import { Request, Response } from 'express';
import { PrismaClient } from '../src/generated/prisma';
import { deleteImage, getPublicIdFromUrl } from '../utils/cloudinaryConfig';
import { parseIdParam } from '../utils/queryHelpers';
import { handleServerError, sendErrorResponse, sendSuccessResponse } from '../utils/responseHandlers';

const prisma = new PrismaClient();

/**
 * @desc    Upload a product image
 * @route   POST /api/product-images/:productId
 * @access  Private/Admin
 */
export const uploadProductImage = async (req: Request, res: Response) => {
  try {
    const productId = parseIdParam(req.params.productId);
    
    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });
    
    if (!product) {
      return sendErrorResponse(res, 'Product not found', 404);
    }
    
    // Check if file was uploaded
    if (!req.file) {
      return sendErrorResponse(res, 'No image file provided', 400);
    }
    
    // Get the Cloudinary URL from the uploaded file
    const imageUrl = (req.file as any).path;
    
    // Get existing images to determine if this should be the main image
    const existingImages = await prisma.productImage.findFirst({
      where: { productId }
    });
    
    // If no existing images, this will be the main image
    const isMain = !existingImages;
    
    // Create product image in database
    const productImage = await prisma.productImage.create({
      data: {
        url: imageUrl,
        productId,
        isMain
      }
    });
    
    sendSuccessResponse(res, {
      message: 'Image uploaded successfully',
      image: productImage,
      isMain
    }, 201);
  } catch (error) {
    handleServerError(res, error);
  }
};

/**
 * @desc    Upload multiple product images
 * @route   POST /api/product-images/:productId/multiple
 * @access  Private/Admin
 */
export const uploadMultipleProductImages = async (req: Request, res: Response) => {
  try {
    const productId = parseIdParam(req.params.productId);
    
    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });
    
    if (!product) {
      return sendErrorResponse(res, 'Product not found', 404);
    }
    
    // Check if files were uploaded
    if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
      return sendErrorResponse(res, 'No image files provided', 400);
    }
    
    // Get existing images
    const existingImages = await prisma.productImage.count({
      where: { productId }
    });
    
    // Process each uploaded file
    const files = Array.isArray(req.files) ? req.files : [req.files.image];
    const uploadedImages = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i] as any;
      const imageUrl = file.path;
      
      // First image will be main if no existing images
      const isMain = (i === 0 && existingImages === 0);
      
      const productImage = await prisma.productImage.create({
        data: {
          url: imageUrl,
          productId,
          isMain
        }
      });
      
      uploadedImages.push(productImage);
    }
    
    sendSuccessResponse(res, {
      message: `${uploadedImages.length} images uploaded successfully`,
      images: uploadedImages,
      mainImageId: uploadedImages.find(img => img.isMain)?.id
    }, 201);
  } catch (error) {
    handleServerError(res, error);
  }
};

/**
 * @desc    Delete a product image
 * @route   DELETE /api/product-images/:id
 * @access  Private/Admin
 */
export const deleteProductImage = async (req: Request, res: Response) => {
  try {
    const imageId = parseIdParam(req.params.id);
    
    // Get image details
    const image = await prisma.productImage.findUnique({
      where: { id: imageId }
    });
    
    if (!image) {
      return sendErrorResponse(res, 'Image not found', 404);
    }
    
    // Extract Cloudinary public ID from URL
    const publicId = getPublicIdFromUrl(image.url);
    
    // Delete from Cloudinary
    if (publicId) {
      await deleteImage(publicId);
    }
    
    // If it's the main image, we need to set another image as main (if exists)
    if (image.isMain) {
      const anotherImage = await prisma.productImage.findFirst({
        where: {
          productId: image.productId,
          id: { not: imageId }
        }
      });
      
      if (anotherImage) {
        await prisma.productImage.update({
          where: { id: anotherImage.id },
          data: { isMain: true }
        });
      }
    }
    
    // Delete from database
    await prisma.productImage.delete({
      where: { id: imageId }
    });
    
    sendSuccessResponse(res, { message: 'Image deleted successfully' });
  } catch (error) {
    handleServerError(res, error);
  }
};

/**
 * @desc    Set image as main product image
 * @route   PUT /api/product-images/:id/main
 * @access  Private/Admin
 */
export const setMainProductImage = async (req: Request, res: Response) => {
  try {
    const imageId = parseIdParam(req.params.id);
    
    // Get image details
    const image = await prisma.productImage.findUnique({
      where: { id: imageId },
      include: { product: true }
    });
    
    if (!image) {
      return sendErrorResponse(res, 'Image not found', 404);
    }
    
    // Update all images for this product to not be main
    await prisma.productImage.updateMany({
      where: { productId: image.productId },
      data: { isMain: false }
    });
    
    // Set this image as main
    await prisma.productImage.update({
      where: { id: imageId },
      data: { isMain: true }
    });
    
    sendSuccessResponse(res, { message: 'Main image updated successfully' });
  } catch (error) {
    handleServerError(res, error);
  }
}; 