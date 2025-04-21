"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Pagination from "../../components/Pagination";
import ProductCard from "../../components/ProductCard";

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  category: string;
  inventory: number;
  avgRating: number;
  numReviews: number;
  images: { id: number; url: string }[];
  isActive: boolean;
}

interface CategoryPageClientProps {
  category: string;
  initialPage: number;
  initialSort: string;
}

export default function CategoryPageClient({ 
  category,
  initialPage,
  initialSort
}: CategoryPageClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Use URL parameters if available (for client-side navigation), otherwise use props
  const currentPage = searchParams.get('page') 
    ? parseInt(searchParams.get('page') as string) 
    : initialPage;
    
  const sortBy = searchParams.get('sort') || initialSort;
  
  const [products, setProducts] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Map front-end category names to backend category enum values
  const categoryMapping: { [key: string]: string } = {
    "mens": "MENS",
    "womens": "WOMENS",
    "accessories": "ACCESSORIES"
  };
  
  // Map category IDs to display names
  const categoryNames: { [key: string]: string } = {
    "mens": "Men's Collection",
    "womens": "Women's Collection",
    "accessories": "Accessories"
  };
  
  const displayName = categoryNames[category] || category;
  
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const backendCategory = categoryMapping[category];
        if (!backendCategory) {
          throw new Error("Invalid category");
        }
        
        const response = await fetch(
          `/api/products/category/${backendCategory}?page=${currentPage}&sort=${sortBy}`
        );
        
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        
        const result = await response.json();
        
        // Check different possible response structures
        if (result.data && Array.isArray(result.data.products)) {
          // Format: { data: { products: [...] }, meta: { totalPages: number } }
          setProducts(result.data.products);
          setTotalPages(result.meta?.totalPages || Math.ceil(result.data.total / 12));
        } else if (result.data && Array.isArray(result.data)) {
          // Format: { data: [...], meta: { ... } }
          setProducts(result.data);
          setTotalPages(result.meta?.totalPages || 1);
        } else if (Array.isArray(result.products)) {
          // Format: { products: [...], totalPages: number }
          setProducts(result.products);
          setTotalPages(result.totalPages || Math.ceil(result.total / 12));
        } else {
          console.error("Unexpected API response format:", result);
          throw new Error("Invalid API response format");
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err instanceof Error ? err.message : "Failed to load products");
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [category, currentPage, sortBy]);
  
  const handleSortChange = (newSortValue: string) => {
    // Navigate to the same page but with updated sort parameter
    router.push(`/shop/${category}?page=${currentPage}&sort=${newSortValue}`);
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-semibold mb-4">{displayName}</h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Explore our collection of high-quality {category} designed for style and comfort.
        </p>
      </div>
      
      {/* Filters - Now functional for sorting */}
      <div className="mb-8 flex flex-wrap gap-2 justify-center">
        <button 
          className={`px-4 py-2 rounded-full text-sm ${
            sortBy === 'newest' 
              ? 'bg-indigo-600 text-white' 
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
          onClick={() => handleSortChange('newest')}
        >
          Newest
        </button>
        <button 
          className={`px-4 py-2 rounded-full text-sm ${
            sortBy === 'price-asc' 
              ? 'bg-indigo-600 text-white' 
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
          onClick={() => handleSortChange('price-asc')}
        >
          Price: Low to High
        </button>
        <button 
          className={`px-4 py-2 rounded-full text-sm ${
            sortBy === 'price-desc' 
              ? 'bg-indigo-600 text-white' 
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
          onClick={() => handleSortChange('price-desc')}
        >
          Price: High to Low
        </button>
        <button 
          className={`px-4 py-2 rounded-full text-sm ${
            sortBy === 'rating' 
              ? 'bg-indigo-600 text-white' 
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
          onClick={() => handleSortChange('rating')}
        >
          Highest Rated
        </button>
      </div>
      
      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      )}
      
      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-400 p-4 my-8">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Empty State */}
      {!loading && !error && products.length === 0 && (
        <div className="text-center py-16">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No products found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Try changing your filter or check back later.
          </p>
        </div>
      )}
      
      {/* Products Grid */}
      {!loading && !error && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard 
              key={product.id} 
              product={{
                id: product.id.toString(),
                name: product.name,
                price: product.price,
                imageSrc: product.images?.[0]?.url || "/stats.png",
                category: product.category.toLowerCase(),
                description: product.description,
                inventory: product.inventory,
                avgRating: product.avgRating,
                numReviews: product.numReviews
              }} 
            />
          ))}
        </div>
      )}
      
      {/* Pagination */}
      {!loading && !error && totalPages > 1 && (
        <Pagination totalPages={totalPages} currentPage={currentPage} />
      )}
    </div>
  );
} 