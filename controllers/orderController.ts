import { Request, Response } from 'express';
import { PrismaClient } from '../src/generated/prisma';
import { parseIdParam } from '../utils/queryHelpers';
import { handleServerError, sendErrorResponse, sendSuccessResponse } from '../utils/responseHandlers';

const prisma = new PrismaClient();

/**
 * @desc    Get all orders for current user
 * @route   GET /api/orders
 * @access  Private
 */
export const getUserOrders = async (req: Request, res: Response) => {
  try {
    // Get user ID from auth middleware
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return sendErrorResponse(res, 'User not authenticated', 401);
    }
    
    // Get pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    // Get total count for pagination
    const totalCount = await prisma.order.count({
      where: { userId }
    });
    
    // Get orders with pagination
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        orderItems: {
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
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    });
    
    sendSuccessResponse(res, orders, 200, {
      count: orders.length,
      totalPages: Math.ceil(totalCount / limit),
      page
    });
  } catch (error) {
    handleServerError(res, error);
  }
};

/**
 * @desc    Get single order by ID
 * @route   GET /api/orders/:id
 * @access  Private
 */
export const getOrderById = async (req: Request, res: Response) => {
  try {
    // Get user ID from auth middleware
    const userId = (req as any).user?.id;
    const isAdmin = (req as any).user?.role === 'ADMIN';
    
    if (!userId) {
      return sendErrorResponse(res, 'User not authenticated', 401);
    }
    
    const orderId = parseIdParam(req.params.id);
    
    // Get order with items
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
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
        }
      }
    });
    
    if (!order) {
      return sendErrorResponse(res, 'Order not found', 404);
    }
    
    // Check if order belongs to user or user is admin
    if (order.userId !== userId && !isAdmin) {
      return sendErrorResponse(res, 'Not authorized to view this order', 403);
    }
    
    sendSuccessResponse(res, order);
  } catch (error) {
    handleServerError(res, error);
  }
};

/**
 * @desc    Create a new order
 * @route   POST /api/orders
 * @access  Private
 */
export const createOrder = async (req: Request, res: Response) => {
  try {
    // Get user ID from auth middleware
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return sendErrorResponse(res, 'User not authenticated', 401);
    }
    
    // Start a transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Get user's cart items
      const cartItems = await prisma.cartItem.findMany({
        where: { userId },
        include: {
          product: true
        }
      });
      
      if (cartItems.length === 0) {
        throw new Error('Cart is empty');
      }
      
      // Validate inventory and active products
      for (const item of cartItems) {
        const { product, quantity } = item;
        
        if (!product.isActive) {
          throw new Error(`Product "${product.name}" is no longer available`);
        }
        
        if (product.inventory < quantity) {
          throw new Error(`Insufficient inventory for "${product.name}". Only ${product.inventory} available.`);
        }
      }
      
      // Calculate total price
      const total = cartItems.reduce((sum, item) => {
        return sum + (Number(item.product.price) * item.quantity);
      }, 0);
      
      // Create the order
      const order = await prisma.order.create({
        data: {
          userId,
          total,
          status: 'PENDING',
          orderItems: {
            create: cartItems.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price
            }))
          }
        },
        include: {
          orderItems: true
        }
      });
      
      // Update product inventory
      for (const item of cartItems) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            inventory: {
              decrement: item.quantity
            }
          }
        });
      }
      
      // Clear the user's cart
      await prisma.cartItem.deleteMany({
        where: { userId }
      });
      
      return order;
    });
    
    sendSuccessResponse(res, {
      message: 'Order created successfully',
      order: result
    }, 201);
  } catch (error) {
    if (error instanceof Error) {
      return sendErrorResponse(res, error.message, 400);
    }
    handleServerError(res, error);
  }
};

/**
 * @desc    Cancel an order
 * @route   PUT /api/orders/:id/cancel
 * @access  Private
 */
export const cancelOrder = async (req: Request, res: Response) => {
  try {
    // Get user ID from auth middleware
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return sendErrorResponse(res, 'User not authenticated', 401);
    }
    
    const orderId = parseIdParam(req.params.id);
    
    // Get the order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true }
    });
    
    if (!order) {
      return sendErrorResponse(res, 'Order not found', 404);
    }
    
    // Check if order belongs to user
    if (order.userId !== userId) {
      return sendErrorResponse(res, 'Not authorized to cancel this order', 403);
    }
    
    // Check if order can be cancelled (only PENDING orders can be cancelled)
    if (order.status !== 'PENDING') {
      return sendErrorResponse(res, `Cannot cancel order with status "${order.status}"`, 400);
    }
    
    // Start a transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Update order status
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: { status: 'CANCELLED' }
      });
      
      // Restore inventory
      for (const item of order.orderItems) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            inventory: {
              increment: item.quantity
            }
          }
        });
      }
      
      return updatedOrder;
    });
    
    sendSuccessResponse(res, {
      message: 'Order cancelled successfully',
      order: result
    });
  } catch (error) {
    handleServerError(res, error);
  }
};

/**
 * @desc    Update order status (Admin only)
 * @route   PUT /api/orders/:id/status
 * @access  Private/Admin
 */
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    // Check if user is admin
    const isAdmin = (req as any).user?.role === 'ADMIN';
    
    if (!isAdmin) {
      return sendErrorResponse(res, 'Not authorized to update order status', 403);
    }
    
    const orderId = parseIdParam(req.params.id);
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!status || !validStatuses.includes(status)) {
      return sendErrorResponse(res, 'Invalid order status', 400);
    }
    
    // Get the order
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });
    
    if (!order) {
      return sendErrorResponse(res, 'Order not found', 404);
    }
    
    // If moving from cancelled to another status or to cancelled, handle inventory
    if (order.status === 'CANCELLED' && status !== 'CANCELLED') {
      // Get order items
      const orderItems = await prisma.orderItem.findMany({
        where: { orderId }
      });
      
      // Start a transaction
      const result = await prisma.$transaction(async (prisma) => {
        // Update order status
        const updatedOrder = await prisma.order.update({
          where: { id: orderId },
          data: { status }
        });
        
        // Deduct inventory again
        for (const item of orderItems) {
          await prisma.product.update({
            where: { id: item.productId },
            data: {
              inventory: {
                decrement: item.quantity
              }
            }
          });
        }
        
        return updatedOrder;
      });
      
      sendSuccessResponse(res, {
        message: 'Order status updated successfully',
        order: result
      });
    } else if (order.status !== 'CANCELLED' && status === 'CANCELLED') {
      // Get order items
      const orderItems = await prisma.orderItem.findMany({
        where: { orderId }
      });
      
      // Start a transaction
      const result = await prisma.$transaction(async (prisma) => {
        // Update order status
        const updatedOrder = await prisma.order.update({
          where: { id: orderId },
          data: { status }
        });
        
        // Restore inventory
        for (const item of orderItems) {
          await prisma.product.update({
            where: { id: item.productId },
            data: {
              inventory: {
                increment: item.quantity
              }
            }
          });
        }
        
        return updatedOrder;
      });
      
      sendSuccessResponse(res, {
        message: 'Order status updated successfully',
        order: result
      });
    } else {
      // Simple status update
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: { status }
      });
      
      sendSuccessResponse(res, {
        message: 'Order status updated successfully',
        order: updatedOrder
      });
    }
  } catch (error) {
    handleServerError(res, error);
  }
};

/**
 * @desc    Get all orders (Admin only)
 * @route   GET /api/orders/admin
 * @access  Private/Admin
 */
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    // Check if user is admin
    const isAdmin = (req as any).user?.role === 'ADMIN';
    
    if (!isAdmin) {
      return sendErrorResponse(res, 'Not authorized to view all orders', 403);
    }
    
    // Get pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    // Get status filter
    const status = req.query.status as any;
    const whereClause = status ? { status } : {};
    
    // Get total count for pagination
    const totalCount = await prisma.order.count({
      where: whereClause as any
    });
    
    // Get orders with pagination
    const orders = await prisma.order.findMany({
      where: whereClause as any,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    });
    
    sendSuccessResponse(res, orders, 200, {
      count: orders.length,
      totalPages: Math.ceil(totalCount / limit),
      page
    });
  } catch (error) {
    handleServerError(res, error);
  }
};

/**
 * @desc    Mark order as fulfilled (delivered) by user
 * @route   PUT /api/orders/:id/fulfill
 * @access  Private
 */
export const fulfillOrder = async (req: Request, res: Response) => {
  try {
    // Get user ID from auth middleware
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return sendErrorResponse(res, 'User not authenticated', 401);
    }
    
    const orderId = parseIdParam(req.params.id);
    
    // Get the order
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });
    
    if (!order) {
      return sendErrorResponse(res, 'Order not found', 404);
    }
    
    // Check if order belongs to user
    if (order.userId !== userId) {
      return sendErrorResponse(res, 'Not authorized to update this order', 403);
    }
    
    // Update order status to DELIVERED
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: 'DELIVERED' }
    });
    
    sendSuccessResponse(res, {
      message: 'Order marked as delivered successfully',
      order: updatedOrder
    });
  } catch (error) {
    handleServerError(res, error);
  }
};

/**
 * @desc    Update order status by user (limited options)
 * @route   PUT /api/orders/:id/update-status
 * @access  Private
 */
export const updateOrderStatusByUser = async (req: Request, res: Response) => {
  try {
    // Get user ID from auth middleware
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return sendErrorResponse(res, 'User not authenticated', 401);
    }
    
    const orderId = parseIdParam(req.params.id);
    const { status } = req.body;
    
    // Define allowed status transitions for regular users
    // Users can only transition to CANCELLED (if order is PENDING)
    // or to DELIVERED (if order is SHIPPED)
    const allowedTransitions: Record<string, string[]> = {
      'PENDING': ['CANCELLED'],
      'SHIPPED': ['DELIVERED']
    };
    
    // Get the order
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });
    
    if (!order) {
      return sendErrorResponse(res, 'Order not found', 404);
    }
    
    // Check if order belongs to user
    if (order.userId !== userId) {
      return sendErrorResponse(res, 'Not authorized to update this order', 403);
    }
    
    // Check if the requested status transition is allowed
    const currentStatus = order.status;
    const allowedStatuses = allowedTransitions[currentStatus] || [];
    
    if (!status || !allowedStatuses.includes(status)) {
      return sendErrorResponse(res, 
        `Cannot change order status from ${currentStatus} to ${status}. Allowed statuses: ${allowedStatuses.join(', ')}`, 
        400
      );
    }
    
    // If changing to CANCELLED, restore inventory
    if (status === 'CANCELLED') {
      // Get order items
      const orderItems = await prisma.orderItem.findMany({
        where: { orderId }
      });
      
      // Start a transaction
      const result = await prisma.$transaction(async (prisma) => {
        // Update order status
        const updatedOrder = await prisma.order.update({
          where: { id: orderId },
          data: { status }
        });
        
        // Restore inventory
        for (const item of orderItems) {
          await prisma.product.update({
            where: { id: item.productId },
            data: {
              inventory: {
                increment: item.quantity
              }
            }
          });
        }
        
        return updatedOrder;
      });
      
      sendSuccessResponse(res, {
        message: 'Order cancelled successfully',
        order: result
      });
    } else {
      // Simple status update (for DELIVERED)
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: { status }
      });
      
      sendSuccessResponse(res, {
        message: `Order marked as ${status.toLowerCase()} successfully`,
        order: updatedOrder
      });
    }
  } catch (error) {
    handleServerError(res, error);
  }
}; 