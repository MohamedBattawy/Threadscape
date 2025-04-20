import Link from "next/link";
import { notFound } from "next/navigation";
import ImageWithFallback from "../../../components/ImageWithFallback";
import { allProducts } from "../../../utils/productData";

export const dynamicParams = true;

export async function generateMetadata({ params }: { params: { id: string } }) {
  const product = allProducts.find(p => p.id === params.id);
  
  if (!product) {
    return {
      title: "Product Not Found",
      description: "The requested product could not be found.",
    };
  }
  
  return {
    title: `${product.name} | Threadscape`,
    description: product.description,
  };
}

export default function ProductPage({ params }: { params: { id: string } }) {
  const product = allProducts.find(p => p.id === params.id);
  
  if (!product) {
    notFound();
  }

  // Extract category from ID for breadcrumb navigation
  const categoryId = product.id.split('-')[0];
  
  // Map category IDs to display names
  const categoryNames: { [key: string]: string } = {
    "mens": "Men's Collection",
    "womens": "Women's Collection",
    "accessories": "Accessories"
  };

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Breadcrumbs */}
      <nav className="flex mb-8 text-sm">
        <Link href="/" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">Home</Link>
        <span className="mx-2 text-gray-500 dark:text-gray-400">/</span>
        <Link href="/shop" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">Shop</Link>
        <span className="mx-2 text-gray-500 dark:text-gray-400">/</span>
        <Link href={`/shop/${categoryId}`} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
          {categoryNames[categoryId] || categoryId}
        </Link>
        <span className="mx-2 text-gray-500 dark:text-gray-400">/</span>
        <span className="text-gray-900 dark:text-white">{product.name}</span>
      </nav>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Product Image */}
        <div className="relative h-[500px] bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
          <ImageWithFallback 
            src={product.imageSrc} 
            alt={product.name} 
            fill 
            className="object-contain"
          />
        </div>
        
        {/* Product Details */}
        <div>
          <h1 className="text-3xl font-semibold mb-4">{product.name}</h1>
          <p className="text-2xl font-bold mb-6">${product.price.toFixed(2)}</p>
          
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-2">Description</h2>
            <p className="text-gray-600 dark:text-gray-400">
              {product.description}
            </p>
            <p className="text-gray-600 dark:text-gray-400 mt-4">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
          </div>
          
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-2">Size</h2>
            <div className="flex gap-2">
              {["XS", "S", "M", "L", "XL"].map((size) => (
                <button 
                  key={size} 
                  className="w-12 h-12 flex items-center justify-center border border-gray-300 rounded-md hover:border-black"
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
          
          <button className="w-full bg-black dark:bg-white text-white dark:text-black py-3 px-6 rounded-md font-medium text-lg hover:bg-gray-900 dark:hover:bg-gray-100 transition-colors mb-4">
            Add to Cart
          </button>
          
          <button className="w-full bg-transparent border border-black dark:border-white text-black dark:text-white py-3 px-6 rounded-md font-medium text-lg hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors">
            Add to Wishlist
          </button>
        </div>
      </div>
    </div>
  );
} 