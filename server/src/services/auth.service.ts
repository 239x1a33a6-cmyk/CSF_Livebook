import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { hashPassword, comparePasswords } from '../lib/password';
import { signToken } from '../lib/jwt';

export const authService = {
    async register(name: string, email: string, password: string) {
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            throw new AppError('EMAIL_TAKEN', 'An account with this email already exists', 409);
        }
        const passwordHash = await hashPassword(password);
        const user = await prisma.user.create({
            data: { name, email, passwordHash },
            select: { id: true, name: true, email: true, role: true },
        });
        const token = signToken({ userId: user.id, role: user.role });
        return { user, token };
    },

    async login(email: string, password: string) {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new AppError('INVALID_CREDENTIALS', 'Invalid email or password', 401);
        }
        const valid = await comparePasswords(password, user.passwordHash);
        if (!valid) {
            throw new AppError('INVALID_CREDENTIALS', 'Invalid email or password', 401);
        }
        const token = signToken({ userId: user.id, role: user.role });
        const { passwordHash: _, ...safeUser } = user;
        return { user: safeUser, token };
    },

    async getMe(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, email: true, role: true, createdAt: true },
        });
        if (!user) {
            throw new AppError('USER_NOT_FOUND', 'User not found', 404);
        }
        return user;
    },
};
