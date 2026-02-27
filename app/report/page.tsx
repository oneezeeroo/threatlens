'use client';

import { useEffect, useState, useCallback } from 'react';
import { NormalizedCVE, SeverityLevel } from '@/types/cve';
import { getWatchlist } from '@/lib/storage';
import { fetchCVEById } from '@/lib/nvdClient';
import { buildReportData } from '@/lib/export';
import { SEVERITY_COLORS } from '@/lib/severity';
import SeverityBadge from '@/components/SeverityBadge';

export default function ReportPage() {
    const [cves, setCves] = useState<NormalizedCVE[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = useCallback(async () => {
        setLoading(true);
        const watchlist = getWatchlist();
        const results: NormalizedCVE[] = [];
        for (const item of watchlist) {
            try {
                const cve = await fetchCVEById(item.cveId);
                if (cve) results.push(cve);
            } catch {
                // Skip
            }
        }
        setCves(results);
        setLoading(false);
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    if (loading) {
        return (
            <div className="py-20 text-center text-slate-400">Generating report…</div>
        );
    }

    if (cves.length === 0) {
        return (
            <div className="py-20 text-center text-slate-500">
                No tracked CVEs to report. Add some from the Search page.
            </div>
        );
    }

    const report = buildReportData(cves);

    return (
        <div className="mx-auto max-w-4xl space-y-8 print:space-y-6">
            {/* Print button (hidden in print) */}
            <div className="flex justify-end print:hidden">
                <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 rounded-lg bg-cyan-500/10 px-4 py-2.5 text-sm font-medium text-cyan-400 hover:bg-cyan-500/20"
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m0 0a48.159 48.159 0 0 1 12.5 0m-12.5 0V5.625A2.625 2.625 0 0 1 9.75 3h4.5a2.625 2.625 0 0 1 2.625 2.625v3.182" />
                    </svg>
                    Print Report
                </button>
            </div>

            {/* Report header */}
            <div className="border-b border-white/10 pb-6 print:border-slate-300">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 print:from-cyan-700 print:to-purple-800">
                        <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white print:text-slate-900">
                            ThreatLens Risk Summary Report
                        </h1>
                        <p className="text-sm text-slate-400 print:text-slate-600">
                            Generated: {new Date(report.generatedAt).toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <SummaryCard label="Total CVEs" value={report.totalCVEs} />
                <SummaryCard label="Critical" value={report.severityCounts.Critical} color="text-red-400 print:text-red-700" />
                <SummaryCard label="High" value={report.severityCounts.High} color="text-orange-400 print:text-orange-700" />
                <SummaryCard label="Avg Score" value={report.averageScore} color="text-yellow-400 print:text-yellow-700" />
            </div>

            {/* Severity breakdown */}
            <div className="rounded-xl border border-white/5 bg-slate-900/40 p-5 print:border-slate-300 print:bg-white">
                <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-slate-400 print:text-slate-600">
                    Severity Distribution
                </h2>
                <div className="space-y-3">
                    {(Object.entries(report.severityCounts) as [SeverityLevel, number][]).map(([sev, count]) => (
                        <div key={sev} className="flex items-center gap-3">
                            <span className="w-20 text-sm text-slate-400 print:text-slate-600">{sev}</span>
                            <div className="flex-1">
                                <div className="h-6 overflow-hidden rounded-full bg-slate-800 print:bg-slate-200">
                                    <div
                                        className="h-full rounded-full transition-all"
                                        style={{
                                            width: report.totalCVEs > 0 ? `${(count / report.totalCVEs) * 100}%` : '0%',
                                            backgroundColor: SEVERITY_COLORS[sev].dot.replace('bg-', ''),
                                            background: `var(--severity-${sev.toLowerCase()}, ${sev === 'Critical' ? '#ef4444' :
                                                    sev === 'High' ? '#f97316' :
                                                        sev === 'Medium' ? '#eab308' :
                                                            sev === 'Low' ? '#3b82f6' : '#64748b'
                                                })`,
                                        }}
                                    />
                                </div>
                            </div>
                            <span className="w-8 text-right text-sm font-medium text-slate-300 print:text-slate-700">{count}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* CVE list */}
            <div className="space-y-4">
                <h2 className="text-sm font-medium uppercase tracking-wider text-slate-400 print:text-slate-600">
                    Vulnerability Details
                </h2>
                {report.cves.map((cve) => (
                    <div
                        key={cve.id}
                        className="rounded-xl border border-white/5 bg-slate-900/40 p-4 print:border-slate-300 print:bg-white"
                    >
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-sm font-semibold text-cyan-400 print:text-cyan-700">
                                {cve.id}
                            </span>
                            <SeverityBadge severity={cve.severity} size="sm" />
                            {cve.cvss.score !== null && (
                                <span className="text-xs text-slate-500">
                                    CVSS {cve.cvss.version}: {cve.cvss.score}
                                </span>
                            )}
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-slate-400 print:text-slate-700">
                            {cve.description}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                            <span>Published: {cve.published ? new Date(cve.published).toLocaleDateString() : 'N/A'}</span>
                            {cve.cwe.length > 0 && <span>CWE: {cve.cwe.join(', ')}</span>}
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="border-t border-white/10 pt-4 text-center text-xs text-slate-500 print:border-slate-300 print:text-slate-400">
                Generated by ThreatLens · CVE data sourced from NVD (National Vulnerability Database)
            </div>
        </div>
    );
}

function SummaryCard({ label, value, color }: { label: string; value: number | string; color?: string }) {
    return (
        <div className="rounded-xl border border-white/5 bg-slate-900/40 p-4 text-center print:border-slate-300 print:bg-white">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500 print:text-slate-600">{label}</p>
            <p className={`mt-1 text-2xl font-bold ${color || 'text-white print:text-slate-900'}`}>{value}</p>
        </div>
    );
}
