import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';

export const modulesService = {
    async getById(moduleId: string) {
        const module = await prisma.module.findUnique({
            where: { id: moduleId },
            include: {
                subject: { select: { id: true, name: true, slug: true } },
                concepts: {
                    orderBy: { order: 'asc' },
                    select: { id: true, conceptCode: true, title: true, slug: true, difficulty: true, estimatedMinutes: true, description: true, order: true, isPublished: true },
                },
            },
        });
        if (!module) throw new AppError('MODULE_NOT_FOUND', 'Module not found', 404);
        return module;
    },

    async getConcepts(moduleId: string) {
        const module = await prisma.module.findUnique({ where: { id: moduleId } });
        if (!module) throw new AppError('MODULE_NOT_FOUND', 'Module not found', 404);

        return prisma.concept.findMany({
            where: { moduleId },
            orderBy: { order: 'asc' },
            select: { id: true, conceptCode: true, title: true, slug: true, difficulty: true, estimatedMinutes: true, description: true, order: true, isPublished: true },
        });
    },
};
