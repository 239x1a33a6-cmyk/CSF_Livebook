import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { subjectsService } from '../services/subjects.service';
import { modulesService } from '../services/modules.service';
import { conceptsService } from '../services/concepts.service';

export const subjectsController = {
    async getAll(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const data = await subjectsService.getAll();
            res.json({ success: true, data });
        } catch (err) { next(err); }
    },

    async getBySlug(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const data = await subjectsService.getBySlug(req.params.slug);
            res.json({ success: true, data });
        } catch (err) { next(err); }
    },

    async getModules(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const data = await subjectsService.getModules(req.params.subjectId);
            res.json({ success: true, data });
        } catch (err) { next(err); }
    },
};

export const modulesController = {
    async getById(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const data = await modulesService.getById(req.params.moduleId);
            res.json({ success: true, data });
        } catch (err) { next(err); }
    },

    async getConcepts(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const data = await modulesService.getConcepts(req.params.moduleId);
            res.json({ success: true, data });
        } catch (err) { next(err); }
    },
};

export const conceptsController = {
    async getBySlug(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const data = await conceptsService.getBySlug(req.params.slug, req.user!.userId);
            res.json({ success: true, data });
        } catch (err) { next(err); }
    },

    async getContent(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const data = await conceptsService.getContent(req.params.conceptId);
            res.json({ success: true, data });
        } catch (err) { next(err); }
    },

    async getResources(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const data = await conceptsService.getResources(req.params.conceptId);
            res.json({ success: true, data });
        } catch (err) { next(err); }
    },

    async getQuiz(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const data = await conceptsService.getQuiz(req.params.conceptId);
            res.json({ success: true, data });
        } catch (err) { next(err); }
    },

    async startConcept(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const data = await conceptsService.startConcept(req.params.conceptId, req.user!.userId);
            res.json({ success: true, data });
        } catch (err) { next(err); }
    },
};
