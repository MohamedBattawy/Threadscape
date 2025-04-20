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

// Sort products based on sorting criteria
export const sortProducts = (products: Product[], sortBy: string = 'default'): Product[] => {
  const productsCopy = [...products];
  
  switch (sortBy) {
    case 'price-asc':
      return productsCopy.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return productsCopy.sort((a, b) => b.price - a.price);
    case 'name-asc':
      return productsCopy.sort((a, b) => a.name.localeCompare(b.name));
    case 'name-desc':
      return productsCopy.sort((a, b) => b.name.localeCompare(a.name));
    case 'newest':
      // In a real app, you would sort by date
      // Here we're just using the id as a proxy for newest
      return productsCopy.sort((a, b) => {
        const idA = parseInt(a.id.split('-')[1]);
        const idB = parseInt(b.id.split('-')[1]);
        return idB - idA;
      });
    default:
      return productsCopy;
  }
};

// Get paginated products
export const getPaginatedProducts = (
  products: Product[],
  page: number = 1,
  pageSize: number = 12,
  sortBy: string = 'default'
): { 
  products: Product[],
  total: number,
  totalPages: number,
  currentPage: number
} => {
  // Sort products first
  const sortedProducts = sortProducts(products, sortBy);
  
  const startIndex = (page - 1) * pageSize;
  const paginatedProducts = sortedProducts.slice(startIndex, startIndex + pageSize);
  
  return {
    products: paginatedProducts,
    total: products.length,
    totalPages: Math.ceil(products.length / pageSize),
    currentPage: page
  };
}; 