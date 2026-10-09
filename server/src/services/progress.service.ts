import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';

export const progressService = {
    async getAllProgress(userId: string) {
        return prisma.userConceptProgress.findMany({
            where: { userId },
            include: {
                concept: {
                    select: { id: true, conceptCode: true, title: true, slug: true },
                },
            },
            orderBy: { lastAccessedAt: 'desc' },
        });
    },

    async getDashboard(userId: string) {
        const subjects = await prisma.subject.findMany({
            orderBy: { order: 'asc' },
            include: {
                modules: {
                    orderBy: { order: 'asc' },
                    include: {
                        concepts: {
                            orderBy: { order: 'asc' },
                            include: {
                                progress: {
                                    where: { userId },
                                },
                            },
                        },
                    },
                },
            },
        });

        return subjects.map((subject) => {
            const allConcepts = subject.modules.flatMap((m) => m.concepts);
            const totalConcepts = allConcepts.length;
            const completedConcepts = allConcepts.filter(
                (c) => c.progress[0]?.status === 'COMPLETED',
            ).length;

            return {
                id: subject.id,
                name: subject.name,
                slug: subject.slug,
                description: subject.description,
                icon: subject.icon,
                order: subject.order,
                isPublished: subject.isPublished,
                moduleCount: subject.modules.length,
                conceptCount: totalConcepts,
                progress: {
                    completed: completedConcepts,
                    total: totalConcepts,
                    percentage: totalConcepts > 0 ? Math.round((completedConcepts / totalConcepts) * 100) : 0,
                },
                modules: subject.modules.map((module) => ({
                    id: module.id,
                    name: module.name,
                    slug: module.slug,
                    description: module.description,
                    order: module.order,
                    isPublished: module.isPublished,
                    conceptCount: module.concepts.length,
                    concepts: module.concepts.map((concept) => {
                        const prog = concept.progress[0];
                        return {
                            id: concept.id,
                            conceptCode: concept.conceptCode,
                            title: concept.title,
                            slug: concept.slug,
                            difficulty: concept.difficulty,
                            estimatedMinutes: concept.estimatedMinutes,
                            order: concept.order,
                            isPublished: concept.isPublished,
                            progress: prog
                                ? {
                                    conceptId: concept.id,
                                    status: prog.status,
                                    startedAt: prog.startedAt?.toISOString(),
                                    completedAt: prog.completedAt?.toISOString(),
                                    lastAccessedAt: prog.lastAccessedAt.toISOString(),
                                    bestScore: prog.bestScore,
                                    attemptsCount: prog.attemptsCount,
                                }
                                : undefined,
                        };
                    }),
                })),
            };
        });
    },
};
