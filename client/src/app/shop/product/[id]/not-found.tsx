import Link from "next/link";

export default function ProductNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-6">Product Not Found</h2>
      <p className="text-gray-600 dark:text-gray-400 max-w-md mb-8">
        We couldn&apos;t find the product you&apos;re looking for. It might have been removed or is currently unavailable.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/shop"
          className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-md font-medium hover:bg-gray-900 dark:hover:bg-gray-100 transition-colors"
        >
          Continue Shopping
        </Link>
        <Link
          href="/"
          className="px-6 py-3 bg-transparent border border-black dark:border-white text-black dark:text-white rounded-md font-medium hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
} 