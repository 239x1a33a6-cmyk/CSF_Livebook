// ─── Common API Response Shapes ───────────────────────────────────────────────

export interface ApiSuccess<T> {
    success: true;
    data: T;
}

export interface ApiError {
    success: false;
    error: {
        code: string;
        message: string;
        details?: unknown;
    };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthUser {
    id: string;
    name: string;
    email: string;
    role: 'STUDENT' | 'ADMIN';
}

// ─── Curriculum ───────────────────────────────────────────────────────────────

export interface SubjectDto {
    id: string;
    name: string;
    slug: string;
    description: string;
    icon?: string;
    order: number;
    moduleCount: number;
    conceptCount: number;
}

export interface ModuleDto {
    id: string;
    subjectId: string;
    name: string;
    slug: string;
    description: string;
    order: number;
    conceptCount: number;
}

export interface ConceptDto {
    id: string;
    moduleId: string;
    conceptCode: string;
    title: string;
    slug: string;
    description: string;
    estimatedMinutes: number;
    difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
    order: number;
    learningObjectives?: string[];
}

// ─── Quiz (client-safe — no answers) ─────────────────────────────────────────

export interface QuizOptionDto {
    id: string;
    text: string;
}

export interface QuizQuestionDto {
    id: string;
    type: 'MCQ' | 'MATCHING' | 'SHORT_ANSWER' | 'SCENARIO' | 'OUTPUT_PREDICTION' | 'MISCONCEPTION_DETECTION' | 'COMPARISON';
    prompt: string;
    options?: QuizOptionDto[];
    points: number;
    order: number;
    // correctAnswer is NEVER included here
}

export interface QuizDto {
    assessmentId: string;
    title: string;
    questionCount: number;
    timeLimit?: number;
    passingScore: number;
    questions: QuizQuestionDto[];
}

// ─── Quiz Submission ──────────────────────────────────────────────────────────

export interface QuizAnswerSubmission {
    questionId: string;
    response: unknown; // MCQ: string (optionId), SHORT_ANSWER: string, MATCHING: Record<string,string>
}

export interface QuizSubmissionPayload {
    answers: QuizAnswerSubmission[];
}

export interface QuizResultDto {
    attemptId: string;
    score: number;          // percentage 0-100
    rawScore: number;
    maxScore: number;
    passed: boolean;
    passingScore: number;
    answers: Array<{
        questionId: string;
        isCorrect: boolean | null; // null = pending manual review
        score: number;
        explanation?: string;
    }>;
}

// ─── Progress ─────────────────────────────────────────────────────────────────

export interface ConceptProgressDto {
    conceptId: string;
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
    startedAt?: string;
    completedAt?: string;
    lastAccessedAt: string;
    bestScore?: number;
    attemptsCount: number;
}

export interface DashboardSubjectDto extends SubjectDto {
    progress: {
        completed: number;
        total: number;
        percentage: number;
    };
    modules: Array<ModuleDto & {
        concepts: Array<ConceptDto & { progress?: ConceptProgressDto }>;
    }>;
}
