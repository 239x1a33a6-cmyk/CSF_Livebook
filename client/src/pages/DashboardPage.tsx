import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { progressService } from '../services/curriculum.service';

export function DashboardPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [subjects, setSubjects] = useState<unknown[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        progressService.getDashboard()
            .then(setSubjects)
            .catch(() => setError('Failed to load dashboard. Please refresh.'))
            .finally(() => setIsLoading(false));
    }, []);

    if (isLoading) return <PageLoading />;
    if (error) return <PageError message={error} />;

    const typedSubjects = subjects as DashboardSubject[];

    // Calculate overall stats
    const totalConcepts = typedSubjects.reduce((sum, s) => sum + s.conceptCount, 0);
    const completedConcepts = typedSubjects.reduce((sum, s) => sum + s.progress.completed, 0);
    const overallPercentage = totalConcepts > 0 ? Math.round((completedConcepts / totalConcepts) * 100) : 0;
    const subjectsStarted = typedSubjects.filter(s => s.progress.completed > 0).length;

    // Find the most recently accessed IN_PROGRESS concept
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let bestContinueItem: any = null;
    let latestTime = 0;

    typedSubjects.forEach(s => {
        s.modules.forEach(m => {
            m.concepts.forEach(c => {
                if (c.progress && c.progress.status !== 'COMPLETED' && c.progress.lastAccessedAt) {
                    const time = new Date(c.progress.lastAccessedAt).getTime();
                    if (time > latestTime) {
                        latestTime = time;
                        bestContinueItem = { subject: s, module: m, concept: c };
                    }
                }
            });
        });
    });

    return (
        <div className="w-full h-[calc(100vh-3.5rem)] overflow-y-auto">
            <div className="page-container py-8 max-w-7xl mx-auto">
                {/* Header & Continue Learning */}
                <div className="mb-10 flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-gray-200 pb-8">
                    <div>
                        <h1 className="text-3xl font-semibold text-gray-900 mb-2">
                            Welcome back, {user?.name?.split(' ')[0]}
                        </h1>
                        {bestContinueItem ? (
                            <div>
                                <p className="text-sm text-gray-600 mb-3">Continue where you left off</p>
                                <div className="border border-brand-200 bg-brand-50 rounded-xl p-4 inline-block">
                                    <div className="text-xs text-brand-600 font-medium mb-1">
                                        {bestContinueItem!.subject.name} &rarr; {bestContinueItem!.module.name}
                                    </div>
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3">
                                        {bestContinueItem!.concept.conceptCode} &mdash; {bestContinueItem!.concept.title}
                                    </h3>
                                    <button
                                        onClick={() => navigate(`/concepts/${bestContinueItem!.concept.slug}`)}
                                        className="btn-primary"
                                    >
                                        Continue Learning &rarr;
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <p className="text-sm text-gray-600 mb-3">Start your learning journey</p>
                                <button onClick={() => navigate('/subjects')} className="btn-primary">
                                    Explore Subjects &rarr;
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Overall Progress Widget */}
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 min-w-[280px]">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">Your Learning Progress</h3>

                        <div className="mb-4">
                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                                <span>Overall Progress</span>
                                <span className="font-semibold text-gray-900">{overallPercentage}%</span>
                            </div>
                            <div className="progress-bar h-2">
                                <div className="progress-fill" style={{ width: `${overallPercentage}%` }} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-gray-500 mb-0.5">Concepts Completed</p>
                                <p className="text-sm font-semibold text-gray-900">{completedConcepts} / {totalConcepts}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-0.5">Subjects Started</p>
                                <p className="text-sm font-semibold text-gray-900">{subjectsStarted} / {typedSubjects.length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Subject Grid */}
                <div className="mb-6 flex justify-between items-end">
                    <h2 className="text-xl font-semibold text-gray-900">Subjects</h2>
                    <Link to="/subjects" className="text-sm text-brand-600 hover:text-brand-700 font-medium">View all &rarr;</Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {typedSubjects.map((subject) => (
                        <SubjectCard key={subject.id} subject={subject} />
                    ))}
                </div>

                {typedSubjects.length === 0 && (
                    <div className="text-center py-16 text-gray-400">
                        <div className="text-4xl mb-3">📚</div>
                        <p className="text-sm">No subjects available yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface DashboardSubject {
    id: string; name: string; slug: string; description: string; icon?: string;
    isPublished: boolean; moduleCount: number; conceptCount: number;
    progress: { completed: number; total: number; percentage: number };
    modules: Array<{ name: string; concepts: Array<{ conceptCode: string; title: string; slug: string; progress?: { status: string; lastAccessedAt?: string } }> }>;
}

// ── Sub-components ────────────────────────────────────────────────────────────
function SubjectCard({ subject }: { subject: DashboardSubject }) {
    const { completed, total, percentage } = subject.progress;
    const isAvailable = subject.isPublished;

    return (
        <Link
            to={isAvailable ? `/subjects/${subject.slug}` : '#'}
            className={`card p-5 flex flex-col gap-4 ${isAvailable ? 'card-hover cursor-pointer group' : 'opacity-70 bg-gray-50/50 cursor-default'}`}
        >
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    {subject.icon && <span className="text-2xl">{subject.icon}</span>}
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className={`font-semibold text-sm ${isAvailable ? 'text-gray-900 group-hover:text-brand-600 transition-colors' : 'text-gray-600'}`}>
                                {subject.name}
                            </h2>
                            {!isAvailable && <span className="badge-gray text-[10px] py-0">Soon</span>}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                            {subject.moduleCount} modules · {subject.conceptCount} concepts
                        </p>
                    </div>
                </div>
            </div>

            <p className="text-xs text-gray-600 line-clamp-2 h-8">{subject.description}</p>

            {/* Progress bar */}
            <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>{completed} / {total} completed</span>
                    <span className="font-medium text-gray-600">{percentage}%</span>
                </div>
                <div className="progress-bar h-1.5">
                    <div className="progress-fill" style={{ width: `${percentage}%` }} />
                </div>
            </div>

            {isAvailable ? (
                <div className="text-xs font-semibold text-brand-600 mt-1">Continue &rarr;</div>
            ) : (
                <div className="text-xs font-semibold text-gray-400 mt-1">Content being prepared</div>
            )}
        </Link>
    );
}

function PageLoading() {
    return (
        <div className="w-full h-[calc(100vh-3.5rem)] overflow-y-auto">
            <div className="page-container py-8 max-w-7xl mx-auto">
                <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-8" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="card p-5 h-40 animate-pulse bg-gray-100" />
                    ))}
                </div>
            </div>
        </div>
    );
}

function PageError({ message }: { message: string }) {
    return (
        <div className="w-full h-[calc(100vh-3.5rem)] overflow-y-auto">
            <div className="page-container py-8 max-w-7xl mx-auto">
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-4 rounded-lg">{message}</div>
            </div>
        </div>
    );
}
