import { z } from 'zod';

export const registerUserSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' }),
  confirmPassword: z.string(),
  firstName: z.string().min(1, { message: 'First name is required' }),
  lastName: z.string().min(1, { message: 'Last name is required' }),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Login schema
export const loginUserSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

// Forgot password schema
export const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
});

// Reset password schema
export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' }),
  confirmPassword: z.string(),
  token: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Update user profile schema
export const updateUserProfileSchema = z.object({
  firstName: z.string().min(1, { message: 'First name is required' }).optional(),
  lastName: z.string().min(1, { message: 'Last name is required' }).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
});

// Admin schemas for user management

/**
 * Validation schema for admin creating a new user
 */
export const createUserSchema = z.object({
  email: z.string().email({ message: 'Please provide a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
  firstName: z.string().min(1, { message: 'First name is required' }),
  lastName: z.string().min(1, { message: 'Last name is required' }),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  role: z.enum(['USER', 'ADMIN']).default('USER')
});

/**
 * Validation schema for admin updating a user
 */
export const updateUserSchema = z.object({
  email: z.string().email({ message: 'Please provide a valid email address' }).optional(),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' }).optional(),
  firstName: z.string().min(1, { message: 'First name is required' }).optional(),
  lastName: z.string().min(1, { message: 'Last name is required' }).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  role: z.enum(['USER', 'ADMIN']).optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update'
});

// Types derived from the schemas
export type RegisterUserInput = z.infer<typeof registerUserSchema>;
export type LoginUserInput = z.infer<typeof loginUserSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>; 