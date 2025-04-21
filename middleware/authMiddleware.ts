import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { sendErrorResponse } from '../utils/responseHandlers';

const prisma = new PrismaClient();

interface TokenPayload {
  id: number;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

/**
 * Middleware to protect routes - verifies JWT token and adds user to request
 */
export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token;

  // Check for token in cookies first (preferred method)
  if (req.cookies.token) {
    token = req.cookies.token;
  } 
  // Fallback to Authorization header if cookie not available
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return sendErrorResponse(res, 'Not authorized, no token', 401);
  }

  try {
    // Verify token
    let decoded;
    try {
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error('JWT_SECRET is not defined');
      }
      decoded = jwt.verify(
        token,
        jwtSecret
      ) as TokenPayload;
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Add user to request (without password)
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    if (!user) {
      return sendErrorResponse(res, 'User not found', 401);
    }

    (req as any).user = user;
    next();
  } catch (error) {
    sendErrorResponse(res, 'Not authorized, token failed', 401);
  }
};

/**
 * Middleware to restrict access to admin users only
 */
export const admin = (req: Request, res: Response, next: NextFunction) => {
  if ((req as any).user && (req as any).user.role === 'ADMIN') {
    next();
  } else {
    sendErrorResponse(res, 'Not authorized as an admin', 403);
  }
}; 