import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { subjectsService } from '../services/curriculum.service';
import { BreadcrumbNav } from '../components/navigation/BreadcrumbNav';

export function SubjectPage() {
    const { subjectSlug } = useParams<{ subjectSlug: string }>();
    const [subject, setSubject] = useState<SubjectDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!subjectSlug) return;
        subjectsService.getBySlug(subjectSlug)
            .then(setSubject)
            .catch(() => setError('Subject not found.'))
            .finally(() => setIsLoading(false));
    }, [subjectSlug]);

    if (isLoading) return <div className="w-full h-[calc(100vh-3.5rem)] overflow-y-auto"><div className="page-container py-8"><div className="h-8 w-64 bg-gray-200 rounded animate-pulse" /></div></div>;
    if (error || !subject) return <div className="w-full h-[calc(100vh-3.5rem)] overflow-y-auto"><div className="page-container py-8"><p className="text-red-600 text-sm">{error || 'Not found'}</p></div></div>;

    return (
        <div className="w-full h-[calc(100vh-3.5rem)] overflow-y-auto">
            <div className="page-container py-8">
                {/* Breadcrumb */}
                <BreadcrumbNav items={[
                    { label: 'Dashboard', path: '/dashboard' },
                    { label: subject.name }
                ]} />

                {/* Subject header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        {subject.icon && <span className="text-3xl">{subject.icon}</span>}
                        <h1 className="text-2xl font-semibold text-gray-900">{subject.name}</h1>
                    </div>
                    <p className="text-sm text-gray-600 max-w-2xl">{subject.description}</p>
                </div>

                {/* Modules */}
                <div className="space-y-4">
                    {subject.modules.map((mod) => (
                        <div key={mod.id} className="card p-5">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h2 className="font-semibold text-gray-900">{mod.name}</h2>
                                    <p className="text-xs text-gray-500 mt-0.5">{mod.concepts.length} concepts</p>
                                </div>
                                <Link to={`/modules/${mod.id}`} className="btn-secondary btn-sm">
                                    View Module →
                                </Link>
                            </div>
                            <p className="text-xs text-gray-600 mb-4">{mod.description}</p>

                            {/* Concept list */}
                            <ul className="divide-y divide-gray-100 mt-2">
                                {mod.concepts.map((c) => {
                                    const isAvail = c.isPublished;
                                    return (
                                        <li key={c.id} className={`py-3 flex items-center justify-between ${!isAvail ? 'opacity-60' : ''}`}>
                                            {isAvail ? (
                                                <Link
                                                    to={`/concepts/${c.slug}`}
                                                    className="text-sm font-medium text-gray-800 hover:text-brand-600 transition-colors flex items-center gap-2"
                                                >
                                                    <span className="badge-gray text-xs">{c.conceptCode}</span>
                                                    {c.title}
                                                </Link>
                                            ) : (
                                                <div className="text-sm font-medium text-gray-600 flex items-center gap-2 cursor-default">
                                                    <span className="badge-gray text-xs">{c.conceptCode}</span>
                                                    {c.title}
                                                </div>
                                            )}
                                            <div className="flex items-center gap-3">
                                                {!isAvail && <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Coming Soon</span>}
                                                <span className="text-xs text-gray-400">{c.estimatedMinutes} min</span>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

interface SubjectDetail {
    id: string; name: string; slug: string; description: string; icon?: string;
    modules: Array<{
        id: string; name: string; description: string;
        concepts: Array<{ id: string; conceptCode: string; title: string; slug: string; estimatedMinutes: number; isPublished: boolean }>;
    }>;
}
