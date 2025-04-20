import Pagination from "../../components/Pagination";
import ProductCard from "../../components/ProductCard";
import { getPaginatedProducts, getProductsByCategory } from "../../utils/productData";

export const dynamicParams = true;

export async function generateMetadata({ params }: { params: { category: string } }) {
  const category = params.category;
  const capitalizedCategory = category.charAt(0).toUpperCase() + category.slice(1);
  
  return {
    title: `${capitalizedCategory} | Threadscape`,
    description: `Shop our ${category} collection at Threadscape.`,
  };
}

export default function CategoryPage({ 
  params, 
  searchParams 
}: { 
  params: { category: string },
  searchParams: { page?: string } 
}) {
  const category = params.category;
  const currentPage = searchParams.page ? parseInt(searchParams.page) : 1;
  
  const products = getProductsByCategory(category);
  const { products: paginatedProducts, totalPages } = getPaginatedProducts(products, currentPage);
  
  // Map category IDs to display names
  const categoryNames: { [key: string]: string } = {
    "mens": "Men's Collection",
    "womens": "Women's Collection",
    "accessories": "Accessories"
  };
  
  const displayName = categoryNames[category] || category;

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-semibold mb-4">{displayName}</h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Explore our collection of high-quality {category} designed for style and comfort.
        </p>
      </div>
      
      {/* Filters - For visual purposes only, not functional in this demo */}
      <div className="mb-8 flex flex-wrap gap-2 justify-center">
        <button className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-700">
          All
        </button>
        <button className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-700">
          New Arrivals
        </button>
        <button className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-700">
          Best Sellers
        </button>
        <button className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-700">
          Price: Low to High
        </button>
        <button className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-700">
          Price: High to Low
        </button>
      </div>
      
      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {paginatedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      
      {/* Pagination */}
      <Pagination totalPages={totalPages} currentPage={currentPage} />
    </div>
  );
} 