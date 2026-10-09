import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { modulesService } from '../services/curriculum.service';
import { BreadcrumbNav } from '../components/navigation/BreadcrumbNav';

type Difficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

const difficultyBadge: Record<Difficulty, string> = {
    BEGINNER: 'badge-green',
    INTERMEDIATE: 'badge-yellow',
    ADVANCED: 'badge-red',
};

export function ModulePage() {
    const { moduleId } = useParams<{ moduleId: string }>();
    const [mod, setMod] = useState<ModuleDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!moduleId) return;
        modulesService.getById(moduleId)
            .then(setMod)
            .catch(() => setError('Module not found.'))
            .finally(() => setIsLoading(false));
    }, [moduleId]);

    if (isLoading) return <div className="w-full h-[calc(100vh-3.5rem)] overflow-y-auto"><div className="page-container py-8"><div className="h-8 w-64 bg-gray-200 rounded animate-pulse" /></div></div>;
    if (error || !mod) return <div className="w-full h-[calc(100vh-3.5rem)] overflow-y-auto"><div className="page-container py-8"><p className="text-red-600 text-sm">{error || 'Not found'}</p></div></div>;

    return (
        <div className="w-full h-[calc(100vh-3.5rem)] overflow-y-auto">
            <div className="page-container py-8">
                {/* Breadcrumb */}
                <BreadcrumbNav items={[
                    { label: 'Dashboard', path: '/dashboard' },
                    { label: mod.subject.name, path: `/subjects/${mod.subject.slug}` },
                    { label: mod.name }
                ]} />

                <h1 className="text-2xl font-semibold text-gray-900 mb-2">{mod.name}</h1>
                <p className="text-sm text-gray-600 mb-8 max-w-2xl">{mod.description}</p>

                {/* Concepts */}
                <div className="space-y-4 shadow-sm rounded-xl overflow-hidden border border-gray-100">
                    {mod.concepts.map((concept, index) => {
                        const isAvail = concept.isPublished;
                        const ConceptWrapper = isAvail ? Link : 'div';
                        return (
                            <ConceptWrapper
                                key={concept.id}
                                to={isAvail ? `/concepts/${concept.slug}` : '#'}
                                className={`p-5 flex flex-col md:flex-row md:items-center justify-between group bg-white border-b border-gray-100 last:border-b-0 ${isAvail ? 'hover:bg-gray-50 transition-colors cursor-pointer' : 'opacity-60 cursor-default bg-gray-50/50'}`}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-4 md:mb-0">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-mono text-gray-400 w-6">{index + 1}</span>
                                        <span className="badge-gray text-xs">{concept.conceptCode}</span>
                                    </div>
                                    <div>
                                        <h3 className={`text-sm font-semibold mb-1 ${isAvail ? 'text-gray-900 group-hover:text-brand-700 transition-colors' : 'text-gray-600'}`}>
                                            {concept.title}
                                        </h3>
                                        <p className="text-xs text-gray-500 leading-relaxed max-w-xl">{concept.description}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 flex-shrink-0 ml-10 sm:ml-[4.5rem] md:ml-4">
                                    {!isAvail && <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 bg-gray-100 px-2 py-1 rounded">Coming Soon</span>}
                                    <span className={`${difficultyBadge[concept.difficulty as Difficulty]} text-[10px] px-2 py-1`}>
                                        {concept.difficulty}
                                    </span>
                                    <span className="text-xs text-gray-400 whitespace-nowrap">{concept.estimatedMinutes} min</span>
                                    {isAvail && (
                                        <div className="hidden md:flex ml-2 w-6 h-6 items-center justify-center rounded-full bg-brand-50 text-brand-600 group-hover:bg-brand-100 transition-colors text-lg">
                                            &rsaquo;
                                        </div>
                                    )}
                                </div>
                            </ConceptWrapper>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

interface ModuleDetail {
    id: string; name: string; description: string;
    subject: { id: string; name: string; slug: string };
    concepts: Array<{ id: string; conceptCode: string; title: string; slug: string; difficulty: string; estimatedMinutes: number; description: string; isPublished: boolean }>;
}
