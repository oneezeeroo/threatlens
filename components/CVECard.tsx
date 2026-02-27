import Link from 'next/link';
import { NormalizedCVE } from '@/types/cve';
import SeverityBadge from './SeverityBadge';

interface CVECardProps {
    cve: NormalizedCVE;
}

export default function CVECard({ cve }: CVECardProps) {
    const published = cve.published
        ? new Date(cve.published).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
        : 'N/A';

    const modified = cve.lastModified
        ? new Date(cve.lastModified).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
        : 'N/A';

    return (
        <Link href={`/cve?id=${cve.id}`}>
            <div className="group relative overflow-hidden cursor-pointer rounded-xl border border-white/[0.04] bg-[#0c0c10] p-4 shadow-md transition-all duration-300 hover:border-white/[0.08] hover:bg-[#111116] hover:-translate-y-0.5">
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-y-2">
                    <div className="flex items-center gap-3">
                        <h3 className="font-mono text-sm font-semibold tracking-tight text-white group-hover:text-cyan-400 transition-colors">
                            {cve.id}
                        </h3>
                        <SeverityBadge severity={cve.severity} size="sm" />
                    </div>
                    {cve.cvss.score !== null && (
                        <span className="flex items-center gap-1 rounded bg-[#1a1a24] px-2 py-0.5 text-xs font-medium text-slate-300 border border-white/[0.03]">
                            CVSS <span className="text-white">{cve.cvss.score}</span>
                        </span>
                    )}
                </div>

                {/* Description */}
                <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-400">
                    {cve.description}
                </p>

                {/* Footer */}
                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium uppercase tracking-wider text-slate-500">
                    <span className="flex items-center gap-1.5">
                        <svg className="h-3.5 w-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                        PUB: <span className="text-slate-300">{published}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                        <svg className="h-3.5 w-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
                        MOD: <span className="text-slate-300">{modified}</span>
                    </span>
                    {cve.cwe.length > 0 && (
                        <span className="flex items-center gap-1.5">
                            <svg className="h-3.5 w-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3Z" /></svg>
                            <span className="text-slate-300">{cve.cwe[0]}</span>
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}
