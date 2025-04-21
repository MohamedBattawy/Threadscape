import { Metadata } from "next";
import CategoryPageClient from "./CategoryPageClient";

export const dynamicParams = true;

export async function generateMetadata({ 
  params 
}: { 
  params: { category: string } 
}): Promise<Metadata> {
  const category = params.category;
  const capitalizedCategory = category.charAt(0).toUpperCase() + category.slice(1);
  
  return {
    title: `${capitalizedCategory} | Threadscape`,
    description: `Shop our ${category} collection at Threadscape.`,
  };
}

export default async function CategoryPage({ 
  params, 
  searchParams 
}: { 
  params: { category: string },
  searchParams: { page?: string, sort?: string } 
}) {
  const category = params.category;
  const currentPage = searchParams.page ? parseInt(searchParams.page) : 1;
  const sortBy = searchParams.sort || 'newest';
  
  return <CategoryPageClient 
    category={category} 
    initialPage={currentPage} 
    initialSort={sortBy} 
  />;
} 