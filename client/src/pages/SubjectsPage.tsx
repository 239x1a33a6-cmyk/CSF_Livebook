import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { progressService } from '../services/curriculum.service';

export function SubjectsPage() {
    const [subjects, setSubjects] = useState<unknown[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        progressService.getDashboard()
            .then(setSubjects)
            .catch(() => setError('Failed to load subjects. Please refresh.'))
            .finally(() => setIsLoading(false));
    }, []);

    if (isLoading) return <div className="page-container py-8"><div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-8" /></div>;
    if (error) return <div className="page-container py-8"><div className="bg-red-50 border border-red-200 text-red-700 text-sm p-4 rounded-lg">{error}</div></div>;

    return (
        <div className="page-container py-8 max-w-7xl mx-auto">
            {/* Breadcrumb */}
            <nav className="text-xs text-gray-400 mb-6 flex items-center gap-1">
                <Link to="/dashboard" className="hover:text-gray-600">Dashboard</Link>
                <span>/</span>
                <span className="text-gray-600">All Subjects</span>
            </nav>

            <div className="mb-8">
                <h1 className="text-3xl font-semibold text-gray-900">Curriculum</h1>
                <p className="text-sm text-gray-600 mt-2 max-w-2xl">Explore all available Computer Science fundamentals subjects, modules, and concepts.</p>
            </div>

            <div className="space-y-4">
                {(subjects as any[]).map((subject) => {
                    const isAvailable = subject.isPublished;
                    return (
                        <div key={subject.id} className={`card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 ${!isAvailable ? 'opacity-70 bg-gray-50/50' : ''}`}>
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    {subject.icon && <span className="text-3xl">{subject.icon}</span>}
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h2 className="text-lg font-semibold text-gray-900">{subject.name}</h2>
                                            {!isAvailable && <span className="badge-gray text-xs">Coming Soon</span>}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {subject.moduleCount} modules · {subject.conceptCount} concepts
                                        </p>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 mt-3">{subject.description}</p>
                            </div>

                            <div className="w-full md:w-64 flex-shrink-0 flex flex-col justify-center">
                                {isAvailable ? (
                                    <>
                                        <div className="mb-3">
                                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                                                <span>{subject.progress.completed} / {subject.progress.total} completed</span>
                                                <span className="font-medium text-gray-700">{subject.progress.percentage}%</span>
                                            </div>
                                            <div className="progress-bar h-2">
                                                <div className="progress-fill" style={{ width: `${subject.progress.percentage}%` }} />
                                            </div>
                                        </div>
                                        <Link to={`/subjects/${subject.slug}`} className="btn-primary w-full justify-center">
                                            {subject.progress.percentage > 0 ? 'Continue Subject →' : 'Start Learning →'}
                                        </Link>
                                    </>
                                ) : (
                                    <button disabled className="btn-secondary w-full justify-center opacity-50 cursor-not-allowed">
                                        Content being prepared
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
