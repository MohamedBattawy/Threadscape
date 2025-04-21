import { NextRequest, NextResponse } from 'next/server';
import { getProducts } from '../../utils/api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') ? parseInt(searchParams.get('page') as string) : 1;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit') as string) : 12;
    const sort = searchParams.get('sort') || 'newest';
    const category = searchParams.get('category');
    
    // Use the centralized API function
    const data = await getProducts({
      page,
      limit,
      sort,
      category: category || null
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