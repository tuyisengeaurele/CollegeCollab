import { Response } from 'express';

export function sendSuccess<T>(res: Response, data: T, message?: string, status = 200) {
  return res.status(status).json({ success: true, data, message });
}

export function sendError(res: Response, message: string, status = 400, errors?: unknown) {
  return res.status(status).json({ success: false, message, errors });
}

export function paginate<T>(data: T[], total: number, page: number, limit: number) {
  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
