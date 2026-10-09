import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import type { QuizResultDto } from '@shared/types/api';

export function QuizResultPage() {
    const { conceptSlug, attemptId } = useParams<{ conceptSlug: string; attemptId: string }>();
    const [result, setResult] = useState<QuizResultDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // NOTE: For Phase 1 MVP, we can fetch the attempt via a direct endpoint 
    // if created, or simulate it. We didn't explicitly specify GET /api/attempts/:id
    // But we can quickly fetch it from the backend by assuming standard conventions.
    // Actually, we'll need to fetch the attempt data from the backend. 
    // Let's create an endpoint in the client service just for this, or just hit the API directly.

    useEffect(() => {
        // In a real app we'd have a service method. For brevity in MVP:
        api.get(`/assessments/attempts/${attemptId}`)
            .then((res) => setResult(res.data.data))
            .catch(() => setError('Failed to load result.'))
            .finally(() => setIsLoading(false));
    }, [attemptId]);

    if (isLoading) return <div className="w-full h-[calc(100vh-3.5rem)] overflow-y-auto"><div className="page-container py-8"><div className="h-8 w-64 bg-gray-200 rounded animate-pulse" /></div></div>;
    if (error || !result) return <div className="w-full h-[calc(100vh-3.5rem)] overflow-y-auto"><div className="page-container py-8"><p className="text-red-600 text-sm">{error || 'Result not found'}</p></div></div>;

    return (
        <div className="w-full h-[calc(100vh-3.5rem)] overflow-y-auto bg-gray-50 flex items-start justify-center p-4">
            <div className="w-full max-w-3xl pb-16">
                <div className="text-center mb-10 mt-6">
                    <div className="text-6xl mb-4">{result.passed ? '🎉' : '📚'}</div>
                    <h1 className="text-3xl font-semibold text-gray-900 mb-2">
                        {result.passed ? 'Quiz Passed!' : 'Keep Practicing'}
                    </h1>
                    <p className="text-gray-600">
                        You scored <span className="font-semibold text-gray-900">{Math.round(result.score)}%</span>
                        (Passing score: {result.passingScore}%)
                    </p>
                </div>

                <div className="space-y-6">
                    <h2 className="text-lg font-semibold text-gray-900">Review Answers</h2>
                    {result.answers.map((ans, i) => (
                        <div key={ans.questionId} className={`card p-5 border-l-4 ${ans.isCorrect === true ? 'border-l-green-500 bg-green-50' :
                            ans.isCorrect === false ? 'border-l-red-500 bg-red-50' :
                                'border-l-yellow-500 bg-yellow-50'
                            }`}>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="font-mono text-sm opacity-60">Q{i + 1}</span>
                                {ans.isCorrect === true ? (
                                    <span className="badge-green">Correct</span>
                                ) : ans.isCorrect === false ? (
                                    <span className="badge-red">Incorrect</span>
                                ) : (
                                    <span className="badge-yellow">Needs Manual Review</span>
                                )}
                            </div>
                            {ans.explanation && (
                                <div className="text-sm mt-3 pt-3 border-t border-gray-200/50">
                                    <p className="font-semibold text-gray-700 opacity-80 mb-1">Explanation</p>
                                    <p className="text-gray-800">{ans.explanation}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="mt-10 pt-6 border-t border-gray-200 flex justify-end gap-4">
                    <Link to={`/concepts/${conceptSlug}`} className="btn-secondary">
                        Review Concept
                    </Link>
                    <Link to={`/concepts/${conceptSlug}/quiz`} className="btn-primary">
                        Try Again
                    </Link>
                    <Link to="/dashboard" className="btn-ghost">
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
