import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { subjectsService } from '../../services/curriculum.service';

interface ConceptMeta {
    id: string;
    conceptCode: string;
    title: string;
    slug: string;
    status: 'COMPLETED' | 'IN_PROGRESS' | 'NOT_STARTED'; // Aggregated from progress
}

interface ModuleMeta {
    id: string;
    name: string;
    slug: string;
    concepts: ConceptMeta[];
}

interface SubjectMeta {
    id: string;
    name: string;
    slug: string;
    modules: ModuleMeta[];
}

export function CurriculumSidebar({ subjectSlug }: { subjectSlug?: string }) {
    const location = useLocation();
    const [subjectData, setSubjectData] = useState<SubjectMeta | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!subjectSlug) return;

        async function fetchCurriculum() {
            setLoading(true);
            try {
                // We assume there's an API that returns Subject -> Modules -> Concepts tree.
                // If not natively available, we might fetch Subject, then modules, but typically this is returned as heavily nested.
                // Let's call subjectsService.getBySlug
                const res = await subjectsService.getBySlug(subjectSlug as string);
                setSubjectData(res);
            } catch (err) {
                console.error("Error fetching curriculum", err);
            } finally {
                setLoading(false);
            }
        }

        fetchCurriculum();
    }, [subjectSlug]);

    if (!subjectSlug) return null; // Don't show sidebar if not in a subject context

    if (loading) {
        return (
            <div className="w-64 flex-shrink-0 animate-pulse border-r border-gray-800 bg-[#0b0c0c] h-screen overflow-y-auto p-4 hidden md:block">
                <div className="h-4 bg-gray-800 rounded w-1/2 mb-4"></div>
                <div className="h-3 bg-gray-800 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-800 rounded w-full mb-2"></div>
            </div>
        );
    }

    if (!subjectData) return null;

    return (
        <div className="w-64 flex-shrink-0 border-r border-gray-800 bg-[#0b0c0c] h-[calc(100vh-3.5rem)] overflow-y-auto hidden md:block">
            <div className="p-4 border-b border-gray-800">
                <h3 className="text-sm font-bold text-gray-200 truncate" title={subjectData.name}>
                    {subjectData.name}
                </h3>
            </div>

            <div className="py-2">
                {subjectData.modules?.map((m) => (
                    <div key={m.id} className="mb-4">
                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            {m.name}
                        </div>
                        <ul className="mt-1 space-y-0.5">
                            {m.concepts?.map((c) => {
                                const isActive = location.pathname.includes(`/concepts/${c.slug}`);

                                // Map Status Icons
                                let Icon = "○";
                                let textColor = "text-gray-500";
                                if (c.status === "COMPLETED") { Icon = "✓"; textColor = "text-brand-600"; }
                                else if (c.status === "IN_PROGRESS") { Icon = "◐"; textColor = "text-brand-500"; }
                                // Assuming we might have a coming soon logic not currently in types, omit for now.

                                return (
                                    <li key={c.id}>
                                        <Link
                                            to={`/concepts/${c.slug}`}
                                            className={`group flex items-start gap-2 px-4 py-1.5 text-sm transition-colors ${isActive
                                                ? 'bg-brand-900/20 text-brand-400 font-medium border-r-2 border-brand-500'
                                                : 'text-gray-400 hover:bg-[#151718] hover:text-gray-200'
                                                }`}
                                        >
                                            <span className={`mt-0.5 text-xs ${isActive ? 'text-brand-500' : textColor}`}>
                                                {Icon}
                                            </span>
                                            <span className="flex-1 leading-snug">
                                                <span className="font-mono text-xs text-gray-600 mr-1.5">{c.conceptCode}</span>
                                                {c.title}
                                            </span>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
}
