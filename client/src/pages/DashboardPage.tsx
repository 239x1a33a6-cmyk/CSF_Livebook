import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { progressService } from '../services/curriculum.service';
import { CircularProgress } from '../components/progress/CircularProgress';

export function DashboardPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [subjects, setSubjects] = useState<DashboardSubject[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());
    const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

    useEffect(() => {
        progressService.getDashboard()
            .then(data => {
                const typedData = data as DashboardSubject[];
                setSubjects(typedData);

                // Identify where to auto-expand
                let bestSub = '';
                let latestTime = 0;
                let firstAvailable = '';

                for (const s of typedData) {
                    if (s.isPublished && !firstAvailable) firstAvailable = s.id;
                    for (const m of s.modules) {
                        for (const c of m.concepts) {
                            if (c.progress && c.progress.status !== 'COMPLETED' && c.progress.lastAccessedAt) {
                                const time = new Date(c.progress.lastAccessedAt).getTime();
                                if (time > latestTime) {
                                    latestTime = time;
                                    bestSub = s.id;
                                }
                            }
                        }
                    }
                }

                if (bestSub) {
                    setExpandedSubjects(new Set([bestSub]));
                } else if (firstAvailable) {
                    setExpandedSubjects(new Set([firstAvailable]));
                }
            })
            .catch(() => setError('Failed to load dashboard. Please refresh.'))
            .finally(() => setIsLoading(false));
    }, []);

    if (isLoading) return <PageLoading />;
    if (error) return <PageError message={error} />;

    let totalEligible = 0;
    let completedEligible = 0;
    let inProgressEligible = 0;
    let notStartedEligible = 0;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let bestContinueItem: any = null;
    let latestTime = 0;

    subjects.forEach(s => {
        if (!s.isPublished) return;
        s.modules.forEach(m => {
            if (!m.isPublished) return;
            m.concepts.forEach(c => {
                if (!c.isPublished) return;

                totalEligible++;
                const status = c.progress?.status;
                if (status === 'COMPLETED') completedEligible++;
                else if (status === 'IN_PROGRESS') inProgressEligible++;
                else notStartedEligible++;

                if (status !== 'COMPLETED' && c.progress?.lastAccessedAt) {
                    const time = new Date(c.progress.lastAccessedAt).getTime();
                    if (time > latestTime) {
                        latestTime = time;
                        bestContinueItem = { subject: s, module: m, concept: c };
                    }
                }
            });
        });
    });

    const overallPercentage = totalEligible > 0 ? Math.round((completedEligible / totalEligible) * 100) : 0;

    const toggleSubject = (id: string) => {
        const next = new Set(expandedSubjects);
        if (next.has(id)) next.delete(id); else next.add(id);
        setExpandedSubjects(next);
    };

    const toggleModule = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const next = new Set(expandedModules);
        if (next.has(id)) next.delete(id); else next.add(id);
        setExpandedModules(next);
    };

    return (
        <div className="w-full h-[calc(100vh-3.5rem)] overflow-y-auto mix-blend-multiply sm:mix-blend-normal">
            <div className="page-container py-12 max-w-5xl mx-auto">
                {/* ── Overall Progress Header ───────────────────────────────── */}
                <header className="mb-14 relative group">
                    {/* Soft glowing orb behind the welcome text */}
                    <div className="absolute -top-10 -left-10 w-48 h-48 bg-brand-400/20 rounded-full blur-[80px] pointer-events-none transition-transform group-hover:scale-110 duration-700"></div>

                    <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-8 relative z-10">
                        Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-emerald-400">{user?.name?.split(' ')[0] ?? 'Explorer'}</span>.
                    </h1>

                    <div className="card p-8 md:p-10 flex flex-col md:flex-row items-center gap-10 md:gap-14 relative overflow-hidden">
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />
                        <div className="flex-shrink-0">
                            <CircularProgress percentage={overallPercentage} size={140} strokeWidth={12} />
                        </div>

                        <div className="flex-1 w-full text-center md:text-left z-10">
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">Learning Progress</h2>
                            <p className="text-sm font-medium text-slate-500 mb-6 bg-slate-100/50 inline-block px-3 py-1 rounded-full border border-slate-200/50">
                                {completedEligible} of {totalEligible} essential concepts mastered
                            </p>

                            <div className="flex gap-4 md:gap-8 flex-wrap justify-center md:justify-start mb-6 md:mb-0">
                                <div className="text-center md:text-left">
                                    <span className="block text-2xl font-black text-brand-600">{completedEligible}</span>
                                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold flex items-center gap-1.5 mt-1">
                                        <span className="w-2 h-2 rounded-full bg-brand-500 shadow-[0_0_10px_rgb(34,197,94)] inline-block"></span> Completed
                                    </span>
                                </div>
                                <div className="w-px h-10 bg-gradient-to-b from-transparent via-slate-200 to-transparent hidden md:block self-center"></div>
                                <div className="text-center md:text-left">
                                    <span className="block text-2xl font-black text-amber-500">{inProgressEligible}</span>
                                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold flex items-center gap-1.5 mt-1">
                                        <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_10px_rgb(251,191,36)] inline-block"></span> In Progress
                                    </span>
                                </div>
                                <div className="w-px h-10 bg-gradient-to-b from-transparent via-slate-200 to-transparent hidden md:block self-center"></div>
                                <div className="text-center md:text-left">
                                    <span className="block text-2xl font-black text-slate-400">{notStartedEligible}</span>
                                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold flex items-center gap-1.5 mt-1">
                                        <span className="w-2 h-2 rounded-full bg-slate-300 inline-block"></span> Not Started
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="w-full md:w-auto bg-white/60 rounded-2xl p-6 border border-white flex-shrink-0 min-w-[280px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur z-10 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
                            {bestContinueItem ? (
                                <>
                                    <p className="text-[10px] text-slate-500 font-extrabold mb-1.5 uppercase tracking-widest text-center md:text-left">CONTINUE LEARNING</p>
                                    <p className="text-xs text-brand-600 font-bold mb-1 truncate max-w-[240px] mx-auto md:mx-0" title={`${bestContinueItem.subject.name} → ${bestContinueItem.module.name}`}>
                                        {bestContinueItem.subject.name} &rarr; {bestContinueItem.module.name}
                                    </p>
                                    <h3 className="text-sm font-black text-slate-800 mb-5 line-clamp-2 text-center md:text-left leading-relaxed" title={bestContinueItem.concept.title}>
                                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-mono text-[10px] items-center justify-center inline-flex me-1.5 border border-slate-200 pb-0.5">{bestContinueItem.concept.conceptCode}</span>
                                        {bestContinueItem.concept.title}
                                    </h3>
                                    <button
                                        onClick={() => navigate(`/concepts/${bestContinueItem.concept.slug}`)}
                                        className="w-full btn-brand"
                                    >
                                        Resume Concept
                                    </button>
                                </>
                            ) : (
                                <div className="text-center py-4">
                                    <p className="text-sm text-slate-500 mb-4 font-bold">Ready to start?</p>
                                    <button onClick={() => navigate('/subjects')} className="btn-brand w-full">
                                        Explore Curriculum
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* ── Expandable Curriculum Roadmap ─────────────────────── */}
                <div>
                    <div className="flex items-end justify-between mb-6 px-1">
                        <div>
                            <h2 className="text-2xl font-extrabold text-slate-800">Learning Paths</h2>
                            <p className="text-sm text-slate-500 mt-1 font-medium">Expand tracking for modules to view concepts.</p>
                        </div>
                        <Link to="/subjects" className="text-sm text-brand-600 font-bold tracking-tight hover:text-brand-700 transition-colors bg-brand-50/50 hover:bg-brand-50 px-4 py-2 rounded-full border border-brand-100/50 hidden sm:block">Explore Catalogue &rarr;</Link>
                    </div>

                    <div className="space-y-6 pb-20">
                        {subjects.length === 0 ? (
                            <div className="text-center py-20 card border-dashed shadow-none bg-transparent">
                                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 grayscale opacity-60">📚</div>
                                <h3 className="text-lg font-bold text-slate-700 mb-1">No Paths Found</h3>
                                <p className="text-sm text-slate-500">Wait for your instructors to publish the curriculum.</p>
                            </div>
                        ) : (
                            subjects.map(subject => {
                                const isAvail = subject.isPublished;
                                let subjTotal = 0;
                                let subjDone = 0;

                                if (isAvail) {
                                    subject.modules.forEach(m => {
                                        if (m.isPublished) {
                                            m.concepts.forEach(c => {
                                                if (c.isPublished) {
                                                    subjTotal++;
                                                    if (c.progress?.status === 'COMPLETED') subjDone++;
                                                }
                                            });
                                        }
                                    });
                                }

                                const subjPct = subjTotal > 0 ? Math.round((subjDone / subjTotal) * 100) : 0;
                                const isExpanded = expandedSubjects.has(subject.id);

                                return (
                                    <div key={subject.id} className="card overflow-hidden">
                                        {/* Level 1: Subject Row */}
                                        <div
                                            className="flex items-center px-4 py-4 sm:px-6 sm:py-5 cursor-pointer hover:bg-white/40 transition-colors group relative"
                                            onClick={() => toggleSubject(subject.id)}
                                            aria-expanded={isExpanded}
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSubject(subject.id); } }}
                                        >
                                            <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-brand-400 to-brand-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                            <div className="mr-4 sm:mr-5 text-2xl sm:text-3xl flex-shrink-0 w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center shadow-inner border border-slate-100/50">{subject.icon ?? '📘'}</div>
                                            <div className="flex-1 min-w-0 pr-4">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h3 className={`font-extrabold truncate text-base sm:text-lg tracking-tight ${isAvail ? 'text-slate-800' : 'text-slate-400'}`}>{subject.name}</h3>
                                                    {!isAvail && <span className="text-[9px] uppercase font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md border border-slate-200/60 shadow-sm">Coming Soon</span>}
                                                </div>
                                                <p className="text-xs sm:text-sm text-slate-500 font-medium truncate">{subject.description}</p>
                                            </div>

                                            {isAvail && (
                                                <div className="flex items-center gap-4 sm:gap-6 flex-shrink-0">
                                                    <div className="hidden md:flex flex-col items-end">
                                                        <span className="text-sm font-black text-slate-800">{subjPct}%</span>
                                                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{subjDone} / {subjTotal} Concepts</span>
                                                    </div>
                                                    <div className="w-8 sm:w-10">
                                                        <CircularProgress percentage={subjPct} size={40} strokeWidth={5} label={`Subject progress: ${subjPct}%`} />
                                                    </div>
                                                </div>
                                            )}

                                            <div className={`ml-3 sm:ml-5 text-slate-300 font-medium w-6 h-6 rounded-full border border-slate-200 flex items-center justify-center bg-white shadow-sm transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                                <svg className="w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                                            </div>
                                        </div>

                                        {/* Level 2: Modules Body */}
                                        {isExpanded && (
                                            <div className="border-t border-slate-100/60 bg-slate-50/50 p-3 sm:p-5 space-y-3 sm:space-y-4">
                                                {subject.modules.length === 0 ? (
                                                    <p className="text-xs text-slate-500 font-medium p-4 text-center">Modules are being prepared and will be available soon.</p>
                                                ) : (
                                                    subject.modules.map(module => {
                                                        const mAvail = module.isPublished;
                                                        let mTotal = 0;
                                                        let mDone = 0;
                                                        if (mAvail) {
                                                            module.concepts.forEach(c => {
                                                                if (c.isPublished) {
                                                                    mTotal++;
                                                                    if (c.progress?.status === 'COMPLETED') mDone++;
                                                                }
                                                            });
                                                        }
                                                        const mPct = mTotal > 0 ? Math.round((mDone / mTotal) * 100) : 0;
                                                        const mExpanded = expandedModules.has(module.id);

                                                        return (
                                                            <div key={module.id} className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-sm hover:shadow-[0_4px_20px_rgb(0,0,0,0.03)] transition-all duration-300">
                                                                <div
                                                                    className="flex items-center px-5 py-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
                                                                    onClick={(e) => toggleModule(module.id, e)}
                                                                    role="button"
                                                                    aria-expanded={mExpanded}
                                                                >
                                                                    <div className="flex-1 min-w-0 pr-4">
                                                                        <div className="flex items-center gap-3">
                                                                            <h4 className={`font-bold text-sm sm:text-[15px] truncate tracking-tight ${mAvail ? 'text-slate-800' : 'text-slate-400'}`}>{module.name}</h4>
                                                                            {!mAvail && <span className="text-[9px] flex-shrink-0 uppercase font-bold bg-slate-100 text-slate-500 px-1.5 rounded-md border shadow-sm">Upcoming</span>}
                                                                        </div>
                                                                    </div>

                                                                    {mAvail && (
                                                                        <div className="flex items-center gap-4 text-xs flex-shrink-0">
                                                                            <span className="text-slate-500 font-bold hidden sm:inline tracking-widest">{mDone} / {mTotal}</span>
                                                                            <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50 shadow-inner">
                                                                                <div className="h-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all duration-1000" style={{ width: `${mPct}%` }} />
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    <div className={`ml-4 text-slate-300 w-5 h-5 flex items-center justify-center transition-transform duration-300 transform ${mExpanded ? 'rotate-90' : ''}`}>
                                                                        <svg className="w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                                                                    </div>
                                                                </div>

                                                                {/* Level 3: Concepts Body */}
                                                                {mExpanded && (
                                                                    <div className="border-t border-slate-100 bg-slate-50/20">
                                                                        {module.concepts.length === 0 ? (
                                                                            <p className="text-xs text-slate-400 font-medium p-6 text-center shadow-inner">Concepts are currently unavailable.</p>
                                                                        ) : (
                                                                            <div className="divide-y divide-slate-100/50">
                                                                                {module.concepts.map(concept => {
                                                                                    const cAvail = concept.isPublished;
                                                                                    const status = concept.progress?.status || 'NOT_STARTED';

                                                                                    const isCompleted = status === 'COMPLETED';
                                                                                    const isInProgress = status === 'IN_PROGRESS';

                                                                                    const iconColorClass = isCompleted ? 'border-brand-500'
                                                                                        : (isInProgress ? 'border-amber-400'
                                                                                            : 'border-slate-300');

                                                                                    return (
                                                                                        <div key={concept.id} className="flex items-center px-5 py-3 hover:bg-slate-50 transition-colors group/concept">
                                                                                            <div className="mr-3.5 w-5 flex justify-center">
                                                                                                {!cAvail ? (
                                                                                                    <div className="w-3.5 h-3.5 rounded-full border border-slate-200 bg-slate-100/50 object-cover"></div>
                                                                                                ) : isCompleted ? (
                                                                                                    <div className={`w-5 h-5 rounded-full border shadow-[0_0_8px_rgb(34,197,94,0.4)] border-brand-500 bg-brand-500 flex items-center justify-center`}>
                                                                                                        <span className="text-[11px] text-white leading-none font-black mt-px inline-block scale-75">✓</span>
                                                                                                    </div>
                                                                                                ) : isInProgress ? (
                                                                                                    <div className={`w-4 h-4 rounded-full border-2 overflow-hidden border-amber-400 relative shadow-sm`}>
                                                                                                        <div className="absolute left-0 top-0 w-1/2 h-full bg-amber-400 animate-pulse"></div>
                                                                                                    </div>
                                                                                                ) : (
                                                                                                    <div className={`w-3.5 h-3.5 rounded-full border-2 bg-white ${iconColorClass}`}></div>
                                                                                                )}
                                                                                            </div>

                                                                                            <div className="flex-1 min-w-0 py-1 flex flex-col sm:flex-row sm:items-center sm:gap-3">
                                                                                                <span className={`font-mono text-[10px] sm:text-[11px] font-bold shrink-0 mb-0.5 sm:mb-0 px-2.5 py-0.5 rounded shadow-sm border ${cAvail ? 'text-slate-600 bg-slate-100 border-slate-200/50' : 'text-slate-300 bg-slate-50 border-slate-100'}`}>
                                                                                                    {concept.conceptCode}
                                                                                                </span>
                                                                                                <span className={`text-sm truncate font-semibold ${cAvail ? 'text-slate-800' : 'text-slate-400 opacity-60'}`}>
                                                                                                    {concept.title}
                                                                                                </span>
                                                                                            </div>

                                                                                            <div className="flex-shrink-0 ml-4">
                                                                                                <button
                                                                                                    onClick={() => navigate(`/concepts/${concept.slug}`)}
                                                                                                    className={`text-[11px] font-bold px-4 py-2 rounded-[0.4rem] transition-all duration-300 shadow-sm border ${isCompleted ? 'text-slate-600 bg-white border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-none' :
                                                                                                        isInProgress ? 'bg-amber-500 text-white border-amber-500 hover:bg-amber-600 shadow-[0_2px_10px_rgb(245,158,11,0.2)]' :
                                                                                                            'text-white bg-slate-900 border-slate-900 hover:bg-slate-800 shadow-[0_2px_10px_rgb(0,0,0,0.1)]'
                                                                                                        }`}
                                                                                                >
                                                                                                    {isCompleted ? 'Review' : (isInProgress ? 'Resume' : 'Start')}
                                                                                                </button>
                                                                                            </div>
                                                                                        </div>
                                                                                    );
                                                                                })}

                                                                                {/* Module Assessment Row */}
                                                                                {module.assessments && module.assessments.find(a => a.type === 'MODULE_ASSESSMENT') && (
                                                                                    <div className="flex items-center px-5 py-4 bg-slate-50/80 border-t-2 border-dashed border-slate-200/60 hover:bg-slate-100 transition-colors cursor-pointer group/assessment">
                                                                                        <div className="mr-3 w-5 flex justify-center">
                                                                                            <span className="text-lg">🏆</span>
                                                                                        </div>
                                                                                        <div className="flex-1 min-w-0">
                                                                                            <div className="flex justify-between items-center">
                                                                                                <span className="text-sm font-black text-slate-800 tracking-tight">Module Final Assessment</span>
                                                                                                {module.assessments.find(a => a.type === 'MODULE_ASSESSMENT')?.isPublished ? (
                                                                                                    <span className="text-[10px] uppercase font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-200/50">Available</span>
                                                                                                ) : (
                                                                                                    <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 shadow-inner tracking-widest gap-1 flex items-center">
                                                                                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                                                                                                        Assigned Soon
                                                                                                    </span>
                                                                                                )}
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface DashboardSubject {
    id: string; name: string; slug: string; description: string; icon?: string;
    isPublished: boolean; moduleCount: number; conceptCount: number;
    progress: { completed: number; total: number; percentage: number };
    modules: Array<{ id: string; name: string; isPublished: boolean; conceptCount: number; assessments?: Array<{ id: string, type: string, title: string, isPublished: boolean }>; concepts: Array<{ id: string; conceptCode: string; title: string; slug: string; isPublished: boolean; progress?: { status: string; lastAccessedAt?: string } }> }>;
}

// ── Sub-components ────────────────────────────────────────────────────────────
function PageLoading() {
    return (
        <div className="w-full h-[calc(100vh-3.5rem)] overflow-y-auto bg-gray-50">
            <div className="page-container py-8 max-w-5xl mx-auto">
                <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-8" />
                <div className="bg-white border border-gray-200 rounded-xl h-48 animate-pulse mb-8" />
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="border border-gray-200 rounded-xl h-16 animate-pulse bg-white" />
                    ))}
                </div>
            </div>
        </div>
    );
}

function PageError({ message }: { message: string }) {
    return (
        <div className="w-full h-[calc(100vh-3.5rem)] overflow-y-auto bg-gray-50">
            <div className="page-container py-8 max-w-5xl mx-auto">
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-4 rounded-lg font-medium">{message}</div>
            </div>
        </div>
    );
}
