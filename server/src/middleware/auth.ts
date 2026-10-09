import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../lib/jwt';
import { AppError } from './errorHandler';

export interface AuthRequest extends Request {
    user?: { userId: string; role: string };
}

export function requireAuth(req: AuthRequest, _res: Response, next: NextFunction): void {
    try {
        const token = req.cookies?.token as string | undefined;
        if (!token) {
            throw new AppError('UNAUTHORIZED', 'Authentication required', 401);
        }
        const payload = verifyToken(token);
        req.user = payload;
        next();
    } catch (err) {
        if (err instanceof AppError) {
            next(err);
        } else {
            next(new AppError('UNAUTHORIZED', 'Invalid or expired token', 401));
        }
    }
}

export function requireRole(...roles: string[]) {
    return (req: AuthRequest, _res: Response, next: NextFunction): void => {
        if (!req.user || !roles.includes(req.user.role)) {
            next(new AppError('FORBIDDEN', 'Insufficient permissions', 403));
        } else {
            next();
        }
    };
}
