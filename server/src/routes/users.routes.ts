import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { usersController } from '../controllers/assessment.controller';

const router = Router();

router.use(requireAuth);
router.get('/me/progress', usersController.getProgress);
router.get('/me/dashboard', usersController.getDashboard);

export default router;
