import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import { CreateUserInput, UpdateUserInput } from '../schemaValidations/userSchema';
import { PrismaClient } from '@prisma/client';
import { defaultUserSelect, parseIdParam, userWithOrdersSelect } from '../utils/queryHelpers';
import { handleServerError, sendErrorResponse, sendSuccessResponse } from '../utils/responseHandlers';

const prisma = new PrismaClient();

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Private/Admin
 */
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: defaultUserSelect,
    });

    sendSuccessResponse(res, users, 200, { count: users.length });
  } catch (error) {
    handleServerError(res, error);
  }
};

/**
 * @desc    Get single user by ID
 * @route   GET /api/users/:id
 * @access  Private/Admin
 */
export const getSingleUser = async (req: Request, res: Response) => {
  try {
    let userId: number;
    try {
      userId = parseIdParam(req.params.id);
    } catch (error) {
      return sendErrorResponse(res, 'Invalid user ID format', 400);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: userWithOrdersSelect,
    });

    if (!user) {
      return sendErrorResponse(res, 'User not found', 404);
    }

    sendSuccessResponse(res, user);
  } catch (error) {
    handleServerError(res, error);
  }
};

/**
 * @desc    Create a new user
 * @route   POST /api/users
 * @access  Public
 */
export const createUser = async (req: Request<{}, {}, CreateUserInput>, res: Response) => {
  try {
    const { email, password, firstName, lastName, address, city, country, role } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return sendErrorResponse(res, 'User with this email already exists', 400);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // For security, only allow role setting by admins
    // If request comes from a non-admin, force 'USER' role
    // The user property is added by the auth middleware
    const isAdmin = (req as any).user?.role === 'ADMIN';
    const userRole = isAdmin ? (role || 'USER') : 'USER';

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        address,
        city,
        country,
        role: userRole,
      },
      select: defaultUserSelect,
    });

    sendSuccessResponse(res, {
      message: 'User created successfully',
      user: newUser
    }, 201);
  } catch (error) {
    handleServerError(res, error);
  }
};

/**
 * @desc    Update user
 * @route   PUT /api/users/:id
 * @access  Private
 */
export const updateUser = async (req: Request<{ id: string }, {}, UpdateUserInput>, res: Response) => {
  try {
    let userId: number;
    try {
      userId = parseIdParam(req.params.id);
    } catch (error) {
      return sendErrorResponse(res, 'Invalid user ID format', 400);
    }

    // Get the current user's ID from the authenticated request
    const currentUserId = (req as any).user?.id;
    const isAdmin = (req as any).user?.role === 'ADMIN';
    
    // Only allow admins to update any user, regular users can only update themselves
    if (!isAdmin && currentUserId !== userId) {
      return sendErrorResponse(res, 'Not authorized to update this user', 403);
    }

    const userExists = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userExists) {
      return sendErrorResponse(res, 'User not found', 404);
    }

    const { email, firstName, lastName, address, city, country, role, password } = req.body;
    const updateData: any = {};

    if (email) updateData.email = email;
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (address) updateData.address = address;
    if (city) updateData.city = city;
    if (country) updateData.country = country;
    
    // Only admins can update role
    if (role && isAdmin) {
      updateData.role = role;
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: defaultUserSelect,
    });

    sendSuccessResponse(res, updatedUser);
  } catch (error) {
    handleServerError(res, error);
  }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/users/:id
 * @access  Private
 */
export const deleteUser = async (req: Request, res: Response) => {
  try {
    let userId: number;
    try {
      userId = parseIdParam(req.params.id);
    } catch (error) {
      return sendErrorResponse(res, 'Invalid user ID format', 400);
    }

    // Get the current user's ID from the authenticated request
    const currentUserId = (req as any).user?.id;
    const isAdmin = (req as any).user?.role === 'ADMIN';
    
    // Only allow admins to delete any user, regular users can only delete themselves
    if (!isAdmin && currentUserId !== userId) {
      return sendErrorResponse(res, 'Not authorized to delete this user', 403);
    }

    const userExists = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userExists) {
      return sendErrorResponse(res, 'User not found', 404);
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    // Clear auth cookies if user deleted their own account
    if (currentUserId === userId) {
      res.clearCookie('token');
    }

    sendSuccessResponse(res, { message: 'User deleted successfully' });
  } catch (error) {
    handleServerError(res, error);
  }
};

/**
 * @desc    Change user password
 * @route   POST /api/users/change-password
 * @access  Private
 */
export const changePassword = async (req: Request, res: Response) => {
  try {
    // Get user ID from the authenticated user
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return sendErrorResponse(res, 'User not authenticated', 401);
    }
    
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return sendErrorResponse(res, 'Current password and new password are required', 400);
    }
    
    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        password: true
      }
    });
    
    if (!user) {
      return sendErrorResponse(res, 'User not found', 404);
    }
    
    // Check if current password matches
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    
    if (!isMatch) {
      return sendErrorResponse(res, 'Current password is incorrect', 400);
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update the password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });
    
    sendSuccessResponse(res, { message: 'Password changed successfully' });
  } catch (error) {
    handleServerError(res, error);
  }
}; 