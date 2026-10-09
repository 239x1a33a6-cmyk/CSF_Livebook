import { z } from 'zod';

export const quizSubmissionSchema = z.object({
    body: z.object({
        answers: z
            .array(
                z.object({
                    questionId: z.string().cuid(),
                    response: z.unknown(),
                }),
            )
            .min(1, 'At least one answer is required'),
    }),
});
