'use client';

import Link from 'next/link';
import { NormalizedCVE, SeverityLevel } from '@/types/cve';
import SeverityBadge from './SeverityBadge';
import { useState, useMemo } from 'react';

interface CVETableProps {
    cves: NormalizedCVE[];
    onRemove?: (id: string) => void;
}

type SortField = 'id' | 'severity' | 'score' | 'published' | 'lastModified';
type SortDir = 'asc' | 'desc';

const severityOrder: Record<SeverityLevel, number> = {
    Critical: 4,
    High: 3,
    Medium: 2,
    Low: 1,
    Unknown: 0,
};

export default function CVETable({ cves, onRemove }: CVETableProps) {
    const [sortField, setSortField] = useState<SortField>('score');
    const [sortDir, setSortDir] = useState<SortDir>('desc');
    const [filterSeverity, setFilterSeverity] = useState<SeverityLevel | 'All'>('All');
    const [textFilter, setTextFilter] = useState('');

    const toggleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortField(field);
            setSortDir('desc');
        }
    };

    const filtered = useMemo(() => {
        let result = [...cves];

        // Severity filter
        if (filterSeverity !== 'All') {
            result = result.filter((c) => c.severity === filterSeverity);
        }

        // Text filter
        if (textFilter.trim()) {
            const q = textFilter.toLowerCase();
            result = result.filter(
                (c) =>
                    c.id.toLowerCase().includes(q) ||
                    c.description.toLowerCase().includes(q)
            );
        }

        // Sort
        result.sort((a, b) => {
            let cmp = 0;
            switch (sortField) {
                case 'id':
                    cmp = a.id.localeCompare(b.id);
                    break;
                case 'severity':
                    cmp = severityOrder[a.severity] - severityOrder[b.severity];
                    break;
                case 'score':
                    cmp = (a.cvss.score ?? -1) - (b.cvss.score ?? -1);
                    break;
                case 'published':
                    cmp = (a.published ?? '').localeCompare(b.published ?? '');
                    break;
                case 'lastModified':
                    cmp = (a.lastModified ?? '').localeCompare(b.lastModified ?? '');
                    break;
            }
            return sortDir === 'asc' ? cmp : -cmp;
        });

        return result;
    }, [cves, filterSeverity, textFilter, sortField, sortDir]);

    const SortButton = ({ field, label }: { field: SortField; label: string }) => (
        <button
            onClick={() => toggleSort(field)}
            className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
        >
            {label}
            {sortField === field && (
                <span className="text-cyan-500">{sortDir === 'asc' ? '▲' : '▼'}</span>
            )}
        </button>
    );

    return (
        <div>
            {/* Filters */}
            <div className="mb-6 flex flex-wrap items-center gap-4 rounded-xl border border-white/[0.04] bg-[#0c0c10] p-4 shadow-sm">
                <div className="relative flex-1 min-w-[200px]">
                    <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Filter CVEs..."
                        value={textFilter}
                        onChange={(e) => setTextFilter(e.target.value)}
                        className="w-full rounded-lg border border-white/[0.06] bg-[#1a1a24] py-2 pl-9 pr-4 text-sm text-white placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all"
                        aria-label="Filter watchlist"
                    />
                </div>
                <div className="relative">
                    <select
                        value={filterSeverity}
                        onChange={(e) => setFilterSeverity(e.target.value as SeverityLevel | 'All')}
                        className="appearance-none rounded-lg border border-white/[0.06] bg-[#1a1a24] py-2 pl-4 pr-10 text-sm text-white focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all"
                        aria-label="Filter by severity"
                    >
                        <option value="All">All Severities</option>
                        <option value="Critical">Critical</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                        <option value="Unknown">Unknown</option>
                    </select>
                    <svg className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 pointer-events-none text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                </div>
                <div className="flex h-9 items-center rounded-lg bg-[#1a1a24] px-4 border border-white/[0.06]">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        {filtered.length} <span className="text-slate-600">Results</span>
                    </span>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-white/[0.04] bg-[#0c0c10] shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead>
                            <tr className="border-b border-white/[0.04] bg-[#111116]/80 text-xs">
                                <th className="px-5 py-4"><SortButton field="id" label="CVE ID" /></th>
                                <th className="px-5 py-4"><SortButton field="severity" label="Severity" /></th>
                                <th className="px-5 py-4"><SortButton field="score" label="Score" /></th>
                                <th className="hidden px-5 py-4 md:table-cell"><SortButton field="published" label="Published" /></th>
                                <th className="hidden px-5 py-4 lg:table-cell text-[10px] font-bold uppercase tracking-widest text-slate-500">Description</th>
                                {onRemove && <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">Action</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.02]">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-5 py-12 text-center text-sm text-slate-500">
                                        No matching CVEs found in this view.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((cve) => (
                                    <tr
                                        key={cve.id}
                                        className="group transition-colors hover:bg-white/[0.02]"
                                    >
                                        <td className="px-5 py-3.5">
                                            <Link
                                                href={`/cve?id=${cve.id}`}
                                                className="font-mono text-sm font-semibold text-white transition-colors group-hover:text-cyan-400"
                                            >
                                                {cve.id}
                                            </Link>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <SeverityBadge severity={cve.severity} size="sm" />
                                        </td>
                                        <td className="px-5 py-3.5 font-mono text-sm font-medium text-slate-300">
                                            {cve.cvss.score ?? <span className="text-slate-600">N/A</span>}
                                        </td>
                                        <td className="hidden px-5 py-3.5 text-xs font-medium text-slate-400 md:table-cell">
                                            {cve.published
                                                ? new Date(cve.published).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                                                : 'N/A'}
                                        </td>
                                        <td className="hidden px-5 py-3.5 text-xs text-slate-500 lg:table-cell">
                                            <div className="max-w-[300px] xl:max-w-[500px] truncate">
                                                {cve.description}
                                            </div>
                                        </td>
                                        {onRemove && (
                                            <td className="px-5 py-3.5 text-right">
                                                <button
                                                    onClick={() => onRemove(cve.id)}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity rounded-md bg-red-500/10 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-red-400 hover:bg-red-500/20 hover:text-red-300 border border-red-500/10"
                                                    aria-label={`Remove ${cve.id}`}
                                                >
                                                    Remove
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
