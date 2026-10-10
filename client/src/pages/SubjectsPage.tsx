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
        <div className="page-container py-12 max-w-5xl mx-auto mix-blend-multiply sm:mix-blend-normal">
            {/* Breadcrumb */}
            <nav className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-8 flex items-center gap-2">
                <Link to="/dashboard" className="hover:text-brand-600 transition-colors bg-white/60 px-3 py-1.5 rounded-md border border-white shadow-sm backdrop-blur">Dashboard</Link>
                <span>/</span>
                <span className="text-slate-600 bg-white/60 px-3 py-1.5 rounded-md border border-white shadow-sm backdrop-blur">All Curriculums</span>
            </nav>

            <div className="mb-12 relative">
                <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">Curriculum <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-emerald-400">Library</span></h1>
                <p className="text-sm font-medium text-slate-500 mt-4 max-w-2xl bg-white/40 inline-block px-4 py-2 rounded-full border border-white shadow-sm">Explore all available Computer Science fundamentals subjects, modules, and concepts.</p>
            </div>

            <div className="space-y-6 pb-20">
                {(subjects as any[]).map((subject) => {
                    const isAvailable = subject.isPublished;
                    return (
                        <div key={subject.id} className={`card p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 group relative overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] ${!isAvailable ? 'opacity-75 bg-slate-50/50' : 'hover:scale-[1.01]'}`}>
                            {isAvailable && <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-brand-400 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />}

                            <div className="flex-1 z-10">
                                <div className="flex items-center gap-5 mb-3">
                                    {subject.icon && <span className="text-3xl w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center shadow-inner border border-slate-100/50 flex-shrink-0">{subject.icon}</span>}
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h2 className="text-xl font-bold text-slate-900 tracking-tight group-hover:text-brand-600 transition-colors">{subject.name}</h2>
                                            {!isAvailable && <span className="text-[10px] font-bold tracking-widest uppercase bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md shadow-sm border border-slate-200/50">Coming Soon</span>}
                                        </div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-2">
                                            <span className="bg-slate-100/80 px-2 py-0.5 rounded border border-slate-200/50">{subject.moduleCount} modules</span>
                                            <span className="bg-slate-100/80 px-2 py-0.5 rounded border border-slate-200/50">{subject.conceptCount} concepts</span>
                                        </p>
                                    </div>
                                </div>
                                <p className="text-sm font-medium text-slate-600 mt-4 md:ml-19 leading-relaxed">{subject.description}</p>
                            </div>

                            <div className="w-full md:w-72 flex-shrink-0 flex flex-col justify-center z-10">
                                {isAvailable ? (
                                    <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 shadow-inner group-hover:bg-white/80 transition-colors">
                                        <div className="mb-5">
                                            <div className="flex justify-between items-end mb-2">
                                                <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">{subject.progress.completed} / {subject.progress.total} done</span>
                                                <span className="font-black text-brand-600 text-lg leading-none">{subject.progress.percentage}%</span>
                                            </div>
                                            <div className="h-2 w-full bg-slate-200/60 rounded-full overflow-hidden shadow-inner flex relative">
                                                <div className="h-full bg-gradient-to-r from-brand-400 to-emerald-500 rounded-full transition-all duration-1000 ease-out absolute left-0 top-0 bottom-0" style={{ width: `${subject.progress.percentage}%` }} />
                                            </div>
                                        </div>
                                        <Link to={`/subjects/${subject.slug}`} className="btn-brand w-full justify-center shadow-sm hover:shadow-md">
                                            {subject.progress.percentage > 0 ? 'Resume Subject &rarr;' : 'Begin Journey &rarr;'}
                                        </Link>
                                    </div>
                                ) : (
                                    <button disabled className="w-full bg-slate-100 text-slate-400 font-bold text-xs uppercase tracking-widest py-3 rounded-xl border border-slate-200/50 cursor-not-allowed shadow-inner">
                                        Content Preparing
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
