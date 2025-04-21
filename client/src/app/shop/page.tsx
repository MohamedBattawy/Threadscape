"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ImageWithFallback from "../components/ImageWithFallback";
import { getFeaturedProducts } from "../utils/api";

const categories = [
  {
    id: "mens",
    title: "Men's Collection",
    description: "Sophisticated essentials for the modern man",
    image: "/mens-collection.jpg"
  },
  {
    id: "womens",
    title: "Women's Collection",
    description: "Timeless elegance meets contemporary design",
    image: "/womens-collection.jpg"
  },
  {
    id: "accessories",
    title: "Accessories",
    description: "Complete your look with our premium accessories",
    image: "/accessories.jpg"
  }
];

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  images: Array<{
    id: number;
    url: string;
    isMain: boolean;
  }>;
  avgRating: number;
  numReviews: number;
};

export default function Shop() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeaturedProducts = async () => {
      try {
        setLoading(true);
        const response = await getFeaturedProducts();
        if (response.success && response.data.products) {
          setFeaturedProducts(response.data.products);
        }
      } catch (error) {
        console.error("Error loading featured products:", error);
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedProducts();
  }, []);

  return (
    <div className="flex flex-col">
      {/* Shop Hero */}
      <section className="relative bg-neutral-100 dark:bg-neutral-900 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Shop Collections</h1>
            <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300">
              Explore our curated collections designed for every style and occasion
            </p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-white dark:bg-black">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.map((category) => (
              <div key={category.id} className="group relative overflow-hidden rounded-lg">
                <div className="aspect-w-4 aspect-h-5 h-96 relative">
                  <ImageWithFallback 
                    src={category.image} 
                    alt={category.title} 
                    fill 
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-2xl font-medium text-white mb-2">{category.title}</h3>
                  <p className="text-white/80 mb-4">{category.description}</p>
                  <Link 
                    href={`/shop/${category.id}`} 
                    className="inline-block bg-white text-black py-2 px-4 rounded-md font-medium hover:bg-gray-100 transition-colors"
                  >
                    Shop Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-semibold mb-12 text-center">Featured Products</h2>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="mb-4 aspect-w-1 aspect-h-1 bg-gray-300 dark:bg-gray-700 rounded-lg h-80"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <Link 
                  key={product.id} 
                  href={`/shop/product/${product.id}`} 
                  className="group"
                >
                  <div className="mb-4 aspect-w-1 aspect-h-1 bg-gray-200 rounded-lg overflow-hidden relative">
                    <div className="h-80 relative">
                      <ImageWithFallback 
                        src={product.images?.[0]?.url || "/placeholder-product.jpg"} 
                        alt={product.name} 
                        fill
                        className="object-cover object-center transition-opacity group-hover:opacity-75"
                      />
                    </div>
                  </div>
                  <h3 className="text-lg font-medium">{product.name}</h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-2 line-clamp-2">{product.description}</p>
                  <p className="font-medium">${parseFloat(product.price.toString()).toFixed(2)}</p>
                  {product.avgRating > 0 && (
                    <div className="flex items-center mt-1">
                      <div className="flex items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(product.avgRating)
                                ? "text-yellow-400"
                                : i < product.avgRating
                                ? "text-yellow-300"
                                : "text-gray-300 dark:text-gray-600"
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-gray-600 dark:text-gray-400 text-sm ml-2">
                        ({product.numReviews})
                      </span>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
} 