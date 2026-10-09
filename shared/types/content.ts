// ─── Content Block Types ──────────────────────────────────────────────────────

export type BlockType =
    | 'heading'
    | 'text'
    | 'callout'
    | 'table'
    | 'diagram'
    | 'example'
    | 'code'
    | 'comparison'
    | 'misconception'
    | 'warning'
    | 'understanding_check'
    | 'interview_question'
    | 'quiz'
    | 'cheat_sheet'
    | 'recap'
    | 'image'
    | 'video';

// Heading
export interface HeadingBlockData {
    text: string;
    level?: 1 | 2 | 3 | 4 | 5 | 6;
    id?: string; // anchor for sidebar nav
}

// Plain text / paragraph
export interface TextBlockData {
    text: string; // supports markdown-lite (bold, italic, inline code)
}

// Callout / info box
export interface CalloutBlockData {
    type: 'info' | 'tip' | 'warning' | 'danger' | 'note';
    title?: string;
    text: string;
}

// Table
export interface TableBlockData {
    headers: string[];
    rows: string[][];
    caption?: string;
}

// Diagram / visual
export interface DiagramBlockData {
    visualKey: string;      // e.g. "VB-1"
    title: string;
    caption?: string;
    description?: string;
    whatToNotice?: string[];
    imageUrl?: string;      // optional image override
    interactiveData?: unknown; // future use
}

// Example
export interface ExampleBlockData {
    title?: string;
    scenario?: string;
    explanation: string;
    code?: string;
    language?: string;
}

// Code snippet
export interface CodeBlockData {
    language: string;
    code: string;
    caption?: string;
}

// Comparison
export interface ComparisonBlockData {
    title?: string;
    items: Array<{
        label: string;
        description: string;
    }>;
    // OR side-by-side table
    table?: {
        headers: [string, string];
        rows: Array<[string, string]>;
    };
}

// Misconception
export interface MisconceptionBlockData {
    misconception: string;
    reality: string;
    explanation?: string;
}

// Warning
export interface WarningBlockData {
    title?: string;
    text: string;
}

// Understanding check (inline self-assessment)
export interface UnderstandingCheckData {
    id: string;
    question: string;
    options: Array<{ id: string; text: string }>;
    // Correct answer NOT included here — for inline checks only
    // correctOptionId stored server-side
    hint?: string;
}

// Interview question
export interface InterviewQuestionBlockData {
    question: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    keyPoints?: string[];
    sampleAnswer?: string;  // shown after user reveals it
    tags?: string[];
}

// Quiz reference block (signals quiz placement in content flow)
export interface QuizBlockData {
    assessmentId: string;
    title?: string;
    questionCount?: number;
}

// Cheat sheet
export interface CheatSheetBlockData {
    title?: string;
    sections: Array<{
        heading: string;
        items: Array<{ term: string; definition: string }>;
    }>;
}

// Recap / summary
export interface RecapBlockData {
    title?: string;
    points: string[];
}

// Image
export interface ImageBlockData {
    src: string;
    alt: string;
    caption?: string;
    width?: string;
}

// Video
export interface VideoBlockData {
    url: string;
    title?: string;
    caption?: string;
    provider?: 'youtube' | 'vimeo' | 'direct';
}

// ─── Generic Block Union ───────────────────────────────────────────────────────

export type ContentBlock =
    | { type: 'heading'; id?: string; data: HeadingBlockData }
    | { type: 'text'; id?: string; data: TextBlockData }
    | { type: 'callout'; id?: string; data: CalloutBlockData }
    | { type: 'table'; id?: string; data: TableBlockData }
    | { type: 'diagram'; id?: string; data: DiagramBlockData }
    | { type: 'example'; id?: string; data: ExampleBlockData }
    | { type: 'code'; id?: string; data: CodeBlockData }
    | { type: 'comparison'; id?: string; data: ComparisonBlockData }
    | { type: 'misconception'; id?: string; data: MisconceptionBlockData }
    | { type: 'warning'; id?: string; data: WarningBlockData }
    | { type: 'understanding_check'; id?: string; data: UnderstandingCheckData }
    | { type: 'interview_question'; id?: string; data: InterviewQuestionBlockData }
    | { type: 'quiz'; id?: string; data: QuizBlockData }
    | { type: 'cheat_sheet'; id?: string; data: CheatSheetBlockData }
    | { type: 'recap'; id?: string; data: RecapBlockData }
    | { type: 'image'; id?: string; data: ImageBlockData }
    | { type: 'video'; id?: string; data: VideoBlockData };

export interface ConceptContentPayload {
    blocks: ContentBlock[];
}
