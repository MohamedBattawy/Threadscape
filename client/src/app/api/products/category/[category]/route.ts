import { NextRequest, NextResponse } from 'next/server';
import { getProductsByCategory } from '../../../../utils/api';

export async function GET(
  request: NextRequest,
  { params }: { params: { category: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') ? parseInt(searchParams.get('page') as string) : 1;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit') as string) : 12;
    const sort = searchParams.get('sort') || 'newest';
    
    // In async functions, we should await the params even though they may not be promises
    const category = params.category;
    
    // Use the centralized API function
    const data = await getProductsByCategory({
      category,
      page,
      limit,
      sort
    });
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch products', 
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 