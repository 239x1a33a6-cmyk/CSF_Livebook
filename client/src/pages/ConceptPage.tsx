import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { conceptsService } from '../services/curriculum.service';
import { ContentRenderer } from '../components/content/ContentRenderer';
import type { ContentBlock } from '@shared/types/content';
import { CurriculumSidebar } from '../components/navigation/CurriculumSidebar';
import { OnThisPageSidebar } from '../components/navigation/OnThisPageSidebar';
import { BreadcrumbNav } from '../components/navigation/BreadcrumbNav';
import ReactMarkdown from 'react-markdown';

type ResourceTab = 'VIDEO' | 'CHEAT_SHEET' | 'QUIZ';

export function ConceptPage() {
    const { conceptSlug } = useParams<{ conceptSlug: string }>();
    const navigate = useNavigate();

    // Core data
    const [concept, setConcept] = useState<any>(null);
    const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
    const [resources, setResources] = useState<any[]>([]);
    const [prevConcept, setPrevConcept] = useState<{ slug: string; title: string } | null>(null);
    const [nextConcept, setNextConcept] = useState<{ slug: string; title: string } | null>(null);

    // State
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<ResourceTab>('VIDEO');

    useEffect(() => {
        if (!conceptSlug) return;
        setIsLoading(true);
        setError('');

        Promise.all([
            conceptsService.getBySlug(conceptSlug),
            conceptsService.getContent(conceptSlug).catch(() => ({ blocks: [] }))
        ])
            .then(([conceptRes, contentRes]) => {
                const fetchedConcept = conceptRes.concept;
                setConcept(fetchedConcept);
                setPrevConcept(conceptRes.prevConcept || null);
                setNextConcept(conceptRes.nextConcept || null);
                setContentBlocks(contentRes.blocks || []);

                // Background start logic
                conceptsService.start(fetchedConcept.id).catch(console.error);

                // Fetch resources
                return conceptsService.getResources(fetchedConcept.id);
            })
            .then((fetchedResources) => {
                setResources(fetchedResources);
                // Auto default based on what's available
                const hasVideo = fetchedResources.some((r: any) => r.type === 'VIDEO');
                const hasCs = fetchedResources.some((r: any) => r.type === 'CHEAT_SHEET');
                if (hasVideo) setActiveTab('VIDEO');
                else if (hasCs) setActiveTab('CHEAT_SHEET');
                else setActiveTab('VIDEO');
            })
            .catch(() => setError('Concept not found or failed to load content.'))
            .finally(() => setIsLoading(false));

    }, [conceptSlug]);

    if (isLoading) return <div className="w-full h-[calc(100vh-3.5rem)] overflow-y-auto mix-blend-multiply sm:mix-blend-normal"><div className="page-container py-12 flex justify-center"><div className="w-12 h-12 rounded-full border-4 border-brand-100 border-t-brand-500 animate-spin" /></div></div>;
    if (error || !concept) return <div className="w-full h-[calc(100vh-3.5rem)] overflow-y-auto mix-blend-multiply sm:mix-blend-normal"><div className="page-container py-12"><div className="card p-8 border-red-100 bg-red-50/50"><p className="text-red-600 font-bold text-center">{error || 'Not found'}</p></div></div></div>;

    const videoResource = resources.find(r => r.type === 'VIDEO');
    const csResource = resources.find(r => r.type === 'CHEAT_SHEET');

    // Rendering cheat sheet
    const renderCheatSheet = () => {
        if (!csResource) {
            return (
                <div className="card flex flex-col items-center justify-center p-16 md:p-20 text-center min-h-[400px]">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6 shadow-inner border border-slate-200/50 filter grayscale opacity-60">
                        <span className="text-4xl mb-1">📄</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Cheat sheet currently unavailable.</h3>
                    <p className="text-sm font-medium text-slate-500 max-w-md">The instructor is still preparing the written material for this concept. Please check back soon.</p>
                </div>
            );
        }

        if (csResource.source === 'JSON_BLOCKS') {
            return <ContentRenderer blocks={contentBlocks} />;
        }
        if (csResource.source === 'UPLOAD' && csResource.content) {
            return (
                <div className="w-full h-[800px] border border-gray-200 rounded-xl overflow-hidden bg-white">
                    <object data={csResource.content} type="application/pdf" className="w-full h-full">
                        <p className="p-4 text-center text-sm text-gray-600">
                            PDF viewer not supported. <a href={csResource.content} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">Download PDF</a>
                        </p>
                    </object>
                </div>
            );
        }
        if (csResource.source === 'MARKDOWN') {
            return (
                <div className="prose prose-sm md:prose-base prose-brand max-w-none card p-8 md:p-12 mb-10">
                    <ReactMarkdown>{csResource.content || ''}</ReactMarkdown>
                </div>
            );
        }
        return null;
    };

    const renderVideo = () => {
        if (!videoResource) {
            return (
                <div className="card flex flex-col items-center justify-center p-16 md:p-20 text-center min-h-[400px]">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6 shadow-inner border border-slate-200/50 filter grayscale opacity-60">
                        <span className="text-4xl ml-1 mb-1">🎥</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Video currently unavailable.</h3>
                    <p className="text-sm font-medium text-slate-500 max-w-md">The instructor is still recording or editing the video for this concept. Please check back soon.</p>
                </div>
            );
        }

        if (videoResource.source === 'URL') {
            return (
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-900 shadow-2xl ring-1 ring-white/10 max-w-5xl mx-auto">
                    <iframe
                        src={videoResource.content}
                        className="absolute inset-0 w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen>
                    </iframe>
                </div>
            );
        }

        if (videoResource.source === 'UPLOAD') {
            return (
                <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black shadow-lg">
                    <video controls className="w-full h-full" src={videoResource.content}></video>
                </div>
            );
        }

        return null;
    };

    return (
        <div className="flex w-full h-[calc(100vh-3.5rem)] overflow-hidden mix-blend-multiply sm:mix-blend-normal">
            <CurriculumSidebar subjectSlug={concept.module.subject.slug} />

            <div className="flex-1 overflow-y-auto scroll-smooth">
                <div className="py-8 md:py-12 px-4 sm:px-6 lg:px-12 max-w-5xl mx-auto pb-32">
                    {/* Compact Breadcrumbs & Header */}
                    <BreadcrumbNav items={[
                        { label: 'Dashboard', path: '/dashboard' },
                        { label: concept.module.subject.name, path: `/subjects/${concept.module.subject.slug}` },
                        { label: concept.module.name, path: `/modules/${concept.module.id}` },
                        { label: concept.conceptCode }
                    ]} />

                    <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between pb-6 gap-6 pt-4 border-b border-slate-200/60 relative">
                        {/* Glowing highlight point under the header */}
                        <div className="absolute bottom-0 left-0 w-32 h-px bg-gradient-to-r from-brand-500 to-transparent"></div>
                        <div className="relative z-10 w-full">
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                <span className="font-mono text-[11px] font-bold text-slate-500 bg-white shadow-sm px-2.5 py-1 rounded-md border border-slate-200/80">{concept.conceptCode}</span>
                                <span className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-md shadow-sm border ${concept.difficulty === 'BEGINNER' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                    concept.difficulty === 'INTERMEDIATE' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                                    }`}>{concept.difficulty}</span>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-extrabold text-slate-800 leading-tight tracking-tight max-w-3xl">
                                {concept.title}
                            </h1>
                        </div>
                    </div>

                    {/* Resources Tabs - Premium Pill Design */}
                    <div className="flex bg-slate-100/60 p-1.5 rounded-xl mb-10 overflow-x-auto scrollbar-hide max-w-max border border-slate-200/50 shadow-inner">
                        <button
                            onClick={() => setActiveTab('VIDEO')}
                            className={`px-6 py-2.5 font-bold text-sm transition-all rounded-lg whitespace-nowrap flex items-center gap-2 ${activeTab === 'VIDEO' ? 'bg-white text-brand-700 shadow-[0_2px_10px_rgb(0,0,0,0.06)]' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'}`}
                        >
                            <span className="text-base opacity-70 filter saturate-150">🎥</span> Video
                        </button>
                        <button
                            onClick={() => setActiveTab('CHEAT_SHEET')}
                            className={`px-6 py-2.5 font-bold text-sm transition-all rounded-lg whitespace-nowrap flex items-center gap-2 ${activeTab === 'CHEAT_SHEET' ? 'bg-white text-brand-700 shadow-[0_2px_10px_rgb(0,0,0,0.06)]' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'}`}
                        >
                            <span className="text-base opacity-70 filter saturate-150">📄</span> Content
                        </button>
                        <button
                            onClick={() => setActiveTab('QUIZ')}
                            className={`px-6 py-2.5 font-bold text-sm transition-all rounded-lg whitespace-nowrap flex items-center gap-2 ${activeTab === 'QUIZ' ? 'bg-white text-brand-700 shadow-[0_2px_10px_rgb(0,0,0,0.06)]' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'}`}
                        >
                            <span className="text-base opacity-70 filter saturate-150">🧠</span> Quiz
                        </button>
                    </div>

                    {/* Rendering the active tab space */}
                    <div className="min-h-[500px]">
                        {activeTab === 'VIDEO' && renderVideo()}
                        {activeTab === 'CHEAT_SHEET' && renderCheatSheet()}
                        {activeTab === 'QUIZ' && (
                            <div className="card text-center p-12 md:p-20 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-brand-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                                <h3 className="text-2xl font-black text-slate-800 mb-3 relative z-10">Knowledge Check</h3>
                                {!concept.isPublished ? (
                                    <>
                                        <p className="text-sm font-medium text-slate-500 mb-0 mx-auto relative z-10">The graded assessment will be unlocked once this concept's learning materials are published.</p>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-sm font-medium text-slate-500 mb-10 max-w-md mx-auto relative z-10">You're about to start the graded assessment for <span className="font-bold text-slate-700">{concept.title}</span>. Ensure you've reviewed the video and content beforehand.</p>
                                        <button
                                            onClick={() => navigate(`/concepts/${concept.slug}/quiz`)}
                                            className="btn-brand px-10 py-3 text-[15px] relative z-10"
                                        >
                                            Launch Assessment &rarr;
                                        </button>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Compact Navigation Footer */}
                        <div className="flex justify-between items-center mt-16 pt-8 border-t border-slate-200/60">
                            {prevConcept ? (
                                <button onClick={() => navigate(`/concepts/${prevConcept.slug}`)} className="text-slate-500 hover:text-brand-600 group flex flex-col items-start transition-all max-w-[45%]">
                                    <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-2 group-hover:text-brand-500 transition-colors">&larr; Previous Concept</span>
                                    <span className="font-extrabold text-sm md:text-base truncate w-full text-left bg-white shadow-sm border border-slate-200/50 px-4 py-2 rounded-lg group-hover:shadow-md transition-shadow">{prevConcept.title}</span>
                                </button>
                            ) : <div></div>}

                            {nextConcept ? (
                                <button onClick={() => navigate(`/concepts/${nextConcept.slug}`)} className="text-slate-500 hover:text-brand-600 group flex flex-col items-end transition-all max-w-[45%] text-right">
                                    <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-2 group-hover:text-brand-500 transition-colors">Next Concept &rarr;</span>
                                    <span className="font-extrabold text-sm md:text-base truncate w-full bg-white shadow-sm border border-slate-200/50 px-4 py-2 rounded-lg group-hover:shadow-md transition-shadow">{nextConcept.title}</span>
                                </button>
                            ) : <div></div>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Context Navigation - Only for old JSON blocks to keep TOC */}
            {activeTab === 'CHEAT_SHEET' && csResource?.source === 'JSON_BLOCKS' && (
                <OnThisPageSidebar />
            )}
        </div>
    );
}
