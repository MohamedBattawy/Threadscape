import { Response } from 'express';

/**
 * Send a success response
 */
export const sendSuccessResponse = (
  res: Response, 
  data: any, 
  statusCode = 200,
  meta?: { count?: number, page?: number, totalPages?: number }
) => {
  const response: any = {
    success: true,
    data
  };

  // Add metadata if provided
  if (meta) {
    if (meta.count !== undefined) response.count = meta.count;
    if (meta.page !== undefined) response.page = meta.page;
    if (meta.totalPages !== undefined) response.totalPages = meta.totalPages;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send an error response
 */
export const sendErrorResponse = (
  res: Response,
  message: string,
  statusCode = 500,
  errors?: any[]
) => {
  const response: any = {
    success: false,
    message
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

/**
 * Handle common server errors
 */
export const handleServerError = (res: Response, error: any) => {
  console.error('Server error:', error);
  return sendErrorResponse(res, 'Server error');
}; 