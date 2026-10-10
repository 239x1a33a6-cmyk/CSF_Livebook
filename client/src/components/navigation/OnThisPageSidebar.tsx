import { useEffect, useState } from 'react';

interface HeadingElement {
    id: string;
    text: string;
    level: number;
}

export function OnThisPageSidebar() {
    const [headings, setHeadings] = useState<HeadingElement[]>([]);
    const [activeId, setActiveId] = useState<string>('');

    useEffect(() => {
        // Query elements with data-section attribute
        const elements = Array.from(document.querySelectorAll('h2[id], h3[id]'));

        const newHeadings: HeadingElement[] = elements.map((el) => ({
            id: el.id,
            text: el.textContent || '',
            level: el.tagName === 'H3' ? 3 : 2,
        }));

        setHeadings(newHeadings);

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setActiveId(entry.target.id);
                }
            });
        }, { rootMargin: '0px 0px -80% 0px' });

        elements.forEach((el) => observer.observe(el));

        return () => {
            elements.forEach((el) => observer.unobserve(el));
        };
    }, []);

    // Also observe location changes here? The caller/parent might need to remount to re-trigger.

    if (headings.length === 0) return null;

    return (
        <div className="w-64 flex-shrink-0 border-l border-gray-200 bg-white h-[calc(100vh-3.5rem)] overflow-y-auto hidden lg:block p-6">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                On This Page
            </h4>
            <ul className="space-y-2">
                {headings.map((h) => (
                    <li key={h.id} className={h.level === 3 ? 'ml-3' : ''}>
                        <a
                            href={`#${h.id}`}
                            className={`block text-sm leading-snug transition-colors ${activeId === h.id
                                ? 'text-brand-600 font-semibold'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            {h.text}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}
