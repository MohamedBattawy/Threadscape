"use client";

import Link from "next/link";
import ImageWithFallback from "./ImageWithFallback";

export type Product = {
  id: string;
  name: string;
  price: number | string;
  imageSrc: string;
  category: string;
  description: string;
  inventory?: number;
  avgRating?: number;
  numReviews?: number;
};

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const isOutOfStock = product.inventory !== undefined && product.inventory <= 0;
  
  // Ensure price is a number before using toFixed
  const formatPrice = (price: number | string): string => {
    // Convert to number if it's a string
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    
    // Check if it's a valid number
    if (isNaN(numPrice)) {
      return '$0.00';
    }
    
    return `$${numPrice.toFixed(2)}`;
  };
  
  return (
    <div className="group">
      <div className="mb-4 aspect-w-1 aspect-h-1 bg-gray-200 rounded-lg overflow-hidden relative">
        <div className="h-80 relative">
          <ImageWithFallback 
            src={product.imageSrc} 
            alt={product.name} 
            fill
            className={`object-cover object-center transition-opacity group-hover:opacity-75 ${isOutOfStock ? 'opacity-70' : ''}`}
          />
          
          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-red-600 text-white px-4 py-1 rounded-full font-medium text-sm">
                Out of Stock
              </span>
            </div>
          )}
        </div>
      </div>
      <Link href={`/shop/product/${product.id}`} className="block">
        <h3 className="text-lg font-medium hover:text-indigo-600 transition-colors">{product.name}</h3>
      </Link>
      
      {/* Show rating if available */}
      {product.avgRating !== undefined && (
        <div className="flex items-center mb-1">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                className={`w-4 h-4 ${
                  star <= Math.round(product.avgRating || 0)
                    ? 'text-yellow-400'
                    : 'text-gray-300 dark:text-gray-600'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
            ({product.numReviews || 0})
          </span>
        </div>
      )}
      
      <p className="text-gray-700 dark:text-gray-300 mb-2">{product.description}</p>
      
      {isOutOfStock ? (
        <p className="font-medium text-red-600">Out of Stock</p>
      ) : (
        <p className="font-medium">{formatPrice(product.price)}</p>
      )}
    </div>
  );
} 