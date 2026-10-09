import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { AppError } from './errorHandler';

export function validate(schema: AnyZodObject) {
    return async (req: Request, _res: Response, next: NextFunction) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next();
        } catch (err) {
            if (err instanceof ZodError) {
                next(
                    new AppError(
                        'VALIDATION_ERROR',
                        'Invalid request data',
                        400,
                        err.flatten().fieldErrors,
                    ),
                );
            } else {
                next(err);
            }
        }
    };
}
