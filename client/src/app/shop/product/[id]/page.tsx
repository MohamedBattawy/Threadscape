"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ImageWithFallback from "../../../components/ImageWithFallback";
import { useCart } from "../../../context/CartContext";
import { addToCart, getProductById } from "../../../utils/api";

// Define product type
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

// Helper function to format price
const formatPrice = (price: number | string): string => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(numPrice)) {
    return '$0.00';
  }
  return `$${numPrice.toFixed(2)}`;
};

// Map category IDs to display names
const categoryNames: { [key: string]: string } = {
  "MENS": "Men's Collection",
  "WOMENS": "Women's Collection",
  "ACCESSORIES": "Accessories"
};

export default function ProductPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addToCartSuccess, setAddToCartSuccess] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { refreshCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    // Set document title based on product name when it loads
    if (product) {
      document.title = `${product.name} | Threadscape`;
    }
  }, [product]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await getProductById(params.id);
        if (data.success && data.data) {
          setProduct(data.data);
        } else {
          setError("Failed to load product");
          router.push("/404");
        }
      } catch (err) {
        setError("Failed to load product");
        console.error("Error fetching product:", err);
        router.push("/404");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.id, router]);

  const handleAddToCart = async () => {
    if (!product || product.inventory <= 0) return;

    try {
      setAddingToCart(true);
      await addToCart({ 
        productId: product.id,
        quantity: quantity 
      });
      
      setAddToCartSuccess(true);
      // Reset success message after 3 seconds
      setTimeout(() => setAddToCartSuccess(false), 3000);
      
      // Refresh cart data to update the badge count
      await refreshCart();
    } catch (err) {
      console.error("Error adding to cart:", err);
      setError("Failed to add item to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!product) {
    return null; // Router will redirect to 404
  }

  // Get category for breadcrumb navigation
  const category = product.category.toLowerCase();
  
  return (
    <div className="container mx-auto px-4 py-16">
      {/* Breadcrumbs */}
      <nav className="flex mb-8 text-sm">
        <Link href="/" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">Home</Link>
        <span className="mx-2 text-gray-500 dark:text-gray-400">/</span>
        <Link href="/shop" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">Shop</Link>
        <span className="mx-2 text-gray-500 dark:text-gray-400">/</span>
        <Link href={`/shop/${category}`} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
          {categoryNames[product.category] || product.category}
        </Link>
        <span className="mx-2 text-gray-500 dark:text-gray-400">/</span>
        <span className="text-gray-900 dark:text-white">{product.name}</span>
      </nav>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="relative h-[500px] bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
            <ImageWithFallback 
              src={product.images?.[selectedImageIndex]?.url || "/stats.png"} 
              alt={product.name} 
              fill 
              className="object-contain"
            />
          </div>
          
          {/* Image Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {product.images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative w-20 h-20 border-2 rounded overflow-hidden 
                    ${index === selectedImageIndex 
                      ? 'border-black dark:border-white' 
                      : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'}`}
                >
                  <ImageWithFallback
                    src={image.url}
                    alt={`${product.name} - view ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Product Details */}
        <div>
          <h1 className="text-3xl font-semibold mb-4">{product.name}</h1>
          
          {/* Rating display if available */}
          {product.avgRating !== undefined && (
            <div className="flex items-center mb-4">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-5 h-5 ${
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
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                ({product.numReviews || 0} reviews)
              </span>
            </div>
          )}
          
          {product.inventory > 0 ? (
            <p className="text-2xl font-bold mb-6">{formatPrice(product.price)}</p>
          ) : (
            <p className="text-xl font-bold text-red-600 mb-6">Out of Stock</p>
          )}
          
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-2">Description</h2>
            <p className="text-gray-600 dark:text-gray-400">
              {product.description}
            </p>
          </div>
          
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-2">Size</h2>
            <div className="flex gap-2">
              {["XS", "S", "M", "L", "XL"].map((size) => (
                <button 
                  key={size} 
                  className={`w-12 h-12 flex items-center justify-center border ${
                    selectedSize === size 
                      ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black' 
                      : 'border-gray-300 dark:border-gray-600 hover:border-black dark:hover:border-white'
                  } rounded-md`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-medium mb-2">Quantity</h2>
            <div className="flex border border-gray-300 dark:border-gray-600 rounded w-32">
              <button
                className="px-3 py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                disabled={quantity <= 1}
              >
                -
              </button>
              <input
                type="number"
                value={quantity}
                min="1"
                max={product.inventory}
                readOnly
                className="w-full text-center border-0 focus:ring-0 dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <button
                className="px-3 py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => quantity < product.inventory && setQuantity(quantity + 1)}
                disabled={quantity >= product.inventory}
              >
                +
              </button>
            </div>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-md">
              {error}
            </div>
          )}

          {addToCartSuccess && (
            <div className="mb-4 p-3 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 rounded-md">
              Product added to cart successfully!
            </div>
          )}
          
          <button 
            className={`w-full py-3 px-6 rounded-md font-medium text-lg mb-4 ${
              product.inventory > 0 
                ? 'bg-black dark:bg-white text-white dark:text-black hover:bg-gray-900 dark:hover:bg-gray-100' 
                : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            } transition-colors`}
            disabled={product.inventory <= 0 || addingToCart}
            onClick={handleAddToCart}
          >
            {addingToCart 
              ? 'Adding...' 
              : product.inventory > 0 
                ? 'Add to Cart' 
                : 'Out of Stock'
            }
          </button>
        </div>
      </div>
    </div>
  );
} 