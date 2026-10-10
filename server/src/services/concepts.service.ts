import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';

export const conceptsService = {
    async getBySlug(slug: string, userId: string) {
        const concept = await prisma.concept.findUnique({
            where: { slug, isPublished: true },
            include: {
                module: {
                    include: { subject: { select: { id: true, name: true, slug: true } } },
                },
            },
        });
        if (!concept) throw new AppError('CONCEPT_NOT_FOUND', 'Concept not found', 404);

        // Attach user progress if exists
        const progress = await prisma.userConceptProgress.findUnique({
            where: { userId_conceptId: { userId, conceptId: concept.id } },
        });

        // Get all published concepts in the module to find siblings
        const siblings = await prisma.concept.findMany({
            where: { moduleId: concept.moduleId, isPublished: true },
            orderBy: { order: 'asc' },
            select: { slug: true, title: true }
        });

        const currentIndex = siblings.findIndex(s => s.slug === slug);
        const prevConcept = currentIndex > 0 ? siblings[currentIndex - 1] : null;
        const nextConcept = currentIndex < siblings.length - 1 ? siblings[currentIndex + 1] : null;

        return { concept, progress, prevConcept, nextConcept };
    },

    async getContent(conceptId: string) {
        const content = await prisma.conceptContent.findUnique({
            where: { conceptId },
        });
        if (!content) throw new AppError('CONTENT_NOT_FOUND', 'Concept content not found', 404);
        return content;
    },

    async getResources(conceptId: string) {
        const resources = await prisma.conceptResource.findMany({
            where: { conceptId, isPublished: true }
        });
        return resources;
    },

    async getQuiz(conceptId: string) {
        const assessment = await prisma.assessment.findFirst({
            where: { conceptId, isPublished: true, type: 'CONCEPT_QUIZ' },
            include: {
                questions: {
                    orderBy: { order: 'asc' },
                    select: {
                        id: true,
                        type: true,
                        prompt: true,
                        options: true,
                        points: true,
                        order: true,
                        // correctAnswer is EXCLUDED — never sent to client
                    },
                },
            },
        });
        if (!assessment) throw new AppError('QUIZ_NOT_FOUND', 'Quiz not found for this concept', 404);
        return assessment;
    },

    async startConcept(conceptId: string, userId: string) {
        const concept = await prisma.concept.findUnique({ where: { id: conceptId } });
        if (!concept) throw new AppError('CONCEPT_NOT_FOUND', 'Concept not found', 404);

        const progress = await prisma.userConceptProgress.upsert({
            where: { userId_conceptId: { userId, conceptId } },
            create: {
                userId,
                conceptId,
                status: 'IN_PROGRESS',
                startedAt: new Date(),
                lastAccessedAt: new Date(),
            },
            update: {
                lastAccessedAt: new Date(),
                status: {
                    // Only move from NOT_STARTED → IN_PROGRESS, never downgrade COMPLETED
                    set: 'IN_PROGRESS',
                },
            },
        });

        // Fix: don't downgrade COMPLETED to IN_PROGRESS
        if (progress.status === 'COMPLETED') {
            await prisma.userConceptProgress.update({
                where: { id: progress.id },
                data: { status: 'COMPLETED', lastAccessedAt: new Date() },
            });
        }

        return progress;
    },
};
