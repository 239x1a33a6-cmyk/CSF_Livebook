import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { subjectsController } from '../controllers/curriculum.controller';

const router = Router();

router.use(requireAuth);
router.get('/', subjectsController.getAll);
router.get('/:slug', subjectsController.getBySlug);
router.get('/:subjectId/modules', subjectsController.getModules);

export default router;
