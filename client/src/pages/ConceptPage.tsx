import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { conceptsService } from '../services/curriculum.service';
import { ContentRenderer } from '../components/content/ContentRenderer';
import type { ContentBlock } from '@shared/types/content';
import { CurriculumSidebar } from '../components/navigation/CurriculumSidebar';
import { OnThisPageSidebar } from '../components/navigation/OnThisPageSidebar';
import { BreadcrumbNav } from '../components/navigation/BreadcrumbNav';

type RevisionMode = 'SELECTOR' | 'VIDEO' | 'CHEAT_SHEET';

export function ConceptPage() {
    const { conceptSlug } = useParams<{ conceptSlug: string }>();
    const navigate = useNavigate();
    const [concept, setConcept] = useState<ConceptDetail | null>(null);
    const [blocks, setBlocks] = useState<ContentBlock[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [mode, setMode] = useState<RevisionMode>('SELECTOR');

    useEffect(() => {
        if (!conceptSlug) return;
        setIsLoading(true);
        setError('');
        setMode('SELECTOR'); // Reset on concept change

        conceptsService.getBySlug(conceptSlug)
            .then((res) => {
                setConcept(res.concept);
                conceptsService.start(res.concept.id).catch(console.error);
                return conceptsService.getContent(res.concept.id);
            })
            .then((content) => {
                setBlocks(content.blocks as ContentBlock[]);
            })
            .catch(() => setError('Concept not found or failed to load content.'))
            .finally(() => setIsLoading(false));
    }, [conceptSlug]);

    if (isLoading) return <div className="w-full h-[calc(100vh-3.5rem)] overflow-y-auto bg-[#0b0c0c]"><div className="page-container py-8"><div className="h-8 w-64 bg-gray-800 rounded animate-pulse" /></div></div>;
    if (error || !concept) return <div className="w-full h-[calc(100vh-3.5rem)] overflow-y-auto bg-[#0b0c0c]"><div className="page-container py-8"><p className="text-red-400 text-sm">{error || 'Not found'}</p></div></div>;

    const hasVideo = blocks.some(b => b.type === 'video');
    const hasCheatSheet = blocks.some(b => b.type !== 'video' && b.type !== 'understanding_check'); // General assumption

    // Filter blocks depending on mode
    let displayBlocks = blocks;
    if (mode === 'VIDEO') {
        const videoBlock = blocks.find(b => b.type === 'video');
        const recapBlock = blocks.find(b => b.type === 'recap');
        displayBlocks = [videoBlock, recapBlock].filter(Boolean) as ContentBlock[];
    } else if (mode === 'CHEAT_SHEET') {
        displayBlocks = blocks.filter(b => b.type !== 'video');
    }

    return (
        <div className="flex w-full h-[calc(100vh-3.5rem)] overflow-hidden">
            {/* Left Sidebar Curriculum Navigation */}
            <CurriculumSidebar subjectSlug={concept.module.subject.slug} />

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto scroll-smooth">
                <div className="py-8 px-4 sm:px-6 lg:px-12 max-w-4xl mx-auto">
                    {/* Breadcrumbs */}
                    <BreadcrumbNav items={[
                        { label: 'Dashboard', path: '/dashboard' },
                        { label: concept.module.subject.name, path: `/subjects/${concept.module.subject.slug}` },
                        { label: concept.module.name, path: `/modules/${concept.module.id}` },
                        { label: concept.conceptCode }
                    ]} />

                    {/* Concept Header */}
                    <div className="mb-10 border-b border-gray-800 pb-6">
                        <div className="flex items-center gap-3 mb-3">
                            <span className="font-mono text-sm font-semibold text-brand-400 bg-[#151718] px-2 py-0.5 rounded border border-gray-800">{concept.conceptCode}</span>
                            <span className={`text-xs px-2 py-0.5 rounded font-medium border ${concept.difficulty === 'BEGINNER' ? 'bg-[#151718] text-green-400 border-green-800/50' :
                                concept.difficulty === 'INTERMEDIATE' ? 'bg-[#151718] text-yellow-400 border-yellow-800/50' : 'bg-[#151718] text-red-400 border-red-800/50'
                                }`}>{concept.difficulty}</span>
                            <span className="text-xs text-gray-500 font-medium">⏱ {concept.estimatedMinutes} min</span>
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-bold text-gray-100 leading-tight mb-2">
                            {concept.title}
                        </h1>
                    </div>

                    {/* Revision Mode Selector */}
                    {mode === 'SELECTOR' && (
                        <div className="my-10">
                            <h2 className="text-xl font-semibold text-gray-100 mb-6 text-center">How do you want to revise?</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl mx-auto mb-8">
                                {hasVideo && (
                                    <button
                                        onClick={() => setMode('VIDEO')}
                                        className="card p-6 flex flex-col items-center justify-center gap-3 border-gray-800 hover:border-brand-500 hover:ring-1 hover:ring-brand-500 transition-all text-left group"
                                    >
                                        <div className="text-3xl mb-1 filter grayscale group-hover:grayscale-0 transition-all">🎥</div>
                                        <div className="text-center">
                                            <h3 className="font-semibold text-gray-200 mb-1">Watch Video</h3>
                                            <p className="text-xs text-gray-500 mb-3">Optional guided revision (~10 min)</p>
                                        </div>
                                        <span className="text-sm font-semibold text-white bg-brand-600 px-4 py-2 rounded-lg w-full text-center hover:bg-brand-500 transition-colors">Watch Video</span>
                                    </button>
                                )}
                                {hasCheatSheet && (
                                    <button
                                        onClick={() => setMode('CHEAT_SHEET')}
                                        className="card p-6 flex flex-col items-center justify-center gap-3 border-gray-800 hover:border-brand-500 hover:ring-1 hover:ring-brand-500 transition-all text-left group"
                                    >
                                        <div className="text-3xl mb-1 filter grayscale group-hover:grayscale-0 transition-all">📄</div>
                                        <div className="text-center">
                                            <h3 className="font-semibold text-gray-200 mb-1">Cheat Sheet</h3>
                                            <p className="text-xs text-gray-500 mb-3">Fast text revision (~5 min)</p>
                                        </div>
                                        <span className="text-sm font-semibold text-white bg-brand-600 px-4 py-2 rounded-lg w-full text-center hover:bg-brand-500 transition-colors">Open Cheat Sheet</span>
                                    </button>
                                )}
                            </div>

                            <div className="text-center border-t border-gray-800 pt-8 max-w-lg mx-auto">
                                <p className="text-sm text-gray-500 mb-3 block">Already know this concept?</p>
                                <button
                                    onClick={() => navigate(`/concepts/${concept.slug}/quiz`)}
                                    className="btn-secondary w-full justify-center"
                                >
                                    Start Quiz Directly &rarr;
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Mode Navigation controls above content */}
                    {mode !== 'SELECTOR' && (
                        <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
                            <button onClick={() => setMode('SELECTOR')} className="text-sm text-gray-400 hover:text-white transition-colors">
                                &larr; Back to modes
                            </button>
                            <div className="flex gap-2">
                                {hasVideo && mode === 'CHEAT_SHEET' && (
                                    <button onClick={() => setMode('VIDEO')} className="text-xs bg-[#1a1c1d] border border-gray-700 hover:bg-[#202224] text-gray-300 px-3 py-1.5 rounded transition-colors">
                                        Switch to Video
                                    </button>
                                )}
                                {hasCheatSheet && mode === 'VIDEO' && (
                                    <button onClick={() => setMode('CHEAT_SHEET')} className="text-xs bg-[#1a1c1d] border border-gray-700 hover:bg-[#202224] text-gray-300 px-3 py-1.5 rounded transition-colors">
                                        Switch to Cheat Sheet
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Content Rendering */}
                    {mode !== 'SELECTOR' && (
                        <ContentRenderer blocks={displayBlocks} />
                    )}

                    {/* Bottom CTA for Quiz */}
                    {mode !== 'SELECTOR' && (
                        <div className="mt-16 pt-10 border-t border-gray-800 text-center bg-[#151718] rounded-2xl p-8 mb-10 border border-gray-800">
                            <h3 className="text-xl font-semibold text-gray-200 mb-2">Ready to test yourself?</h3>
                            <p className="text-sm text-gray-400 mb-6 max-w-md mx-auto">Test whether you can actually apply the concepts of {concept.title} under pressure.</p>
                            <button
                                onClick={() => navigate(`/concepts/${concept.slug}/quiz`)}
                                className="btn-primary btn-lg w-full max-w-xs shadow-md hover:shadow-lg"
                            >
                                Start Quiz &rarr;
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Contextual Navigation - Only shown if not in selector mode */}
            {mode === 'CHEAT_SHEET' && (
                <OnThisPageSidebar />
            )}
        </div>
    );
}

interface ConceptDetail {
    id: string; title: string; conceptCode: string; slug: string; difficulty: string; estimatedMinutes: number;
    module: { id: string; name: string; subject: { slug: string; name: string } };
}
