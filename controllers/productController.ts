import { Request, Response } from 'express';
import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        images: true,
        ratings: {
          select: {
            value: true,
          },
        },
      },
    });

    // Calculate average rating for each product
    const productsWithAvgRating = products.map(product => {
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

    res.status(200).json({
      success: true,
      count: products.length,
      data: productsWithAvgRating,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
}; 