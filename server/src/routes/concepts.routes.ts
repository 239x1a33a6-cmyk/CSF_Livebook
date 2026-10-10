import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { conceptsController } from '../controllers/curriculum.controller';

const router = Router();

router.use(requireAuth);
router.get('/slug/:slug', conceptsController.getBySlug);
router.get('/:conceptId/content', conceptsController.getContent);
router.get('/:conceptId/resources', conceptsController.getResources);
router.get('/:conceptId/quiz', conceptsController.getQuiz);
router.post('/:conceptId/start', conceptsController.startConcept);

export default router;
