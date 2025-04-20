"use client";

import Link from "next/link";
import ImageWithFallback from "./ImageWithFallback";

export type Product = {
  id: string;
  name: string;
  price: number;
  imageSrc: string;
  category: string;
  description: string;
};

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="group">
      <div className="mb-4 aspect-w-1 aspect-h-1 bg-gray-200 rounded-lg overflow-hidden relative">
        <div className="h-80 relative">
          <ImageWithFallback 
            src={product.imageSrc} 
            alt={product.name} 
            fill
            className="object-cover object-center transition-opacity group-hover:opacity-75"
          />
        </div>
      </div>
      <Link href={`/shop/product/${product.id}`} className="block">
        <h3 className="text-lg font-medium hover:text-indigo-600 transition-colors">{product.name}</h3>
      </Link>
      <p className="text-gray-700 dark:text-gray-300 mb-2">{product.description}</p>
      <p className="font-medium">${product.price.toFixed(2)}</p>
    </div>
  );
} 