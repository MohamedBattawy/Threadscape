import { z } from 'zod';

export const productCategorySchema = z.enum(['MENS', 'WOMENS', 'ACCESSORIES']);

// Create product schema
export const createProductSchema = z.object({
  name: z.string().min(1, { message: 'Product name is required' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters' }),
  price: z.number().positive({ message: 'Price must be a positive number' }),
  category: productCategorySchema,
  inventory: z.number().int().nonnegative({ message: 'Inventory must be a non-negative integer' }),
  images: z.array(
    z.object({
      url: z.string().url({ message: 'Image URL must be a valid URL' }),
      isMain: z.boolean().optional().default(false),
    })
  ).min(1, { message: 'At least one image is required' }),
});

// Update product schema
export const updateProductSchema = z.object({
  name: z.string().min(1, { message: 'Product name is required' }).optional(),
  description: z.string().min(10, { message: 'Description must be at least 10 characters' }).optional(),
  price: z.number().positive({ message: 'Price must be a positive number' }).optional(),
  category: productCategorySchema.optional(),
  inventory: z.number().int().nonnegative({ message: 'Inventory must be a non-negative integer' }).optional(),
  images: z.array(
    z.object({
      id: z.number().optional(),
      url: z.string().url({ message: 'Image URL must be a valid URL' }),
      isMain: z.boolean().optional(),
    })
  ).optional(),
});

// Rating schema
export const createRatingSchema = z.object({
  productId: z.number().int().positive(),
  value: z.number().int().min(1).max(5),
});

// Product query params schema
export const productQuerySchema = z.object({
  category: productCategorySchema.optional(),
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  sort: z.enum(['price_asc', 'price_desc', 'newest', 'popularity']).optional(),
  search: z.string().optional(),
});

// Types derived from the schemas
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type CreateRatingInput = z.infer<typeof createRatingSchema>;
export type ProductQueryParams = z.infer<typeof productQuerySchema>; 