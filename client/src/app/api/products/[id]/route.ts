import { NextRequest, NextResponse } from 'next/server';
import { getProductById } from '../../../utils/api';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // In async functions, we should await the params even though they may not be promises
    const productId = params.id;
    
    // Use the centralized API function
    try {
      const data = await getProductById(productId);
      return NextResponse.json(data);
    } catch (error) {
      // If product not found, return 404
      if (error instanceof Error && error.message.includes('not found')) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch product', 
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 