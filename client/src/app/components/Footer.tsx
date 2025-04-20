import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-100 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Threadscape</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Elevate your style with our curated collection of contemporary fashion essentials.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Shop</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/shop/mens" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                  Men&apos;s Collection
                </Link>
              </li>
              <li>
                <Link href="/shop/womens" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                  Women&apos;s Collection
                </Link>
              </li>
              <li>
                <Link href="/shop/accessories" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                  Accessories
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8 flex justify-center">
          <p className="text-base text-gray-500 dark:text-gray-400">&copy; {new Date().getFullYear()} Threadscape. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
} 