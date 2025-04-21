import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { LoginUserInput } from '../schemaValidations/userSchema';
import { PrismaClient } from '@prisma/client';
import { defaultUserSelect } from '../utils/queryHelpers';
import { handleServerError, sendErrorResponse, sendSuccessResponse } from '../utils/responseHandlers';

const prisma = new PrismaClient();

// JWT token expiration time
const JWT_EXPIRATION = '30d';
// Cookie options
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' as 'none' | 'lax',
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
};

/**
 * Generate JWT token
 */
const generateToken = (userId: number, email: string, role: string) => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not defined');
  }
  return jwt.sign(
    { id: userId, email, role },
    jwtSecret,
    { expiresIn: JWT_EXPIRATION }
  );
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req: Request<{}, {}, LoginUserInput>, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        ...defaultUserSelect,
        password: true, // Need password for verification
      },
    });

    // Check if user exists
    if (!user) {
      return sendErrorResponse(res, 'Invalid credentials', 401);
    }

    // Compare passwords
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return sendErrorResponse(res, 'Invalid credentials', 401);
    }

    // Generate JWT token
    const token = generateToken(user.id, user.email, user.role);

    // Store token in cookie
    res.cookie('token', token, COOKIE_OPTIONS);

    // Remove password from user object
    const { password: _, ...userWithoutPassword } = user;

    // Return user info and token (for client-side storage if needed)
    sendSuccessResponse(res, {
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    handleServerError(res, error);
  }
};

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logout = async (_req: Request, res: Response) => {
  try {
    // Clear the token cookie
    res.clearCookie('token', COOKIE_OPTIONS);
    sendSuccessResponse(res, { message: 'Logged out successfully' });
  } catch (error) {
    handleServerError(res, error);
  }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    // User ID will be added to request by auth middleware
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return sendErrorResponse(res, 'Not authenticated', 401);
    }

    // Find user by ID
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: defaultUserSelect,
    });

    if (!user) {
      return sendErrorResponse(res, 'User not found', 404);
    }

    sendSuccessResponse(res, user);
  } catch (error) {
    handleServerError(res, error);
  }
}; 