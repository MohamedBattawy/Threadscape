"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

type PaginationProps = {
  totalPages: number;
  currentPage: number;
};

export default function Pagination({ totalPages, currentPage }: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  return (
    <div className="flex justify-center my-8">
      <nav className="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
        {currentPage > 1 && (
          <Link
            href={createPageURL(currentPage - 1)}
            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
          >
            <span className="sr-only">Previous</span>
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </Link>
        )}
        
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <Link
            key={page}
            href={createPageURL(page)}
            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
              currentPage === page
                ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600"
                : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
            }`}
          >
            {page}
          </Link>
        ))}
        
        {currentPage < totalPages && (
          <Link
            href={createPageURL(currentPage + 1)}
            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
          >
            <span className="sr-only">Next</span>
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </Link>
        )}
      </nav>
    </div>
  );
} 