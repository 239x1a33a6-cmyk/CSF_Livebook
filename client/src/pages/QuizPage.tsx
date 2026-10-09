import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { conceptsService, quizService } from '../services/curriculum.service';
import type { QuizDto, QuizQuestionDto } from '@shared/types/api';

export function QuizPage() {
    const { conceptSlug } = useParams<{ conceptSlug: string }>();
    const navigate = useNavigate();

    const [concept, setConcept] = useState<{ id: string; title: string, slug: string } | null>(null);
    const [quiz, setQuiz] = useState<QuizDto | null>(null);
    const [answers, setAnswers] = useState<Record<string, unknown>>({});

    // Quiz Progress State
    const [currentIndex, setCurrentIndex] = useState(0);

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!conceptSlug) return;

        conceptsService.getBySlug(conceptSlug)
            .then((res) => {
                setConcept(res.concept);
                return conceptsService.getQuiz(res.concept.id);
            })
            .then((quizData) => {
                setQuiz(quizData as QuizDto);
            })
            .catch(() => setError('Failed to load quiz.'))
            .finally(() => setIsLoading(false));
    }, [conceptSlug]);

    const handleSubmit = async () => {
        if (!quiz || !concept) return;
        setIsSubmitting(true);

        try {
            const submission = Object.entries(answers).map(([questionId, response]) => ({
                questionId,
                response,
            }));

            const result = await quizService.submitAttempt(quiz.assessmentId, submission);
            navigate(`/concepts/${concept.slug}/quiz/result/${result.attemptId}`);
        } catch (err) {
            setError('Failed to submit quiz. Please try again.');
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <div className="w-full h-[calc(100vh-3.5rem)] overflow-y-auto"><div className="page-container py-8"><div className="h-8 w-64 bg-gray-200 rounded animate-pulse" /></div></div>;
    if (error || !quiz || !concept) return <div className="w-full h-[calc(100vh-3.5rem)] overflow-y-auto"><div className="page-container py-8"><p className="text-red-600 text-sm">{error || 'Not found'}</p></div></div>;

    const answeredCount = Object.keys(answers).length;
    const isComplete = answeredCount === quiz.questions.length;

    const currentQuestion = quiz.questions[currentIndex];

    const handleNext = () => {
        if (currentIndex < quiz.questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else if (isComplete) {
            handleSubmit();
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const progressPercentage = Math.round(((currentIndex + 1) / quiz.questionCount) * 100);

    return (
        <div className="w-full h-[calc(100vh-3.5rem)] overflow-y-auto bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                {/* Header Context */}
                <div className="mb-6 text-center">
                    <h1 className="text-xl font-semibold text-gray-900 mb-1">{quiz.title}</h1>
                    <p className="text-sm text-gray-500">Self-Assessment • {concept.title}</p>
                </div>

                {/* Question Card */}
                <div className="card overflow-hidden border-gray-200 shadow-md bg-white">
                    {/* Progress Bar */}
                    <div className="h-1.5 w-full bg-gray-100">
                        <div
                            className="h-full bg-brand-500 transition-all duration-300 ease-out"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>

                    <div className="p-8">
                        {/* Question Meta */}
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-sm font-semibold text-gray-500 uppercase tracking-widest">
                                Question {currentIndex + 1} of {quiz.questionCount}
                            </span>
                            {!!answers[currentQuestion.id] && (
                                <span className="badge-green text-[10px]">Answered</span>
                            )}
                        </div>

                        {/* Question Renderer */}
                        <QuestionRenderer
                            question={currentQuestion}
                            value={answers[currentQuestion.id]}
                            onChange={(val) => setAnswers(prev => ({ ...prev, [currentQuestion.id]: val }))}
                        />

                        {/* Navigation Actions */}
                        <div className="mt-10 pt-6 border-t border-gray-100 flex items-center justify-between">
                            <button
                                onClick={handlePrev}
                                disabled={currentIndex === 0 || isSubmitting}
                                className="btn-ghost px-0 text-gray-500 hover:text-gray-900"
                            >
                                &larr; Previous
                            </button>

                            {currentIndex < quiz.questions.length - 1 ? (
                                <button
                                    onClick={handleNext}
                                    className="btn-primary"
                                >
                                    Next Question &rarr;
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    disabled={!isComplete || isSubmitting}
                                    className="btn-primary shadow-sm"
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit Attempt'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function QuestionRenderer({ question, value, onChange }: {
    question: QuizQuestionDto;
    value: unknown;
    onChange: (val: unknown) => void;
}) {
    return (
        <div>
            <p className="text-lg text-gray-900 font-medium mb-6 whitespace-pre-line leading-relaxed">
                {question.prompt}
            </p>

            {question.type === 'MCQ' || question.type === 'SCENARIO' || question.type === 'OUTPUT_PREDICTION' || question.type === 'MISCONCEPTION_DETECTION' || question.type === 'COMPARISON' ? (
                <div className="space-y-3">
                    {question.options?.map((opt) => (
                        <label
                            key={opt.id}
                            className={`flex items-start gap-4 p-4 rounded-xl cursor-pointer border-2 transition-all ${value === opt.id
                                ? 'border-brand-500 bg-brand-50 shadow-sm'
                                : 'border-gray-200 hover:border-brand-200 hover:bg-gray-50'
                                }`}
                        >
                            <input
                                type="radio"
                                name={`q-${question.id}`}
                                value={opt.id}
                                checked={value === opt.id}
                                onChange={() => onChange(opt.id)}
                                className="accent-brand-600 w-4 h-4 mt-1 flex-shrink-0"
                            />
                            <span className={`text-sm leading-relaxed ${value === opt.id ? 'text-brand-900 font-medium' : 'text-gray-700'}`}>
                                {opt.text}
                            </span>
                        </label>
                    ))}
                </div>
            ) : question.type === 'SHORT_ANSWER' ? (
                <textarea
                    value={(value as string) || ''}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Type your answer here..."
                    className="form-input min-h-[120px] resize-y text-base p-4"
                />
            ) : (
                <div className="text-sm text-red-500">Unsupported question type UI</div>
            )}
        </div>
    );
}
