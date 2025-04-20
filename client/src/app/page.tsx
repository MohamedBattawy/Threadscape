import Link from "next/link";
import ImageWithFallback from "./components/ImageWithFallback";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[85vh] bg-neutral-100 dark:bg-neutral-900">
        <div className="absolute inset-0 opacity-40 z-0">
          <ImageWithFallback
            src="/landing_collection.jpeg"
            alt="Fashion collection"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="container mx-auto px-4 h-full flex items-center relative z-10">
          <div className="max-w-xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Discover Your Signature Style at Threadscape
            </h1>
            <p className="text-lg md:text-xl mb-8 text-gray-700 dark:text-gray-300">
              Explore our curated collections designed for the modern individual. Quality meets contemporary design.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/shop" className="bg-black dark:bg-white text-white dark:text-black py-3 px-8 rounded-md font-medium text-lg hover:bg-gray-900 dark:hover:bg-gray-100 transition-colors">
                Shop Now
              </Link>
              <Link href="/about" className="bg-transparent border border-black dark:border-white text-black dark:text-white py-3 px-8 rounded-md font-medium text-lg hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors">
                Our Story
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Collections */}
      <section className="py-16 bg-white dark:bg-black">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-semibold mb-12 text-center">Featured Collections</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Men's Collection */}
            <div className="group relative overflow-hidden rounded-lg">
              <div className="aspect-w-4 aspect-h-5 h-96 relative">
                <ImageWithFallback
                  src="/mens-collection.jpg"
                  alt="Men's collection"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-2xl font-medium text-white mb-2">Men&apos;s Collection</h3>
                <p className="text-white/80 mb-4">Sophisticated essentials for the modern man</p>
                <Link href="/shop/mens" className="inline-block bg-white text-black py-2 px-4 rounded-md font-medium hover:bg-gray-100 transition-colors">
                  Explore
                </Link>
              </div>
            </div>

            {/* Women's Collection */}
            <div className="group relative overflow-hidden rounded-lg">
              <div className="aspect-w-4 aspect-h-5 h-96 relative">
                <ImageWithFallback
                  src="/womens-collection.jpg"
                  alt="Women's collection"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-2xl font-medium text-white mb-2">Women&apos;s Collection</h3>
                <p className="text-white/80 mb-4">Timeless elegance meets contemporary design</p>
                <Link href="/shop/womens" className="inline-block bg-white text-black py-2 px-4 rounded-md font-medium hover:bg-gray-100 transition-colors">
                  Explore
                </Link>
              </div>
            </div>

            {/* Accessories */}
            <div className="group relative overflow-hidden rounded-lg">
              <div className="aspect-w-4 aspect-h-5 h-96 relative">
                <ImageWithFallback
                  src="/accessories.jpg"
                  alt="Accessories collection"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-2xl font-medium text-white mb-2">Accessories</h3>
                <p className="text-white/80 mb-4">Complete your look with our premium accessories</p>
                <Link href="/shop/accessories" className="inline-block bg-white text-black py-2 px-4 rounded-md font-medium hover:bg-gray-100 transition-colors">
                  Explore
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
