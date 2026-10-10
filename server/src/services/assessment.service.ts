import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';

interface AnswerSubmission {
    questionId: string;
    response: unknown;
}

export const assessmentService = {
    async submitAttempt(assessmentId: string, userId: string, answers: AnswerSubmission[]) {
        // 1. Validate assessment exists
        const assessment = await prisma.assessment.findUnique({
            where: { id: assessmentId, isPublished: true },
            include: {
                questions: {
                    select: { id: true, type: true, correctAnswer: true, points: true },
                },
                concept: { select: { id: true } },
            },
        });
        if (!assessment) {
            throw new AppError('ASSESSMENT_NOT_FOUND', 'Assessment not found', 404);
        }

        // 2. Build lookup maps
        const questionMap = new Map(assessment.questions.map((q) => [q.id, q]));

        // 3. Evaluate answers server-side
        let rawScore = 0;
        let maxScore = 0;
        const evaluatedAnswers: Array<{
            questionId: string;
            response: unknown;
            isCorrect: boolean | null;
            score: number;
            explanation?: string | null;
        }> = [];

        for (const answer of answers) {
            const question = questionMap.get(answer.questionId);
            if (!question) continue;

            maxScore += question.points;
            const { isCorrect, score } = evaluateAnswer(
                question.type,
                answer.response,
                question.correctAnswer,
                question.points,
            );
            rawScore += score;
            evaluatedAnswers.push({
                questionId: answer.questionId,
                response: answer.response as object,
                isCorrect,
                score,
            });
        }

        const scorePercentage = maxScore > 0 ? (rawScore / maxScore) * 100 : 0;

        // 4. Persist attempt + answers in one transaction
        const attempt = await prisma.assessmentAttempt.create({
            data: {
                userId,
                assessmentId,
                status: 'EVALUATED',
                score: scorePercentage,
                rawScore,
                maxScore,
                submittedAt: new Date(),
                answers: {
                    create: evaluatedAnswers.map((a) => ({
                        questionId: a.questionId,
                        response: a.response as object,
                        isCorrect: a.isCorrect,
                        score: a.score,
                    })),
                },
            },
        });

        // 5. Update concept progress
        const passed = scorePercentage >= assessment.passingScore;

        if (assessment.concept) {
            const conceptId = assessment.concept.id;

            await prisma.userConceptProgress.upsert({
                where: { userId_conceptId: { userId, conceptId } },
                create: {
                    userId,
                    conceptId,
                    status: passed ? 'COMPLETED' : 'IN_PROGRESS',
                    startedAt: new Date(),
                    completedAt: passed ? new Date() : null,
                    lastAccessedAt: new Date(),
                    bestScore: scorePercentage,
                    attemptsCount: 1,
                },
                update: {
                    lastAccessedAt: new Date(),
                    attemptsCount: { increment: 1 },
                    ...(passed
                        ? {
                            status: 'COMPLETED',
                            completedAt: new Date(),
                        }
                        : {}),
                    bestScore: {
                        // Keep the best score — handled in a separate update below
                    },
                },
            });

            // Update bestScore separately (can't use conditional in upsert set)
            await prisma.userConceptProgress.updateMany({
                where: {
                    userId,
                    conceptId,
                    OR: [{ bestScore: null }, { bestScore: { lt: scorePercentage } }],
                },
                data: { bestScore: scorePercentage },
            });
        }

        // 6. Return result (with explanations, without answer keys)
        const questionsWithExplanations = await prisma.question.findMany({
            where: { id: { in: evaluatedAnswers.map((a) => a.questionId) } },
            select: { id: true, explanation: true },
        });
        const explanationMap = new Map(questionsWithExplanations.map((q) => [q.id, q.explanation]));

        return {
            attemptId: attempt.id,
            score: scorePercentage,
            rawScore,
            maxScore,
            passed,
            passingScore: assessment.passingScore,
            answers: evaluatedAnswers.map((a) => ({
                questionId: a.questionId,
                isCorrect: a.isCorrect,
                score: a.score,
                explanation: explanationMap.get(a.questionId) ?? undefined,
            })),
        };
    },

    async getAttemptResult(attemptId: string, userId: string) {
        const attempt = await prisma.assessmentAttempt.findUnique({
            where: { id: attemptId },
            include: {
                assessment: { select: { passingScore: true } },
                answers: {
                    include: {
                        question: { select: { explanation: true } }
                    }
                }
            }
        });

        if (!attempt) throw new AppError('ATTEMPT_NOT_FOUND', 'Attempt not found', 404);
        if (attempt.userId !== userId) throw new AppError('FORBIDDEN', 'Access denied', 403);

        const passed = (attempt.score || 0) >= attempt.assessment.passingScore;

        return {
            attemptId: attempt.id,
            score: attempt.score,
            rawScore: attempt.rawScore,
            maxScore: attempt.maxScore,
            passed,
            passingScore: attempt.assessment.passingScore,
            answers: attempt.answers.map((a) => ({
                questionId: a.questionId,
                isCorrect: a.isCorrect,
                score: a.score,
                explanation: a.question.explanation,
            })),
        };
    }
};

// ─── Server-side answer evaluator ────────────────────────────────────────────
function evaluateAnswer(
    type: string,
    response: unknown,
    correctAnswer: unknown,
    points: number,
): { isCorrect: boolean | null; score: number } {
    if (!correctAnswer) {
        // SHORT_ANSWER or ungraded — mark as pending manual review
        return { isCorrect: null, score: 0 };
    }

    const correct = correctAnswer as Record<string, unknown>;

    switch (type) {
        case 'MCQ':
        case 'SCENARIO':
        case 'OUTPUT_PREDICTION':
        case 'MISCONCEPTION_DETECTION': {
            const isCorrect = response === correct['optionId'];
            return { isCorrect, score: isCorrect ? points : 0 };
        }
        case 'MATCHING': {
            // response: { [leftId]: rightId }
            const resp = response as Record<string, string>;
            const pairs = correct['pairs'] as Array<{ left: string; right: string }>;
            if (!pairs) return { isCorrect: null, score: 0 };
            const correctCount = pairs.filter((p) => resp[p.left] === p.right).length;
            const partialScore = (correctCount / pairs.length) * points;
            const isCorrect = correctCount === pairs.length;
            return { isCorrect, score: partialScore };
        }
        case 'COMPARISON': {
            // Treat like MCQ for Phase 1
            const isCorrect = response === correct['optionId'];
            return { isCorrect, score: isCorrect ? points : 0 };
        }
        case 'SHORT_ANSWER':
        default:
            return { isCorrect: null, score: 0 };
    }
}
