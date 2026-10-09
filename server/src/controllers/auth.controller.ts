import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { env } from '../config/env';
import { AuthRequest } from '../middleware/auth';

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
};

export const authController = {
    async register(req: Request, res: Response, next: NextFunction) {
        try {
            const { name, email, password } = req.body;
            const { user, token } = await authService.register(name, email, password);
            res.cookie('token', token, COOKIE_OPTIONS);
            res.status(201).json({ success: true, data: user });
        } catch (err) {
            next(err);
        }
    },

    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password } = req.body;
            const { user, token } = await authService.login(email, password);
            res.cookie('token', token, COOKIE_OPTIONS);
            res.json({ success: true, data: user });
        } catch (err) {
            next(err);
        }
    },

    async logout(_req: Request, res: Response) {
        res.clearCookie('token', { path: '/' });
        res.json({ success: true, data: { message: 'Logged out successfully' } });
    },

    async me(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const user = await authService.getMe(req.user!.userId);
            res.json({ success: true, data: user });
        } catch (err) {
            next(err);
        }
    },
};
