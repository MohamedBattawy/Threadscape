import { NextFunction, Request, Response } from 'express';
import { ZodError, ZodType } from 'zod';
import { sendErrorResponse } from '../utils/responseHandlers';

/**
 * Middleware to validate request body against a Zod schema
 */
export const validateRequest = (schema: ZodType<any, any, any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
        return sendErrorResponse(res, 'Validation error', 400, errorMessages);
      }
      return sendErrorResponse(res, 'Invalid request data', 400);
    }
  };
}; 