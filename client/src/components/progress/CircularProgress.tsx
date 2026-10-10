

interface CircularProgressProps {
    percentage: number;
    size?: number;
    strokeWidth?: number;
    colorClass?: string;
    trackColorClass?: string;
    label?: string;
}

export function CircularProgress({
    percentage,
    size = 120,
    strokeWidth = 10,
    colorClass = "text-brand-600",
    trackColorClass = "text-gray-200",
    label
}: CircularProgressProps) {
    const safePercentage = isNaN(percentage) ? 0 : Math.min(100, Math.max(0, Math.round(percentage)));
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (safePercentage / 100) * circumference;

    return (
        <div
            className="relative flex items-center justify-center flex-shrink-0"
            style={{ width: size, height: size }}
            role="progressbar"
            aria-valuenow={safePercentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={label ?? `Progress: ${safePercentage}%`}
        >
            <svg width={size} height={size} className="transform -rotate-90">
                <circle
                    className={trackColorClass + " transition-colors"}
                    stroke="currentColor"
                    fill="transparent"
                    strokeWidth={strokeWidth}
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
                <circle
                    className={colorClass + " transition-all duration-700 ease-out motion-reduce:transition-none"}
                    stroke="currentColor"
                    fill="transparent"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-gray-900">{safePercentage}%</span>
            </div>
        </div>
    );
}
