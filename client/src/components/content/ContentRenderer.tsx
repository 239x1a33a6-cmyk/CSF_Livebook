import type { ContentBlock } from '@shared/types/content';
import * as Diagrams from '../diagrams';

// ── Registry-based ContentRenderer ───────────────────────────────────────────
// To add a new block type: create a component below and add it to BLOCK_REGISTRY.

export function ContentRenderer({ blocks }: { blocks: ContentBlock[] }) {
    return (
        <div className="content-body space-y-6">
            {blocks.map((block, i) => {
                const Component = BLOCK_REGISTRY[block.type];
                if (!Component) {
                    return (
                        <div key={block.id ?? i} className="text-xs text-red-500 border border-red-200 px-3 py-2 rounded">
                            Unknown block type: <code>{block.type}</code>
                        </div>
                    );
                }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return <Component key={block.id ?? i} data={(block as any).data} />;
            })}
        </div>
    );
}

// ── Block components ──────────────────────────────────────────────────────────

function HeadingBlock({ data }: { data: { text: string; level?: number } }) {
    const level = data.level ?? 2;
    const sizes: Record<number, string> = {
        1: 'text-2xl font-bold mt-10 mb-4',
        2: 'text-xl font-semibold mt-8 mb-3 text-gray-900 pb-2 border-b border-gray-100',
        3: 'text-lg font-semibold mt-6 mb-2 text-gray-800',
        4: 'text-base font-semibold mt-4 mb-2 text-gray-700',
        5: 'text-sm font-semibold mt-3 mb-1 text-gray-600',
        6: 'text-xs font-semibold mt-2 mb-1 text-gray-500 uppercase tracking-wide',
    };
    const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    return <Tag className={sizes[level] ?? sizes[2]}>{data.text}</Tag>;
}

function TextBlock({ data }: { data: { text: string } }) {
    // Support **bold**, *italic*, `code` in text
    const html = data.text
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`(.+?)`/g, '<code>$1</code>')
        .replace(/\n/g, '<br/>');
    return (
        <p
            className="text-sm text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}

function CalloutBlock({ data }: { data: { type: string; title?: string; text: string } }) {
    const classes: Record<string, string> = {
        info: 'content-callout-info',
        tip: 'content-callout-tip',
        warning: 'content-callout-warning',
        danger: 'content-callout-danger',
        note: 'content-callout-note',
    };
    const icons: Record<string, string> = {
        info: 'ℹ️', tip: '💡', warning: '⚠️', danger: '🚨', note: '📝',
    };
    return (
        <div className={`${classes[data.type] ?? classes.note} p-4 rounded-lg`}>
            {data.title && (
                <div className="flex items-center gap-2 font-semibold text-sm mb-1">
                    <span>{icons[data.type] ?? '📝'}</span> {data.title}
                </div>
            )}
            <p className="text-sm whitespace-pre-line">{data.text}</p>
        </div>
    );
}

function TableBlock({ data }: { data: { headers: string[]; rows: string[][]; caption?: string } }) {
    return (
        <div className="overflow-x-auto">
            {data.caption && <p className="text-xs text-gray-500 mb-2 italic">{data.caption}</p>}
            <table className="w-full text-sm border-collapse">
                <thead>
                    <tr className="bg-gray-50">
                        {data.headers.map((h, i) => (
                            <th key={i} className="border border-gray-200 px-4 py-2 text-left font-semibold text-gray-700 text-xs">
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.rows.map((row, ri) => (
                        <tr key={ri} className="hover:bg-gray-50">
                            {row.map((cell, ci) => (
                                <td key={ci} className="border border-gray-200 px-4 py-2 text-gray-700 text-xs">
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function DiagramBlock({ data }: {
    data: { visualKey: string; title: string; caption?: string; description?: string; whatToNotice?: string[]; imageUrl?: string }
}) {
    // Dynamically grab diagram component
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const DiagramComponent = data.visualKey ? (Diagrams as any)[data.visualKey.replace('-', '')] : null;

    return (
        <div className="border border-dashed border-brand-200 rounded-xl p-5 bg-brand-50">
            <div className="flex items-center gap-2 mb-3">
                <span className="badge-blue text-xs">{data.visualKey}</span>
                <span className="text-sm font-semibold text-gray-800">{data.title}</span>
            </div>

            {data.imageUrl ? (
                <img src={data.imageUrl} alt={data.title} className="w-full rounded-lg mb-3" />
            ) : DiagramComponent ? (
                <div className="mb-4">
                    <DiagramComponent />
                </div>
            ) : (
                <div className="bg-white border border-brand-100 rounded-lg h-40 flex items-center justify-center mb-3">
                    <p className="text-xs text-gray-400">[ Diagram: {data.title} ]</p>
                </div>
            )}

            {data.caption && <p className="text-xs text-gray-600 mb-2 italic">{data.caption}</p>}
            {data.description && <p className="text-xs text-gray-600 mb-2">{data.description}</p>}

            {data.whatToNotice && data.whatToNotice.length > 0 && (
                <div>
                    <p className="text-xs font-semibold text-gray-600 mb-1">What to notice:</p>
                    <ul className="space-y-1">
                        {data.whatToNotice.map((point, i) => (
                            <li key={i} className="text-xs text-gray-600 flex items-start gap-2">
                                <span className="text-brand-400 mt-0.5">→</span> {point}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

function ExampleBlock({ data }: { data: { title?: string; scenario?: string; explanation: string; code?: string; language?: string } }) {
    return (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
            {data.title && <p className="text-sm font-semibold text-gray-800 mb-2">📌 {data.title}</p>}
            {data.scenario && <p className="text-xs text-gray-500 italic mb-2">{data.scenario}</p>}
            <p className="text-sm text-gray-700">{data.explanation}</p>
            {data.code && (
                <pre className="mt-3 bg-gray-900 text-green-400 text-xs p-4 rounded-lg overflow-x-auto font-mono">
                    <code>{data.code}</code>
                </pre>
            )}
        </div>
    );
}

function CodeBlock({ data }: { data: { language: string; code: string; caption?: string } }) {
    return (
        <div>
            {data.caption && <p className="text-xs text-gray-500 mb-1">{data.caption}</p>}
            <div className="relative">
                <div className="absolute top-2 right-3 text-xs text-gray-500 font-mono">{data.language}</div>
                <pre className="bg-gray-900 text-gray-100 text-xs p-4 pt-6 rounded-xl overflow-x-auto font-mono leading-relaxed">
                    <code>{data.code}</code>
                </pre>
            </div>
        </div>
    );
}

function ComparisonBlock({ data }: {
    data: {
        title?: string;
        items?: Array<{ label: string; description: string }>;
        table?: { headers: [string, string]; rows: Array<[string, string]> }
    }
}) {
    return (
        <div>
            {data.title && <p className="text-sm font-semibold text-gray-800 mb-3">{data.title}</p>}
            {data.table && (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr>
                                {data.table.headers.map((h, i) => (
                                    <th key={i} className={`border border-gray-200 px-4 py-2 text-left font-semibold text-xs ${i === 0 ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.table.rows.map((row, ri) => (
                                <tr key={ri} className="hover:bg-gray-50">
                                    {row.map((cell, ci) => (
                                        <td key={ci} className="border border-gray-200 px-4 py-2 text-xs text-gray-700">{cell}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {data.items && (
                <div className="space-y-2">
                    {data.items.map((item, i) => (
                        <div key={i} className="flex gap-3">
                            <span className="text-xs font-semibold text-brand-600 w-24 flex-shrink-0">{item.label}</span>
                            <span className="text-xs text-gray-700">{item.description}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function MisconceptionBlock({ data }: { data: { misconception: string; reality: string; explanation?: string } }) {
    return (
        <div className="border border-red-100 rounded-xl overflow-hidden">
            <div className="bg-red-50 px-4 py-3 flex items-start gap-2">
                <span className="text-red-500 text-sm">✗</span>
                <div>
                    <p className="text-xs font-semibold text-red-700 mb-0.5">Common Misconception</p>
                    <p className="text-sm text-red-800">{data.misconception}</p>
                </div>
            </div>
            <div className="bg-green-50 px-4 py-3 flex items-start gap-2">
                <span className="text-green-500 text-sm">✓</span>
                <div>
                    <p className="text-xs font-semibold text-green-700 mb-0.5">Reality</p>
                    <p className="text-sm text-green-800">{data.reality}</p>
                </div>
            </div>
            {data.explanation && (
                <div className="bg-gray-50 px-4 py-3">
                    <p className="text-xs text-gray-600">{data.explanation}</p>
                </div>
            )}
        </div>
    );
}

function WarningBlock({ data }: { data: { title?: string; text: string } }) {
    return (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
            <div className="flex items-center gap-2 font-semibold text-sm text-yellow-800 mb-1">
                ⚠️ {data.title ?? 'Warning'}
            </div>
            <p className="text-sm text-yellow-900">{data.text}</p>
        </div>
    );
}

function UnderstandingCheckBlock({ data }: {
    data: { id: string; question: string; options: Array<{ id: string; text: string }>; hint?: string }
}) {
    return (
        <div className="border border-brand-200 rounded-xl p-5 bg-brand-50">
            <p className="text-xs font-semibold text-brand-600 mb-3 uppercase tracking-wide">✍️ Understanding Check</p>
            <p className="text-sm text-gray-800 font-medium mb-4">{data.question}</p>
            <div className="space-y-2">
                {data.options.map((opt) => (
                    <label key={opt.id} className="flex items-center gap-3 cursor-pointer group">
                        <input type="radio" name={`uc-${data.id}`} value={opt.id} className="accent-brand-600" />
                        <span className="text-sm text-gray-700 group-hover:text-gray-900">{opt.text}</span>
                    </label>
                ))}
            </div>
            {data.hint && <p className="text-xs text-gray-500 mt-3 italic">💡 Hint: {data.hint}</p>}
        </div>
    );
}

function InterviewQuestionBlock({ data }: {
    data: { question: string; difficulty?: string; keyPoints?: string[]; sampleAnswer?: string; tags?: string[] }
}) {
    return (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gray-900 px-5 py-4">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-mono text-gray-400">Interview Question</span>
                    {data.difficulty && (
                        <span className={`text-xs px-2 py-0.5 rounded font-mono ${data.difficulty === 'easy' ? 'bg-green-900 text-green-300' :
                            data.difficulty === 'medium' ? 'bg-yellow-900 text-yellow-300' :
                                'bg-red-900 text-red-300'
                            }`}>{data.difficulty}</span>
                    )}
                </div>
                <p className="text-white text-sm font-medium">{data.question}</p>
            </div>
            {(data.keyPoints && data.keyPoints.length > 0) && (
                <div className="px-5 py-4">
                    <p className="text-xs font-semibold text-gray-600 mb-2">Key Points to Cover:</p>
                    <ul className="space-y-1">
                        {data.keyPoints.map((pt, i) => (
                            <li key={i} className="text-xs text-gray-700 flex items-start gap-2">
                                <span className="text-brand-400">•</span> {pt}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

function QuizReferenceBlock({ data }: { data: { assessmentId: string; title?: string; questionCount?: number } }) {
    return (
        <div className="bg-brand-600 text-white rounded-xl p-6 text-center">
            <p className="text-xs font-semibold opacity-75 mb-2 uppercase tracking-wide">Concept Quiz</p>
            <h3 className="text-lg font-semibold mb-1">{data.title ?? 'Take the Quiz'}</h3>
            {data.questionCount && (
                <p className="text-sm opacity-75 mb-4">{data.questionCount} questions</p>
            )}
            <p className="text-xs opacity-60">Scroll to the bottom or click Take Quiz in the sidebar</p>
        </div>
    );
}

function CheatSheetBlock({ data }: { data: any }) {
    if (!data || !data.oneLineDefinition) return <div className="text-red-500">Invalid Cheat Sheet Data</div>;
    return (
        <div className="space-y-12 pb-10">
            {/* Core Definitions */}
            <div>
                <h3 className="text-xl font-bold text-white mb-4 border-b border-gray-800 pb-2">Core Definitions</h3>
                <div className="grid gap-4">
                    {Object.entries(data.oneLineDefinition).map(([k, v]) => (
                        <div key={k} className="p-4 bg-[#1a1c1d] border border-gray-800 rounded-lg">
                            <span className="font-mono text-brand-400 font-semibold mb-2 block uppercase tracking-wider text-xs">{k}</span>
                            <p className="text-sm text-gray-300 leading-relaxed">{String(v)}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Core Idea */}
            {data.coreIdea && (
                <div>
                    <h3 className="text-xl font-bold text-white mb-4 border-b border-gray-800 pb-2">The Core Idea</h3>
                    <ul className="space-y-3">
                        {data.coreIdea.map((idea: string, i: number) => (
                            <li key={i} className="flex gap-3 text-sm text-gray-400 leading-relaxed">
                                <span className="text-brand-500 mt-1 flex-shrink-0">▪</span>
                                <span>{idea}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Key Terms */}
            {data.keyTerms && (
                <div>
                    <h3 className="text-xl font-bold text-white mb-4 border-b border-gray-800 pb-2">Key Terms</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {data.keyTerms.map((t: any, i: number) => (
                            <div key={i} className="flex items-start gap-3 border-l-2 border-gray-800 pl-4 py-1">
                                <div className="flex-1">
                                    <p className="text-brand-400 font-mono text-xs mb-1.5">{t.term}</p>
                                    <p className="text-xs text-gray-400 leading-relaxed">{t.meaning}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>)}

            {/* Comparison Tables */}
            {data.comparisonTables && data.comparisonTables.map((table: any, i: number) => (
                <div key={i} className="overflow-x-auto">
                    <h3 className="text-xl font-bold text-white mb-4 border-b border-gray-800 pb-2">{table.title}</h3>
                    <table className="w-full text-sm border-collapse bg-[#1a1c1d] rounded-lg overflow-hidden border border-gray-800">
                        <thead>
                            <tr className="bg-[#242729] border-b border-gray-800">
                                {table.columns.map((c: string, ci: number) => (
                                    <th key={ci} className="px-4 py-3 text-left font-semibold text-gray-300">{c}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {table.rows.map((r: string[], ri: number) => (
                                <tr key={ri} className="hover:bg-[#202224] transition-colors">
                                    {r.map((cell: string, ci: number) => (
                                        <td key={ci} className={`px-4 py-3 leading-relaxed text-gray-400 ${ci === 0 ? 'font-medium text-gray-300' : ''}`}>{cell}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ))}

            {/* Interview Traps */}
            {data.interviewTraps && (
                <div>
                    <h3 className="text-xl font-bold text-white mb-4 border-b border-gray-800 pb-2">Interview Traps</h3>
                    <div className="space-y-4">
                        {data.interviewTraps.map((t: any, i: number) => (
                            <div key={i} className="p-5 border border-red-900/30 bg-red-950/10 rounded-lg">
                                <p className="text-sm font-semibold text-red-400 mb-2">Trap: "{t.trap}"</p>
                                <p className="text-sm text-gray-400 leading-relaxed"><span className="text-gray-300 font-semibold">Answer:</span> {t.answer}</p>
                            </div>
                        ))}
                    </div>
                </div>)}

            {/* Quick Recall */}
            {data.quickRecall && (
                <div className="bg-brand-950/30 border border-brand-900/50 p-6 rounded-xl">
                    <h3 className="text-lg font-bold text-brand-400 mb-4">{data.quickRecall.title}</h3>
                    <ul className="space-y-3">
                        {data.quickRecall.points.map((pt: string, i: number) => (
                            <li key={i} className="flex gap-3 text-sm text-brand-100/70 leading-relaxed">
                                <span className="text-brand-500 mt-1 flex-shrink-0">✓</span>
                                <span>{pt}</span>
                            </li>
                        ))}
                    </ul>
                </div>)}
        </div>
    );
}

function RecapBlock({ data }: { data: { title?: string; points: string[] } }) {
    return (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5">
            <p className="text-sm font-semibold text-green-800 mb-3">✅ {data.title ?? 'What You Learned'}</p>
            <ul className="space-y-2">
                {data.points.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-green-900">
                        <span className="text-green-500 mt-0.5">✓</span> {point}
                    </li>
                ))}
            </ul>
        </div>
    );
}

function ImageBlock({ data }: { data: { src: string; alt: string; caption?: string } }) {
    return (
        <figure>
            <img src={data.src} alt={data.alt} className="w-full rounded-lg" />
            {data.caption && <figcaption className="text-xs text-gray-500 text-center mt-2 italic">{data.caption}</figcaption>}
        </figure>
    );
}

function VideoBlock({ data }: { data: { url: string; title?: string; caption?: string } }) {
    return (
        <div className="aspect-video rounded-xl overflow-hidden bg-gray-900">
            <iframe src={data.url} title={data.title ?? 'Video'} className="w-full h-full" allowFullScreen />
        </div>
    );
}

// ── Registry ──────────────────────────────────────────────────────────────────
// Adding a new block type: create a component above, add it here.
const BLOCK_REGISTRY: Record<string, React.FC<{ data: unknown }>> = {
    heading: HeadingBlock as React.FC<{ data: unknown }>,
    text: TextBlock as React.FC<{ data: unknown }>,
    callout: CalloutBlock as React.FC<{ data: unknown }>,
    table: TableBlock as React.FC<{ data: unknown }>,
    diagram: DiagramBlock as React.FC<{ data: unknown }>,
    example: ExampleBlock as React.FC<{ data: unknown }>,
    code: CodeBlock as React.FC<{ data: unknown }>,
    comparison: ComparisonBlock as React.FC<{ data: unknown }>,
    misconception: MisconceptionBlock as React.FC<{ data: unknown }>,
    warning: WarningBlock as React.FC<{ data: unknown }>,
    understanding_check: UnderstandingCheckBlock as React.FC<{ data: unknown }>,
    interview_question: InterviewQuestionBlock as React.FC<{ data: unknown }>,
    quiz: QuizReferenceBlock as React.FC<{ data: unknown }>,
    cheat_sheet: CheatSheetBlock as React.FC<{ data: unknown }>,
    recap: RecapBlock as React.FC<{ data: unknown }>,
    image: ImageBlock as React.FC<{ data: unknown }>,
    video: VideoBlock as React.FC<{ data: unknown }>,
};

import React from 'react';
