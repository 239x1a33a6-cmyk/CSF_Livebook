import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';

import authRoutes from './routes/auth.routes';
import subjectsRoutes from './routes/subjects.routes';
import modulesRoutes from './routes/modules.routes';
import conceptsRoutes from './routes/concepts.routes';
import assessmentsRoutes from './routes/assessments.routes';
import usersRoutes from './routes/users.routes';
import adminRoutes from './routes/admin.routes';
import path from 'path';

export function createApp() {
    const app = express();

    // ── CORS ────────────────────────────────────────────────────────────────────
    app.use(
        cors({
            origin: env.CLIENT_URL,
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization'],
        }),
    );

    // ── Body & Cookie parsing ────────────────────────────────────────────────────
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());

    // ── Health check ─────────────────────────────────────────────────────────────
    app.get('/api/health', (_req, res) => {
        res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
    });

    // ── Static Files ─────────────────────────────────────────────────────────────
    app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

    // ── Routes ───────────────────────────────────────────────────────────────────
    app.use('/api/auth', authRoutes);
    app.use('/api/subjects', subjectsRoutes);
    app.use('/api/modules', modulesRoutes);
    app.use('/api/concepts', conceptsRoutes);
    app.use('/api/assessments', assessmentsRoutes);
    app.use('/api/users', usersRoutes);
    app.use('/api/admin', adminRoutes);

    // ── 404 ──────────────────────────────────────────────────────────────────────
    app.use((_req, res) => {
        res.status(404).json({
            success: false,
            error: { code: 'NOT_FOUND', message: 'Route not found' },
        });
    });

    // ── Error handler (must be last) ─────────────────────────────────────────────
    app.use(errorHandler);

    return app;
}
