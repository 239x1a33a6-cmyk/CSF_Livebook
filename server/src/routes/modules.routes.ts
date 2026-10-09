import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { modulesController } from '../controllers/curriculum.controller';

const router = Router();

router.use(requireAuth);
router.get('/:moduleId', modulesController.getById);
router.get('/:moduleId/concepts', modulesController.getConcepts);

export default router;
