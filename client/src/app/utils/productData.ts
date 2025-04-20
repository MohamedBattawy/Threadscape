import { Product } from "../components/ProductCard";

// Generate a set of fake products
export const generateProducts = (
  category: string,
  count: number,
  startId: number = 1
): Product[] => {
  return Array.from({ length: count }, (_, i) => {
    const id = `${category}-${startId + i}`;
    return {
      id,
      name: `${category.charAt(0).toUpperCase() + category.slice(1)} Item ${startId + i}`,
      price: Math.floor(Math.random() * 100) + 50,
      imageSrc: "/stats.png",
      category,
      description: `High-quality ${category} piece for your collection.`
    };
  });
};

// Create product data sets
export const mensProducts = generateProducts("mens", 24);
export const womensProducts = generateProducts("womens", 24);
export const accessoriesProducts = generateProducts("accessories", 24);

// Combined products for search or all products view
export const allProducts = [
  ...mensProducts,
  ...womensProducts,
  ...accessoriesProducts
];

// Get products by category
export const getProductsByCategory = (category: string): Product[] => {
  switch (category) {
    case "mens":
      return mensProducts;
    case "womens":
      return womensProducts;
    case "accessories":
      return accessoriesProducts;
    default:
      return allProducts;
  }
};

// Get paginated products
export const getPaginatedProducts = (
  products: Product[],
  page: number = 1,
  pageSize: number = 12
): { 
  products: Product[],
  total: number,
  totalPages: number,
  currentPage: number
} => {
  const startIndex = (page - 1) * pageSize;
  const paginatedProducts = products.slice(startIndex, startIndex + pageSize);
  
  return {
    products: paginatedProducts,
    total: products.length,
    totalPages: Math.ceil(products.length / pageSize),
    currentPage: page
  };
}; 