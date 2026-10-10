import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import api from '../../services/api';

export function ContentManagerPage() {
    const { user } = useAuth();
    const isAdmin = user?.role === 'ADMIN';

    const [subjects, setSubjects] = useState<any[]>([]);
    const [selectedSubjectId, setSelectedSubjectId] = useState('');
    const [selectedModuleId, setSelectedModuleId] = useState('');
    const [selectedConceptId, setSelectedConceptId] = useState('');
    const [modAsmSaving, setModAsmSaving] = useState(false);

    // Status
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ text: '', type: '' });

    // Resource viewing
    const [resources, setResources] = useState<any[]>([]);
    const [loadingResources, setLoadingResources] = useState(false);

    // Form states
    const [videoTab, setVideoTab] = useState<'UPLOAD' | 'URL'>('UPLOAD');
    const [csTab, setCsTab] = useState<'UPLOAD' | 'MARKDOWN' | 'C1_JSON'>('UPLOAD');

    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [videoUrl, setVideoUrl] = useState('');
    const [csFile, setCsFile] = useState<File | null>(null);
    const [csMarkdown, setCsMarkdown] = useState('');

    const [videoIsPublished, setVideoIsPublished] = useState(false);
    const [csIsPublished, setCsIsPublished] = useState(false);
    const [quizIsPublished, setQuizIsPublished] = useState(false);
    const [quizJson, setQuizJson] = useState('[]');

    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isAdmin) {
            api.get('/admin/curriculum').then((res) => {
                setSubjects(res.data.data);
                setLoading(false);
            }).catch(console.error);
        }
    }, [isAdmin]);

    useEffect(() => {
        if (selectedConceptId) {
            setLoadingResources(true);
            Promise.all([
                api.get(`/admin/concepts/${selectedConceptId}/resources`),
                api.get(`/admin/concepts/${selectedConceptId}/assessment`).catch(() => ({ data: { data: null } }))
            ]).then(([resRs, resAsm]) => {
                const rs = resRs.data.data;
                const asm = resAsm.data.data;

                setResources(rs);

                // Prefill existing DB data
                const vid = rs.find((r: any) => r.type === 'VIDEO');
                if (vid) {
                    setVideoIsPublished(vid.isPublished);
                    if (vid.source === 'URL') {
                        setVideoTab('URL');
                        setVideoUrl(vid.content || '');
                    } else if (vid.source === 'UPLOAD') {
                        setVideoTab('UPLOAD');
                    }
                } else {
                    setVideoIsPublished(false);
                    setVideoUrl('');
                    setVideoFile(null);
                }

                const cs = rs.find((r: any) => r.type === 'CHEAT_SHEET');
                if (cs) {
                    setCsIsPublished(cs.isPublished);
                    if (cs.source === 'MARKDOWN') {
                        setCsTab('MARKDOWN');
                        setCsMarkdown(cs.content || '');
                    } else if (cs.source === 'UPLOAD') {
                        setCsTab('UPLOAD');
                    } else if (cs.source === 'JSON_BLOCKS') {
                        setCsTab('C1_JSON');
                    }
                } else {
                    setCsIsPublished(false);
                    setCsMarkdown('');
                    setCsFile(null);
                }

                if (asm) {
                    setQuizIsPublished(asm.isPublished);
                    // Filter out unneeded props for the editor, or just show it all
                    setQuizJson(JSON.stringify(asm.questions || [], null, 2));
                } else {
                    setQuizIsPublished(false);
                    setQuizJson('[\n]');
                }

            }).finally(() => setLoadingResources(false));
        } else {
            setResources([]);
            setQuizJson('[\n]');
            setQuizIsPublished(false);
        }
    }, [selectedConceptId]);

    if (!isAdmin) {
        return <Navigate to="/dashboard" replace />;
    }

    const selSub = subjects.find(s => s.id === selectedSubjectId);
    const selMod = selSub?.modules.find((m: any) => m.id === selectedModuleId);

    const showMessage = (text: string, type = 'success') => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 5000);
    };

    const handleToggleModAsm = async (assessmentId: string, currentStatus: boolean) => {
        setModAsmSaving(true);
        try {
            await api.put(`/admin/assessment/${assessmentId}/publish`, { isPublished: !currentStatus });
            showMessage('Assessment updated successfully!');
            const res = await api.get('/admin/curriculum');
            setSubjects(res.data.data);
        } catch (err: any) {
            showMessage(err.response?.data?.error?.message || err.message, 'error');
        } finally {
            setModAsmSaving(false);
        }
    };

    const handleToggleConceptPublish = async (currentStatus: boolean) => {
        if (!selectedConceptId) return;
        setIsSaving(true);
        try {
            await api.put(`/admin/concepts/${selectedConceptId}/publish`, { isPublished: !currentStatus });
            showMessage('Concept availability updated successfully!');
            // Refresh curriulum to reflect new published state in the dropdown
            const res = await api.get('/admin/curriculum');
            setSubjects(res.data.data);
        } catch (err: any) {
            showMessage(err.response?.data?.error?.message || err.message, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveVideo = async () => {
        if (!selectedConceptId) return;
        setIsSaving(true);
        try {
            if (videoTab === 'UPLOAD' && videoFile) {
                const formData = new FormData();
                formData.append('file', videoFile);
                formData.append('isPublished', String(videoIsPublished));
                await api.post(`/admin/upload/video/${selectedConceptId}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else if (videoTab === 'URL' && videoUrl) {
                await api.post(`/admin/url/video/${selectedConceptId}`, {
                    url: videoUrl,
                    isPublished: videoIsPublished
                });
            } else {
                // If they didn't supply a new file but just want to toggle switch
                const vid = resources.find(r => r.type === 'VIDEO');
                if (vid) {
                    await api.put(`/admin/resource/${vid.id}/publish`, { isPublished: videoIsPublished });
                } else {
                    throw new Error('Please provide video file or URL to save');
                }
            }
            showMessage('Video saved successfully!');
            // Refresh
            const rs = await api.get(`/admin/concepts/${selectedConceptId}/resources`);
            setResources(rs.data.data);
        } catch (err: any) {
            showMessage(err.response?.data?.error?.message || err.message, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveCheatSheet = async () => {
        if (!selectedConceptId) return;
        setIsSaving(true);
        try {
            if (csTab === 'UPLOAD' && csFile) {
                const formData = new FormData();
                formData.append('file', csFile);
                formData.append('isPublished', String(csIsPublished));
                await api.post(`/admin/upload/cheatsheet/${selectedConceptId}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else if (csTab === 'MARKDOWN' && csMarkdown) {
                await api.post(`/admin/markdown/cheatsheet/${selectedConceptId}`, {
                    content: csMarkdown,
                    isPublished: csIsPublished
                });
            } else if (csTab === 'C1_JSON') {
                await api.post(`/admin/c1/cheatsheet/${selectedConceptId}`, {
                    isPublished: csIsPublished
                });
            } else {
                const cs = resources.find(r => r.type === 'CHEAT_SHEET');
                if (cs) {
                    await api.put(`/admin/resource/${cs.id}/publish`, { isPublished: csIsPublished });
                } else {
                    throw new Error('Please provide cheat sheet file/content to save');
                }
            }
            showMessage('Cheat Sheet saved successfully!');
            const rs = await api.get(`/admin/concepts/${selectedConceptId}/resources`);
            setResources(rs.data.data);
        } catch (err: any) {
            showMessage(err.response?.data?.error?.message || err.message, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveQuiz = async () => {
        if (!selectedConceptId) return;
        setIsSaving(true);
        try {
            const parsedQuestions = JSON.parse(quizJson || '[]');
            if (!Array.isArray(parsedQuestions)) throw new Error('Quiz must be a JSON array of questions');

            await api.post(`/admin/concepts/${selectedConceptId}/assessment`, {
                isPublished: quizIsPublished,
                questions: parsedQuestions
            });
            showMessage('Quiz saved successfully!');
        } catch (err: any) {
            showMessage(err.response?.data?.error?.message || err.message, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <div className="p-10">Loading admin interface...</div>;

    const existingVid = resources.find(r => r.type === 'VIDEO');
    const existingCs = resources.find(r => r.type === 'CHEAT_SHEET');

    return (
        <div className="max-w-6xl mx-auto py-8 px-4 h-[calc(100vh-3.5rem)] overflow-y-auto mix-blend-multiply sm:mix-blend-normal">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-8 relative z-10">Admin <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-emerald-400">Content Studio</span></h1>

            {message.text && (
                <div className={`p-4 mb-8 rounded-xl border font-bold text-sm shadow-sm ${message.type === 'error' ? 'bg-red-50/80 backdrop-blur border-red-200 text-red-700' : 'bg-emerald-50/80 backdrop-blur border-emerald-200 text-emerald-700'}`}>
                    {message.text}
                </div>
            )}

            <div className="card p-6 md:p-8 mb-10 overflow-hidden relative group">
                {/* Subtle sheen */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_2.5s_infinite] pointer-events-none" />

                <h2 className="text-xs uppercase tracking-widest font-black text-slate-400 mb-5 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-brand-50 text-brand-600 flex items-center justify-center text-sm border border-brand-100 shadow-sm">1</span> Curriculum Location
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Subject</label>
                        <select
                            className="w-full border-gray-300 rounded-md text-sm p-2 bg-gray-50 focus:ring-brand-500 focus:border-brand-500 border"
                            value={selectedSubjectId}
                            onChange={e => { setSelectedSubjectId(e.target.value); setSelectedModuleId(''); setSelectedConceptId(''); }}
                        >
                            <option value="">-- Select Subject --</option>
                            {subjects.map(s => <option key={s.id} value={s.id}>{s.name} {s.isPublished ? '' : '(Unpublished)'}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Module</label>
                        <select
                            className="w-full border-gray-300 rounded-md text-sm p-2 bg-gray-50 focus:ring-brand-500 focus:border-brand-500 border"
                            value={selectedModuleId}
                            onChange={e => { setSelectedModuleId(e.target.value); setSelectedConceptId(''); }}
                            disabled={!selSub}
                        >
                            <option value="">-- Select Module --</option>
                            {selSub?.modules.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Concept</label>
                        <select
                            className="w-full border-gray-300 rounded-md text-sm p-2 bg-gray-50 focus:ring-brand-500 focus:border-brand-500 border"
                            value={selectedConceptId}
                            onChange={e => setSelectedConceptId(e.target.value)}
                            disabled={!selMod}
                        >
                            <option value="">-- Select Concept --</option>
                            {selMod?.concepts.map((c: any) => <option key={c.id} value={c.id}>{c.conceptCode}: {c.title} {c.isPublished ? '' : '(DRAFT)'}</option>)}
                        </select>
                    </div>
                </div>

                {selectedConceptId && selMod && (() => {
                    const c = selMod.concepts.find((x: any) => x.id === selectedConceptId);
                    if (!c) return null;
                    return (
                        <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-slate-800">Concept Availability</h3>
                                <p className="text-xs text-slate-500 mt-0.5 max-w-md">Students cannot see this concept page at all unless this is published, regardless of individual resource states.</p>
                            </div>
                            <button
                                onClick={() => handleToggleConceptPublish(c.isPublished)}
                                disabled={isSaving}
                                className={`px-4 py-2 font-bold text-xs rounded-md shadow-sm transition-all border ${c.isPublished ? 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50' : 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'}`}
                            >
                                {isSaving ? 'Processing...' : c.isPublished ? 'Unpublish Concept' : 'Publish Concept'}
                            </button>
                        </div>
                    );
                })()}
            </div>

            {selMod && !selectedConceptId && selMod.assessments && selMod.assessments.find((a: any) => a.type === 'MODULE_ASSESSMENT') && (() => {
                const asm = selMod.assessments.find((a: any) => a.type === 'MODULE_ASSESSMENT');
                return (
                    <div className="card p-6 md:p-8 mb-8 border-brand-200 bg-brand-50/20">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-black text-slate-800 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center shadow-inner text-base">🏆</span> Module Assessment
                            </h2>
                            <span className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-md border shadow-sm ${asm.isPublished ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                                {asm.isPublished ? 'PUBLISHED' : 'DRAFT'}
                            </span>
                        </div>
                        <p className="text-sm text-slate-600 mb-6 font-medium">This module automatically has an assessment assigned. You can configure questions via the Assessment Engine later. For Phase 3, you can toggle its availability to students here.</p>

                        <button
                            onClick={() => handleToggleModAsm(asm.id, asm.isPublished)}
                            disabled={modAsmSaving}
                            className={`w-full font-bold px-6 py-3 rounded-lg border transition-all ${asm.isPublished ? 'bg-white text-slate-700 hover:bg-slate-50 border-slate-300' : 'btn-brand border-brand-600'}`}
                        >
                            {modAsmSaving ? 'Processing...' : asm.isPublished ? 'Unpublish Assessment' : 'Publish Assessment'}
                        </button>
                    </div>
                );
            })()}

            {selectedConceptId && !loadingResources && (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">

                        {/* VIDEO MANAGEMENT */}
                        <div className="card p-6 md:p-8 relative">
                            <div className="flex justify-between items-center mb-6 border-b border-slate-100/50 pb-4">
                                <h2 className="text-lg font-black text-slate-800 flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shadow-inner text-base">🎥</span> Manage Video
                                </h2>
                                {existingVid ? (
                                    <span className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-md border shadow-sm ${existingVid.isPublished ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                                        {existingVid.isPublished ? 'PUBLISHED' : 'DRAFT'}
                                    </span>
                                ) : (
                                    <span className="text-[10px] font-bold tracking-widest px-2.5 py-1 uppercase rounded-md bg-slate-50 text-slate-400 border border-transparent">NO VIDEO</span>
                                )}
                            </div>

                            {existingVid && (
                                <div className="bg-slate-50 border border-slate-100/50 p-4 rounded-xl mb-6 text-xs shadow-inner">
                                    <p className="font-bold text-brand-700 mb-2 tracking-wide uppercase">Current Resource</p>
                                    <p className="text-slate-600 truncate mb-1">Source: <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200">{existingVid.source}</span></p>
                                    <p className="text-slate-600 truncate flex items-center gap-2">Content: <a href={existingVid.content} target="_blank" rel="noreferrer" className="text-brand-600 hover:text-brand-700 font-bold hover:underline bg-white px-2 py-0.5 rounded border border-brand-100 flex items-center gap-1">Open Link <span className="text-[10px]">↗</span></a></p>
                                </div>
                            )}

                            <div className="flex gap-2 mb-4 bg-gray-100 p-1 rounded-md max-w-max">
                                <button className={`px-4 py-1 text-sm font-medium rounded ${videoTab === 'UPLOAD' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`} onClick={() => setVideoTab('UPLOAD')}>Upload Video</button>
                                <button className={`px-4 py-1 text-sm font-medium rounded ${videoTab === 'URL' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`} onClick={() => setVideoTab('URL')}>Embedded URL</button>
                            </div>

                            {videoTab === 'UPLOAD' && (
                                <input type="file" accept="video/mp4,video/webm" onChange={e => setVideoFile(e.target.files?.[0] || null)} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-brand-700 hover:file:bg-gray-200 mb-4 border border-gray-200 rounded p-2" />
                            )}
                            {videoTab === 'URL' && (
                                <input type="text" placeholder="e.g. https://www.youtube.com/embed/..." value={videoUrl} onChange={e => setVideoUrl(e.target.value)} className="w-full border-gray-300 border p-2 rounded-md mb-4 text-sm bg-gray-50" />
                            )}

                            <label className="flex items-center gap-2 mb-6 cursor-pointer select-none">
                                <input type="checkbox" checked={videoIsPublished} onChange={e => setVideoIsPublished(e.target.checked)} className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4 cursor-pointer" />
                                <span className="text-sm font-semibold text-gray-700">Publish immediately to students</span>
                            </label>

                            <button onClick={handleSaveVideo} disabled={isSaving} className="w-full btn-brand">
                                {isSaving ? 'Processing...' : (existingVid ? 'Update Video Resource' : 'Save and Set Video')}
                            </button>
                        </div>

                        {/* CHEAT SHEET MANAGEMENT */}
                        <div className="card p-6 md:p-8 relative">
                            <div className="flex justify-between items-center mb-6 border-b border-slate-100/50 pb-4">
                                <h2 className="text-lg font-black text-slate-800 flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shadow-inner text-base">📄</span> Manage Content
                                </h2>
                                {existingCs ? (
                                    <span className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-md border shadow-sm ${existingCs.isPublished ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                                        {existingCs.isPublished ? 'PUBLISHED' : 'DRAFT'}
                                    </span>
                                ) : (
                                    <span className="text-[10px] font-bold tracking-widest px-2.5 py-1 uppercase rounded-md bg-slate-50 text-slate-400 border border-transparent">NO CHEAT SHEET</span>
                                )}
                            </div>

                            {existingCs && (
                                <div className="bg-slate-50 border border-slate-100/50 p-4 rounded-xl mb-6 text-xs shadow-inner">
                                    <p className="font-bold text-brand-700 mb-2 tracking-wide uppercase">Current Resource</p>
                                    <p className="text-slate-600 truncate mb-1">Source: <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200">{existingCs.source}</span></p>
                                    {existingCs.source === 'UPLOAD' && <p className="text-slate-600 truncate flex items-center gap-2">Content: <a href={existingCs.content} target="_blank" rel="noreferrer" className="text-brand-600 hover:text-brand-700 font-bold hover:underline bg-white px-2 py-0.5 rounded border border-brand-100 flex items-center gap-1">Open Link <span className="text-[10px]">↗</span></a></p>}
                                </div>
                            )}

                            <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-md overflow-x-auto whitespace-nowrap scrollbar-hide">
                                <button className={`px-3 py-1 text-sm font-medium rounded flex-1 ${csTab === 'UPLOAD' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`} onClick={() => setCsTab('UPLOAD')}>Upload PDF</button>
                                <button className={`px-3 py-1 text-sm font-medium rounded flex-1 ${csTab === 'MARKDOWN' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`} onClick={() => setCsTab('MARKDOWN')}>Raw Markdown</button>
                                <button className={`px-3 py-1 text-sm font-medium rounded flex-1 ${csTab === 'C1_JSON' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`} onClick={() => setCsTab('C1_JSON')}>Existing C1 JSON</button>
                            </div>

                            {csTab === 'UPLOAD' && (
                                <input type="file" accept="application/pdf,text/markdown" onChange={e => setCsFile(e.target.files?.[0] || null)} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 mb-4 border border-gray-200 rounded p-2" />
                            )}
                            {csTab === 'MARKDOWN' && (
                                <textarea placeholder="# Markdown Content..." value={csMarkdown} onChange={e => setCsMarkdown(e.target.value)} className="w-full border border-gray-300 rounded-md p-3 text-sm font-mono bg-gray-50 h-32 mb-4 focus:ring-brand-500" />
                            )}
                            {csTab === 'C1_JSON' && (
                                <div className="w-full bg-blue-50 text-blue-800 p-4 rounded-md text-sm mb-4 border border-blue-200">
                                    This will tell the student interface to safely fall back to the existing JSON blocks (`ContentRenderer.tsx`) configured for this concept natively.
                                </div>
                            )}

                            <label className="flex items-center gap-2 mb-6 cursor-pointer select-none">
                                <input type="checkbox" checked={csIsPublished} onChange={e => setCsIsPublished(e.target.checked)} className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4 cursor-pointer" />
                                <span className="text-sm font-semibold text-gray-700">Publish immediately to students</span>
                            </label>

                            <button onClick={handleSaveCheatSheet} disabled={isSaving} className="w-full btn-brand">
                                {isSaving ? 'Processing...' : (existingCs ? 'Update Cheat Sheet Resource' : 'Save and Set Cheat Sheet')}
                            </button>
                        </div>

                    </div>

                    <div className="card p-6 md:p-8 border border-slate-200 mb-16 mt-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">📝</span> Concept Quiz
                            </h2>
                            <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200 hover:bg-slate-100 transition-colors">
                                <input type="checkbox" checked={quizIsPublished} onChange={e => setQuizIsPublished(e.target.checked)} className="rounded text-blue-600 w-4 h-4 cursor-pointer" />
                                <span className="text-xs font-bold text-slate-600 tracking-wide uppercase">Published</span>
                            </label>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-bold text-slate-700 mb-2 flex justify-between">
                                <span>Questions JSON Payload</span>
                                <span className="text-xs text-slate-400 font-normal">[{'{ prompt, options, correctAnswer ...}'}]</span>
                            </label>
                            <textarea value={quizJson} onChange={e => setQuizJson(e.target.value)} rows={12} className="w-full border border-gray-300 rounded-md p-3 text-[13px] font-mono bg-gray-50 focus:ring-brand-500 transition-all text-slate-700" placeholder="[{ prompt: 'Question?', options: [{ id: 'a', text: 'Opt 1' }], correctAnswer: { optionId: 'a' }, explanation: '...', points: 1 }]" />
                        </div>

                        <button onClick={handleSaveQuiz} disabled={isSaving} className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow hover:shadow-md transition-all py-3 rounded-lg font-bold">{isSaving ? 'Processing...' : 'Save Concept Quiz'}</button>
                    </div>
                </>
            )}
        </div>
    );
}
