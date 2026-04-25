import { Response } from 'express';

export function sendSuccess(res: Response, data: any, message = 'Operación exitosa', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

export function sendPaginated(
  res: Response,
  data: any[],
  total: number,
  page: number,
  limit: number
) {
  return res.status(200).json({
    success: true,
    total,
    page,
    limit,
    data,
  });
}

export function sendError(res: Response, message: string, statusCode = 500, errors?: any[]) {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
}