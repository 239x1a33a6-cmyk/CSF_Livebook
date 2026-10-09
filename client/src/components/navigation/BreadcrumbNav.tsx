import { Link } from 'react-router-dom';

interface BreadcrumbItem {
    label: string;
    path?: string;
}

export function BreadcrumbNav({ items }: { items: BreadcrumbItem[] }) {
    if (!items || items.length === 0) return null;

    return (
        <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center space-x-2 text-sm text-gray-500">
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;
                    return (
                        <li key={index} className="flex items-center">
                            {isLast ? (
                                <span className="font-medium text-gray-900" aria-current="page">
                                    {item.label}
                                </span>
                            ) : (
                                <>
                                    {item.path ? (
                                        <Link to={item.path} className="hover:text-gray-900 transition-colors">
                                            {item.label}
                                        </Link>
                                    ) : (
                                        <span>{item.label}</span>
                                    )}
                                    <svg className="w-4 h-4 ml-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
