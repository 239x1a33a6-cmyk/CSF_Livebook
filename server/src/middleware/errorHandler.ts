import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
    public readonly code: string;
    public readonly statusCode: number;
    public readonly details?: unknown;

    constructor(code: string, message: string, statusCode = 500, details?: unknown) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.details = details;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}

export function errorHandler(
    err: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction,
): void {
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            success: false,
            error: {
                code: err.code,
                message: err.message,
                ...(process.env.NODE_ENV !== 'production' && err.details
                    ? { details: err.details }
                    : {}),
            },
        });
        return;
    }

    // Unexpected errors — don't leak details in production
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'An unexpected error occurred',
        },
    });
}
