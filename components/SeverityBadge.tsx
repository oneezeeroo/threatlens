import { SeverityLevel } from '@/types/cve';
import { SEVERITY_COLORS } from '@/lib/severity';

interface SeverityBadgeProps {
    severity: SeverityLevel;
    size?: 'sm' | 'md';
}

export default function SeverityBadge({ severity, size = 'md' }: SeverityBadgeProps) {
    const colors = SEVERITY_COLORS[severity];
    const sizeClasses = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border ${colors.bg} ${colors.text} ${colors.border} ${sizeClasses} font-semibold uppercase tracking-wider backdrop-blur-sm shadow-[0_0_10px_rgba(0,0,0,0.5)]`}
        >
            <span className={`h-1.5 w-1.5 rounded-full ${colors.dot} shadow-[0_0_8px_${colors.dot.replace('bg-', '')}]`} />
            {severity}
        </span>
    );
}
