import { SeverityLevel } from '@/types/cve';

/**
 * Map a CVSS numeric score to a severity label.
 * CVSS v3.x / v4.0 ranges:
 *   0.0       → Unknown (should not happen if score exists)
 *   0.1–3.9   → Low
 *   4.0–6.9   → Medium
 *   7.0–8.9   → High
 *   9.0–10.0  → Critical
 */
export function scoreToSeverity(score: number | null): SeverityLevel {
    if (score === null || score === undefined) return 'Unknown';
    if (score >= 9.0) return 'Critical';
    if (score >= 7.0) return 'High';
    if (score >= 4.0) return 'Medium';
    if (score > 0) return 'Low';
    return 'Unknown';
}

/** Colors for each severity level (Tailwind classes) */
export const SEVERITY_COLORS: Record<SeverityLevel, { bg: string; text: string; border: string; dot: string }> = {
    Critical: { bg: 'bg-[#1a0b0b]', text: 'text-[#ff3366]', border: 'border-[#ff3366]/30', dot: 'bg-[#ff3366]' },
    High: { bg: 'bg-[#1a1005]', text: 'text-[#ff8800]', border: 'border-[#ff8800]/30', dot: 'bg-[#ff8800]' },
    Medium: { bg: 'bg-[#1a1605]', text: 'text-[#ffdd00]', border: 'border-[#ffdd00]/30', dot: 'bg-[#ffdd00]' },
    Low: { bg: 'bg-[#05151a]', text: 'text-[#00ffcc]', border: 'border-[#00ffcc]/30', dot: 'bg-[#00ffcc]' },
    Unknown: { bg: 'bg-[#111116]', text: 'text-[#94a3b8]', border: 'border-white/10', dot: 'bg-slate-500' },
};

/** Chart colors (hex) per severity */
export const SEVERITY_CHART_COLORS: Record<SeverityLevel, string> = {
    Critical: '#ff3366',
    High: '#ff8800',
    Medium: '#ffdd00',
    Low: '#00ffcc',
    Unknown: '#94a3b8',
};
