import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { assessmentService } from '../services/assessment.service';
import { progressService } from '../services/progress.service';

export const assessmentController = {
    async submitAttempt(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { answers } = req.body;
            const data = await assessmentService.submitAttempt(
                req.params.assessmentId,
                req.user!.userId,
                answers,
            );
            res.status(201).json({ success: true, data });
        } catch (err) { next(err); }
    },

    async getAttempt(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const data = await assessmentService.getAttemptResult(
                req.params.attemptId,
                req.user!.userId,
            );
            res.json({ success: true, data });
        } catch (err) { next(err); }
    },
};

export const usersController = {
    async getProgress(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const data = await progressService.getAllProgress(req.user!.userId);
            res.json({ success: true, data });
        } catch (err) { next(err); }
    },

    async getDashboard(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const data = await progressService.getDashboard(req.user!.userId);
            res.json({ success: true, data });
        } catch (err) { next(err); }
    },
};
