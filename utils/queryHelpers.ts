import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

/**
 * Default user select fields to exclude sensitive data
 */
export const defaultUserSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  address: true,
  city: true,
  country: true,
  role: true,
  createdAt: true,
  updatedAt: true,
  password: false,
};

/**
 * User select fields with orders included
 */
export const userWithOrdersSelect = {
  ...defaultUserSelect,
  orders: {
    select: {
      id: true,
      total: true,
      status: true,
      createdAt: true,
    },
  },
};

/**
 * Safely parse an ID parameter
 */
export const parseIdParam = (idParam: string) => {
  const id = parseInt(idParam);
  if (isNaN(id)) {
    throw new Error('Invalid ID format');
  }
  return id;
};

/**
 * Parse pagination parameters
 */
export const parsePaginationParams = (
  pageParam?: string, 
  limitParam?: string
) => {
  const page = pageParam ? Math.max(1, parseInt(pageParam)) : 1;
  const limit = limitParam ? Math.min(100, Math.max(1, parseInt(limitParam))) : 10;
  const skip = (page - 1) * limit;
  
  return { page, limit, skip };
}; 