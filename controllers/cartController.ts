import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { parseIdParam } from '../utils/queryHelpers';
import { handleServerError, sendErrorResponse, sendSuccessResponse } from '../utils/responseHandlers';

const prisma = new PrismaClient();

/**
 * @desc    Get current user's cart
 * @route   GET /api/cart
 * @access  Private
 */
export const getCart = async (req: Request, res: Response) => {
  try {
    // Get user ID from auth middleware
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return sendErrorResponse(res, 'User not authenticated', 401);
    }
    
    // Get cart items with product details
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            images: {
              where: { isMain: true },
              take: 1
            }
          }
        }
      }
    });
    
    // Format response data
    const formattedCart = cartItems.map(item => {
      const { product, ...cartItemDetails } = item;
      
      // Check if product is active
      if (!product.isActive) {
        return {
          ...cartItemDetails,
          product: {
            ...product,
            images: product.images,
            status: 'discontinued',
            message: 'This product is no longer available'
          }
        };
      }
      
      // Check if enough inventory
      const inventoryStatus = product.inventory >= item.quantity 
        ? 'in_stock' 
        : product.inventory > 0 
          ? 'limited_stock' 
          : 'out_of_stock';
      
      return {
        ...cartItemDetails,
        product: {
          ...product,
          images: product.images,
          status: inventoryStatus
        }
      };
    });
    
    // Calculate cart totals
    const subtotal = cartItems.reduce((sum, item) => {
      return sum + (Number(item.product.price) * item.quantity);
    }, 0);
    
    sendSuccessResponse(res, {
      items: formattedCart,
      itemCount: cartItems.length,
      subtotal
    });
  } catch (error) {
    handleServerError(res, error);
  }
};

/**
 * @desc    Add item to cart
 * @route   POST /api/cart
 * @access  Private
 */
export const addToCart = async (req: Request, res: Response) => {
  try {
    // Get user ID from auth middleware
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return sendErrorResponse(res, 'User not authenticated', 401);
    }
    
    const { productId, quantity = 1 } = req.body;
    
    if (!productId) {
      return sendErrorResponse(res, 'Product ID is required', 400);
    }
    
    // Validate quantity
    const parsedQuantity = parseInt(quantity);
    if (isNaN(parsedQuantity) || parsedQuantity < 1) {
      return sendErrorResponse(res, 'Quantity must be a positive number', 400);
    }
    
    // Check if product exists and is active
    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) }
    });
    
    if (!product) {
      return sendErrorResponse(res, 'Product not found', 404);
    }
    
    if (!product.isActive) {
      return sendErrorResponse(res, 'This product is no longer available', 400);
    }
    
    // Check inventory
    if (product.inventory < parsedQuantity) {
      return sendErrorResponse(res, 
        `Insufficient inventory. Only ${product.inventory} items available.`, 
        400
      );
    }
    
    // Check if item is already in cart
    const existingCartItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId: parseInt(productId)
        }
      }
    });
    
    let cartItem;
    
    if (existingCartItem) {
      // Update quantity
      const newQuantity = existingCartItem.quantity + parsedQuantity;
      
      // Check if new quantity exceeds inventory
      if (newQuantity > product.inventory) {
        return sendErrorResponse(res, 
          `Cannot add ${parsedQuantity} more units. Only ${product.inventory - existingCartItem.quantity} more units available.`, 
          400
        );
      }
      
      cartItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: newQuantity }
      });
      
      sendSuccessResponse(res, {
        message: 'Cart updated successfully',
        cartItem
      });
    } else {
      // Add new item to cart
      cartItem = await prisma.cartItem.create({
        data: {
          userId,
          productId: parseInt(productId),
          quantity: parsedQuantity
        }
      });
      
      sendSuccessResponse(res, {
        message: 'Item added to cart',
        cartItem
      }, 201);
    }
  } catch (error) {
    handleServerError(res, error);
  }
};

/**
 * @desc    Update cart item quantity
 * @route   PUT /api/cart/:id
 * @access  Private
 */
export const updateCartItem = async (req: Request, res: Response) => {
  try {
    // Get user ID from auth middleware
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return sendErrorResponse(res, 'User not authenticated', 401);
    }
    
    const cartItemId = parseIdParam(req.params.id);
    const { quantity } = req.body;
    
    if (!quantity) {
      return sendErrorResponse(res, 'Quantity is required', 400);
    }
    
    // Validate quantity
    const parsedQuantity = parseInt(quantity);
    if (isNaN(parsedQuantity) || parsedQuantity < 1) {
      return sendErrorResponse(res, 'Quantity must be a positive number', 400);
    }
    
    // Check if cart item exists and belongs to user
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: cartItemId,
        userId
      },
      include: {
        product: true
      }
    });
    
    if (!cartItem) {
      return sendErrorResponse(res, 'Cart item not found', 404);
    }
    
    // Check inventory
    if (cartItem.product.inventory < parsedQuantity) {
      return sendErrorResponse(res, 
        `Insufficient inventory. Only ${cartItem.product.inventory} items available.`, 
        400
      );
    }
    
    // Update cart item
    const updatedCartItem = await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity: parsedQuantity }
    });
    
    sendSuccessResponse(res, {
      message: 'Cart updated successfully',
      cartItem: updatedCartItem
    });
  } catch (error) {
    handleServerError(res, error);
  }
};

/**
 * @desc    Remove item from cart
 * @route   DELETE /api/cart/:id
 * @access  Private
 */
export const removeFromCart = async (req: Request, res: Response) => {
  try {
    // Get user ID from auth middleware
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return sendErrorResponse(res, 'User not authenticated', 401);
    }
    
    const cartItemId = parseIdParam(req.params.id);
    
    // Check if cart item exists and belongs to user
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: cartItemId,
        userId
      }
    });
    
    if (!cartItem) {
      return sendErrorResponse(res, 'Cart item not found', 404);
    }
    
    // Remove item from cart
    await prisma.cartItem.delete({
      where: { id: cartItemId }
    });
    
    sendSuccessResponse(res, {
      message: 'Item removed from cart'
    });
  } catch (error) {
    handleServerError(res, error);
  }
};

/**
 * @desc    Clear the entire cart
 * @route   DELETE /api/cart
 * @access  Private
 */
export const clearCart = async (req: Request, res: Response) => {
  try {
    // Get user ID from auth middleware
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return sendErrorResponse(res, 'User not authenticated', 401);
    }
    
    // Delete all cart items for the user
    await prisma.cartItem.deleteMany({
      where: { userId }
    });
    
    sendSuccessResponse(res, {
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    handleServerError(res, error);
  }
}; 