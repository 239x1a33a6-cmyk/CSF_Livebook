import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';

export const subjectsService = {
    async getAll() {
        const subjects = await prisma.subject.findMany({
            orderBy: { order: 'asc' },
            include: {
                modules: {
                    include: {
                        concepts: {
                            select: { id: true, isPublished: true },
                        },
                    },
                },
            },
        });
        return subjects.map((s) => ({
            id: s.id,
            name: s.name,
            slug: s.slug,
            description: s.description,
            icon: s.icon,
            order: s.order,
            isPublished: s.isPublished,
            moduleCount: s.modules.length,
            conceptCount: s.modules.reduce((acc, m) => acc + m.concepts.length, 0),
        }));
    },

    async getBySlug(slug: string) {
        const subject = await prisma.subject.findUnique({
            where: { slug },
            include: {
                modules: {
                    orderBy: { order: 'asc' },
                    include: {
                        concepts: {
                            orderBy: { order: 'asc' },
                            select: { id: true, conceptCode: true, title: true, slug: true, difficulty: true, estimatedMinutes: true, order: true, isPublished: true },
                        },
                    },
                },
            },
        });
        if (!subject) throw new AppError('SUBJECT_NOT_FOUND', 'Subject not found', 404);
        return subject;
    },

    async getModules(subjectId: string) {
        const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
        if (!subject) throw new AppError('SUBJECT_NOT_FOUND', 'Subject not found', 404);

        return prisma.module.findMany({
            where: { subjectId },
            orderBy: { order: 'asc' },
            include: {
                concepts: {
                    orderBy: { order: 'asc' },
                    select: { id: true, conceptCode: true, title: true, slug: true, difficulty: true, estimatedMinutes: true, order: true, isPublished: true },
                },
            },
        });
    },
};
