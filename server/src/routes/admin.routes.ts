import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { upload, storageService } from '../services/storage.service';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// Protect ALL admin routes
router.use(requireAuth);
router.use(requireRole('ADMIN'));

// ── GET CURRICULUM TREE ───────────────────────────────────────────────────────
// For the admin dropdowns to render accurate hierarchy
router.get('/curriculum', async (req, res, next) => {
    try {
        const subjects = await prisma.subject.findMany({
            orderBy: { order: 'asc' },
            include: {
                modules: {
                    orderBy: { order: 'asc' },
                    include: {
                        assessments: true,
                        concepts: {
                            orderBy: { order: 'asc' },
                            include: {
                                resources: true // include resources to know what's uploaded 
                            }
                        }
                    }
                }
            }
        });
        res.json({ success: true, data: subjects });
    } catch (err) { next(err); }
});

// ── GET SPECIFIC CONCEPT RESOURCES ────────────────────────────────────────────
router.get('/concepts/:conceptId/resources', async (req, res, next) => {
    try {
        const resources = await prisma.conceptResource.findMany({
            where: { conceptId: req.params.conceptId }
        });
        res.json({ success: true, data: resources });
    } catch (err) { next(err); }
});

// ── UPLOAD VIDEO ──────────────────────────────────────────────────────────────
router.post('/upload/video/:conceptId', upload.single('file'), async (req, res, next) => {
    try {
        const { conceptId } = req.params;
        const { isPublished } = req.body;

        if (!req.file) {
            throw new AppError('BAD_REQUEST', 'No video file provided', 400);
        }

        const url = await storageService.handleUpload(req.file);

        // Replace or create
        const resource = await prisma.conceptResource.upsert({
            where: { conceptId_type: { conceptId, type: 'VIDEO' } },
            update: {
                source: 'UPLOAD',
                content: url,
                metadata: { originalName: req.file.originalname, size: req.file.size, format: req.file.mimetype },
                isPublished: isPublished === 'true'
            },
            create: {
                conceptId,
                type: 'VIDEO',
                source: 'UPLOAD',
                content: url,
                metadata: { originalName: req.file.originalname, size: req.file.size, format: req.file.mimetype },
                isPublished: isPublished === 'true'
            }
        });

        res.status(200).json({ success: true, data: resource });
    } catch (err) { next(err); }
});

// ── SAVE VIDEO URL ────────────────────────────────────────────────────────────
router.post('/url/video/:conceptId', async (req, res, next) => {
    try {
        const { conceptId } = req.params;
        const { url, isPublished } = req.body;

        if (!url) throw new AppError('BAD_REQUEST', 'URL is required', 400);

        const resource = await prisma.conceptResource.upsert({
            where: { conceptId_type: { conceptId, type: 'VIDEO' } },
            update: {
                source: 'URL',
                content: url,
                isPublished: Boolean(isPublished)
            },
            create: {
                conceptId,
                type: 'VIDEO',
                source: 'URL',
                content: url,
                isPublished: Boolean(isPublished)
            }
        });

        res.status(200).json({ success: true, data: resource });
    } catch (err) { next(err); }
});

// ── SAVE CHEATSHEET MARKDOWN ──────────────────────────────────────────────────
router.post('/markdown/cheatsheet/:conceptId', async (req, res, next) => {
    try {
        const { conceptId } = req.params;
        const { content, isPublished } = req.body;

        if (!content) throw new AppError('BAD_REQUEST', 'Markdown content is required', 400);

        const resource = await prisma.conceptResource.upsert({
            where: { conceptId_type: { conceptId, type: 'CHEAT_SHEET' } },
            update: {
                source: 'MARKDOWN',
                content: content,
                isPublished: Boolean(isPublished)
            },
            create: {
                conceptId,
                type: 'CHEAT_SHEET',
                source: 'MARKDOWN',
                content: content,
                isPublished: Boolean(isPublished)
            }
        });

        res.status(200).json({ success: true, data: resource });
    } catch (err) { next(err); }
});

// ── UPLOAD CHEATSHEET FILE (PDF/MD) ───────────────────────────────────────────
router.post('/upload/cheatsheet/:conceptId', upload.single('file'), async (req, res, next) => {
    try {
        const { conceptId } = req.params;
        const { isPublished } = req.body;

        if (!req.file) {
            throw new AppError('BAD_REQUEST', 'No file provided', 400);
        }

        const url = await storageService.handleUpload(req.file);

        const resource = await prisma.conceptResource.upsert({
            where: { conceptId_type: { conceptId, type: 'CHEAT_SHEET' } },
            update: {
                source: 'UPLOAD',
                content: url,
                metadata: { originalName: req.file.originalname, size: req.file.size, format: req.file.mimetype },
                isPublished: isPublished === 'true'
            },
            create: {
                conceptId,
                type: 'CHEAT_SHEET',
                source: 'UPLOAD',
                content: url,
                metadata: { originalName: req.file.originalname, size: req.file.size, format: req.file.mimetype },
                isPublished: isPublished === 'true'
            }
        });

        res.status(200).json({ success: true, data: resource });
    } catch (err) { next(err); }
});

// ── FALLBACK EXISTING C1 JSON ─────────────────────────────────────────────────
router.post('/c1/cheatsheet/:conceptId', async (req, res, next) => {
    try {
        const { conceptId } = req.params;
        const { isPublished } = req.body;

        const resource = await prisma.conceptResource.upsert({
            where: { conceptId_type: { conceptId, type: 'CHEAT_SHEET' } },
            update: {
                source: 'JSON_BLOCKS',
                isPublished: Boolean(isPublished)
            },
            create: {
                conceptId,
                type: 'CHEAT_SHEET',
                source: 'JSON_BLOCKS',
                isPublished: Boolean(isPublished)
            }
        });

        res.status(200).json({ success: true, data: resource });
    } catch (err) { next(err); }
});

// ── TOGGLE RESOURCE PUBLICATION ───────────────────────────────────────────────
router.put('/resource/:resourceId/publish', async (req, res, next) => {
    try {
        const { isPublished } = req.body;
        const resource = await prisma.conceptResource.update({
            where: { id: req.params.resourceId },
            data: { isPublished: Boolean(isPublished) }
        });
        res.json({ success: true, data: resource });
    } catch (err) { next(err); }
});

// ── TOGGLE ASSESSMENT PUBLICATION ───────────────────────────────────────────
router.put('/assessment/:assessmentId/publish', async (req, res, next) => {
    try {
        const { isPublished } = req.body;
        const assessment = await prisma.assessment.update({
            where: { id: req.params.assessmentId },
            data: { isPublished: Boolean(isPublished) }
        });
        res.json({ success: true, data: assessment });
    } catch (err) { next(err); }
});

// ── CONCEPT ASSESSMENT (QUIZ) MANAGEMENT ──────────────────────────────────────
router.get('/concepts/:conceptId/assessment', async (req, res, next) => {
    try {
        const assessment = await prisma.assessment.findFirst({
            where: { conceptId: req.params.conceptId, type: 'CONCEPT_QUIZ' },
            include: {
                questions: {
                    orderBy: { order: 'asc' }
                }
            }
        });
        res.json({ success: true, data: assessment });
    } catch (err) { next(err); }
});

router.post('/concepts/:conceptId/assessment', async (req, res, next) => {
    try {
        const { conceptId } = req.params;
        const { isPublished, passingScore, questions } = req.body;

        // Upsert the main Assessment record
        const assessmentTitle = 'Concept Quiz';

        let assessment = await prisma.assessment.findFirst({
            where: { conceptId, type: 'CONCEPT_QUIZ' }
        });

        if (assessment) {
            assessment = await prisma.assessment.update({
                where: { id: assessment.id },
                data: {
                    isPublished: Boolean(isPublished),
                    passingScore: passingScore ? Number(passingScore) : 70
                }
            });
        } else {
            assessment = await prisma.assessment.create({
                data: {
                    conceptId,
                    type: 'CONCEPT_QUIZ',
                    title: assessmentTitle,
                    isPublished: Boolean(isPublished),
                    passingScore: passingScore ? Number(passingScore) : 70
                }
            });
        }

        // Manage Questions
        if (Array.isArray(questions)) {
            // Keep track of provided IDs to delete the ones removed
            const incomingIds = questions.filter(q => q.id).map(q => q.id);

            await prisma.question.deleteMany({
                where: {
                    assessmentId: assessment.id,
                    id: { notIn: incomingIds }
                }
            });

            for (let i = 0; i < questions.length; i++) {
                const q = questions[i];
                if (q.id) {
                    await prisma.question.update({
                        where: { id: q.id },
                        data: {
                            prompt: q.prompt,
                            options: q.options,
                            correctAnswer: q.correctAnswer,
                            explanation: q.explanation,
                            points: q.points || 1,
                            order: i
                        }
                    });
                } else {
                    await prisma.question.create({
                        data: {
                            assessmentId: assessment.id,
                            type: 'MCQ', // hardcoded for MVP
                            prompt: q.prompt,
                            options: q.options,
                            correctAnswer: q.correctAnswer,
                            explanation: q.explanation,
                            points: q.points || 1,
                            order: i
                        }
                    });
                }
            }
        }

        // Fetch refreshed
        const refreshed = await prisma.assessment.findUnique({
            where: { id: assessment.id },
            include: { questions: { orderBy: { order: 'asc' } } }
        });

        res.json({ success: true, data: refreshed });
    } catch (err) { next(err); }
});

export default router;
