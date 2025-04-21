import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { parseIdParam } from '../utils/queryHelpers';
import { handleServerError, sendErrorResponse, sendSuccessResponse } from '../utils/responseHandlers';

const prisma = new PrismaClient();

/**
 * @desc    Get 4 random featured products
 * @route   GET /api/products/featured
 * @access  Public
 */
export const getFeaturedProducts = async (req: Request, res: Response) => {
  try {
    // Get active products with inventory > 0
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        inventory: {
          gt: 0
        }
      },
      include: {
        images: true,
        ratings: {
          select: {
            value: true,
          },
        },
      }
    });

    // Shuffle the products array to randomize
    const shuffled = [...products].sort(() => 0.5 - Math.random());
    
    // Take the first 4 products
    const featuredProducts = shuffled.slice(0, 4);

    // Calculate average rating for each product
    const productsWithAvgRating = featuredProducts.map(product => {
      const ratings = product.ratings;
      const avgRating = ratings.length > 0
        ? ratings.reduce((sum, item) => sum + item.value, 0) / ratings.length
        : 0;
      
      return {
        ...product,
        ratings: undefined,
        avgRating: parseFloat(avgRating.toFixed(1)),
        numReviews: ratings.length,
      };
    });

    sendSuccessResponse(res, {
      products: productsWithAvgRating
    });
  } catch (error) {
    handleServerError(res, error);
  }
};

/**
 * @desc    Get all products
 * @route   GET /api/products
 * @access  Public
 */
export const getProducts = async (req: Request, res: Response) => {
  try {
    // Parse query parameters for filtering and pagination
    const category = req.query.category as any;  // Category filter
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;
    const includeInactive = req.query.includeInactive === 'true';
    
    // Parse sorting parameter
    const sort = (req.query.sort as string) || 'newest';
    
    // Define valid sort options
    const validSortOptions = ['newest', 'price-asc', 'price-desc', 'rating'];
    if (!validSortOptions.includes(sort)) {
      return sendErrorResponse(res, 
        `Invalid sort option. Valid options are: ${validSortOptions.join(', ')}`, 
        400
      );
    }
    
    // Build where clause for filtering
    const whereClause: Record<string, any> = {
      ...(category ? { category: category as any } : {}),
      // Only include active products unless includeInactive is true
      ...(includeInactive ? {} : { isActive: true })
    };
    
    // Get total count for pagination
    const totalCount = await prisma.product.count({
      where: whereClause
    });
    
    // Define orderBy based on sort parameter
    let orderBy: any = {};
    
    switch(sort) {
      case 'price-asc':
        orderBy = { price: 'asc' };
        break;
      case 'price-desc':
        orderBy = { price: 'desc' };
        break;
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' };
        break;
      // Rating will be handled after fetching products
    }
    
    // Get products with pagination
    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        images: true,
        ratings: {
          select: {
            value: true,
          },
        },
      },
      orderBy: sort !== 'rating' ? orderBy : undefined,
      skip,
      take: limit
    });

    // Calculate average rating for each product
    let productsWithAvgRating = products.map(product => {
      const ratings = product.ratings;
      const avgRating = ratings.length > 0
        ? ratings.reduce((sum, item) => sum + item.value, 0) / ratings.length
        : 0;
      
      return {
        ...product,
        ratings: undefined,
        avgRating: parseFloat(avgRating.toFixed(1)),
        numReviews: ratings.length,
      };
    });
    
    // If sorting by rating, we need to sort after calculating the average ratings
    if (sort === 'rating') {
      productsWithAvgRating = productsWithAvgRating.sort((a, b) => {
        // First sort by rating (descending)
        if (b.avgRating !== a.avgRating) {
          return b.avgRating - a.avgRating;
        }
        // If ratings are equal, sort by number of reviews (descending)
        return b.numReviews - a.numReviews;
      });
      
      // Apply pagination manually after sorting
      if (productsWithAvgRating.length > limit * page) {
        productsWithAvgRating = productsWithAvgRating.slice(skip, skip + limit);
      } else if (productsWithAvgRating.length > skip) {
        productsWithAvgRating = productsWithAvgRating.slice(skip);
      } else {
        productsWithAvgRating = [];
      }
    }

    sendSuccessResponse(res, {
      products: productsWithAvgRating,
      total: totalCount,
      sortBy: sort,
      ...(category ? { category } : {})
    }, 200, {
      count: productsWithAvgRating.length,
      totalPages: Math.ceil(totalCount / limit),
      page
    });
  } catch (error) {
    handleServerError(res, error);
  }
};

/**
 * @desc    Get a single product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
export const getProductById = async (req: Request, res: Response) => {
  try {
    const productId = parseIdParam(req.params.id);
    
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        images: true,
        ratings: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              }
            }
          }
        },
      },
    });
    
    if (!product) {
      return sendErrorResponse(res, 'Product not found', 404);
    }
    
    // Calculate average rating
    const ratings = product.ratings;
    const avgRating = ratings.length > 0
      ? ratings.reduce((sum, item) => sum + item.value, 0) / ratings.length
      : 0;
    
    const productWithAvgRating = {
      ...product,
      avgRating: parseFloat(avgRating.toFixed(1)),
      numReviews: ratings.length,
    };
    
    sendSuccessResponse(res, productWithAvgRating);
  } catch (error) {
    handleServerError(res, error);
  }
};

/**
 * @desc    Create a new product
 * @route   POST /api/products
 * @access  Private/Admin
 */
export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, price, category, inventory } = req.body;
    
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        category,
        inventory: parseInt(inventory)
      }
    });
    
    sendSuccessResponse(res, product, 201);
  } catch (error) {
    handleServerError(res, error);
  }
};

/**
 * @desc    Update a product
 * @route   PUT /api/products/:id
 * @access  Private/Admin
 */
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const productId = parseIdParam(req.params.id);
    const { name, description, price, category, inventory } = req.body;
    
    // Check if product exists
    const productExists = await prisma.product.findUnique({
      where: { id: productId }
    });
    
    if (!productExists) {
      return sendErrorResponse(res, 'Product not found', 404);
    }
    
    // Prepare update data
    const updateData: any = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (price) updateData.price = parseFloat(price);
    if (category) updateData.category = category;
    if (inventory !== undefined) updateData.inventory = parseInt(inventory);
    
    // Update product
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: updateData,
      include: { images: true }
    });
    
    sendSuccessResponse(res, updatedProduct);
  } catch (error) {
    handleServerError(res, error);
  }
};

/**
 * @desc    Discontinue a product (soft delete)
 * @route   PUT /api/products/:id/discontinue
 * @access  Private/Admin
 */
export const discontinueProduct = async (req: Request, res: Response) => {
  try {
    const productId = parseIdParam(req.params.id);
    
    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });
    
    if (!product) {
      return sendErrorResponse(res, 'Product not found', 404);
    }
    
    // Set product as inactive (soft delete)
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { 
        isActive: false,
        inventory: 0 // Also set inventory to 0 to prevent new purchases
      },
      include: { images: true }
    });
    
    sendSuccessResponse(res, {
      message: 'Product has been discontinued',
      product: updatedProduct
    });
  } catch (error) {
    handleServerError(res, error);
  }
};

/**
 * @desc    Restore a discontinued product
 * @route   PUT /api/products/:id/restore
 * @access  Private/Admin
 */
export const restoreProduct = async (req: Request, res: Response) => {
  try {
    const productId = parseIdParam(req.params.id);
    
    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });
    
    if (!product) {
      return sendErrorResponse(res, 'Product not found', 404);
    }
    
    // Set product as active again
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { isActive: true },
      include: { images: true }
    });
    
    sendSuccessResponse(res, {
      message: 'Product has been restored',
      product: updatedProduct
    });
  } catch (error) {
    handleServerError(res, error);
  }
};

/**
 * @desc    Get products by category
 * @route   GET /api/products/category/:category
 * @access  Public
 */
export const getProductsByCategory = async (req: Request, res: Response) => {
  try {
    const category = req.params.category as string;
    
    // Validate category
    const validCategories = ['MENS', 'WOMENS', 'ACCESSORIES'];
    if (!validCategories.includes(category.toUpperCase())) {
      return sendErrorResponse(res, `Invalid category. Valid categories are: ${validCategories.join(', ')}`, 400);
    }
    
    // Parse pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;
    
    // Parse sorting parameter
    const sort = (req.query.sort as string) || 'newest';
    
    // Define valid sort options
    const validSortOptions = ['newest', 'price-asc', 'price-desc', 'rating'];
    if (!validSortOptions.includes(sort)) {
      return sendErrorResponse(res, 
        `Invalid sort option. Valid options are: ${validSortOptions.join(', ')}`, 
        400
      );
    }
    
    // Build where clause for filtering - only active products and specific category
    const whereClause: Record<string, any> = {
      category: category.toUpperCase() as any,
      isActive: true
    };
    
    // Get total count for pagination
    const totalCount = await prisma.product.count({
      where: whereClause
    });
    
    // Define orderBy based on sort parameter
    let orderBy: any = {};
    
    switch(sort) {
      case 'price-asc':
        orderBy = { price: 'asc' };
        break;
      case 'price-desc':
        orderBy = { price: 'desc' };
        break;
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' };
        break;
      // Rating will be handled after fetching products
    }
    
    // Get products with pagination
    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        images: true,
        ratings: {
          select: {
            value: true,
          },
        },
      },
      orderBy: sort !== 'rating' ? orderBy : undefined,
      skip,
      take: limit
    });

    // Calculate average rating for each product
    let productsWithAvgRating = products.map(product => {
      const ratings = product.ratings;
      const avgRating = ratings.length > 0
        ? ratings.reduce((sum, item) => sum + item.value, 0) / ratings.length
        : 0;
      
      return {
        ...product,
        ratings: undefined,
        avgRating: parseFloat(avgRating.toFixed(1)),
        numReviews: ratings.length,
      };
    });
    
    // If sorting by rating, we need to sort after calculating the average ratings
    if (sort === 'rating') {
      productsWithAvgRating = productsWithAvgRating.sort((a, b) => {
        // First sort by rating (descending)
        if (b.avgRating !== a.avgRating) {
          return b.avgRating - a.avgRating;
        }
        // If ratings are equal, sort by number of reviews (descending)
        return b.numReviews - a.numReviews;
      });
      
      // Apply pagination manually after sorting
      if (productsWithAvgRating.length > limit * page) {
        productsWithAvgRating = productsWithAvgRating.slice(skip, skip + limit);
      } else if (productsWithAvgRating.length > skip) {
        productsWithAvgRating = productsWithAvgRating.slice(skip);
      } else {
        productsWithAvgRating = [];
      }
    }

    // Response with category data
    const responseData = {
      category: category.toUpperCase(),
      products: productsWithAvgRating,
      total: totalCount,
      sortBy: sort
    };

    sendSuccessResponse(res, responseData, 200, {
      count: productsWithAvgRating.length,
      totalPages: Math.ceil(totalCount / limit),
      page
    });
  } catch (error) {
    handleServerError(res, error);
  }
}; 