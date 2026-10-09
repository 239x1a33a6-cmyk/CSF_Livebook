import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { assessmentController } from '../controllers/assessment.controller';
import { validate } from '../middleware/validate';
import { quizSubmissionSchema } from '../validators/assessment.validator';

const router = Router();

router.use(requireAuth);
router.post('/:assessmentId/attempts', validate(quizSubmissionSchema), assessmentController.submitAttempt);
router.get('/attempts/:attemptId', assessmentController.getAttempt);

export default router;
