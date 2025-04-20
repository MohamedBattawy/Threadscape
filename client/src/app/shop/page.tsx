import Link from "next/link";
import ImageWithFallback from "../components/ImageWithFallback";

export const metadata = {
  title: "Shop | Threadscape",
  description: "Browse our collection of stylish clothing and accessories.",
};

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

export default function Shop() {
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="group">
                <div className="mb-4 aspect-w-1 aspect-h-1 bg-gray-200 rounded-lg overflow-hidden relative">
                  <div className="h-80 relative">
                    <ImageWithFallback 
                      src="/stats.png" 
                      alt={`Featured product ${index + 1}`} 
                      fill
                      className="object-cover object-center transition-opacity group-hover:opacity-75"
                    />
                  </div>
                </div>
                <h3 className="text-lg font-medium">Featured Item #{index + 1}</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-2">High-quality fashion essential</p>
                <p className="font-medium">$129.00</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
} 