'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { NormalizedCVE } from '@/types/cve';
import { getWatchlist, removeFromWatchlist } from '@/lib/storage';
import { fetchCVEById } from '@/lib/nvdClient';
import { exportCSV } from '@/lib/export';
import CVETable from '@/components/CVETable';
import { TableRowSkeleton } from '@/components/LoadingSkeleton';

export default function WatchlistPage() {
    const [cves, setCves] = useState<NormalizedCVE[]>([]);
    const [loading, setLoading] = useState(true);

    const loadWatchlist = useCallback(async () => {
        setLoading(true);
        const watchlist = getWatchlist();

        if (watchlist.length === 0) {
            setCves([]);
            setLoading(false);
            return;
        }

        const results: NormalizedCVE[] = [];
        for (const item of watchlist) {
            try {
                const cve = await fetchCVEById(item.cveId);
                if (cve) results.push(cve);
            } catch {
                // Skip failed fetches
            }
        }
        setCves(results);
        setLoading(false);
    }, []);

    useEffect(() => {
        loadWatchlist();
    }, [loadWatchlist]);

    const handleRemove = (id: string) => {
        removeFromWatchlist(id);
        setCves((prev) => prev.filter((c) => c.id !== id));
    };

    const handleExportCSV = () => {
        exportCSV(cves);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Watchlist</h1>
                    <p className="mt-1 text-sm text-slate-400">
                        Your tracked vulnerabilities for monitoring and reporting.
                    </p>
                </div>

                {cves.length > 0 && (
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleExportCSV}
                            className="flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-700"
                            aria-label="Export as CSV"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                            </svg>
                            Export CSV
                        </button>
                        <Link
                            href="/report"
                            className="flex items-center gap-2 rounded-lg bg-cyan-500/10 px-4 py-2.5 text-sm font-medium text-cyan-400 transition-colors hover:bg-cyan-500/20"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                            </svg>
                            View Report
                        </Link>
                    </div>
                )}
            </div>

            {/* Content */}
            {loading ? (
                <div className="rounded-xl border border-white/5 bg-slate-900/40">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <TableRowSkeleton key={i} />
                    ))}
                </div>
            ) : cves.length === 0 ? (
                <div className="py-20 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-800">
                        <svg className="h-7 w-7 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>
                    </div>
                    <h2 className="text-lg font-medium text-slate-300">No tracked CVEs</h2>
                    <p className="mt-1 text-sm text-slate-500">Search for vulnerabilities and add them to your watchlist.</p>
                    <Link
                        href="/search"
                        className="mt-4 inline-block rounded-lg bg-cyan-500/10 px-5 py-2.5 text-sm font-medium text-cyan-400 hover:bg-cyan-500/20"
                    >
                        Search CVEs
                    </Link>
                </div>
            ) : (
                <CVETable cves={cves} onRemove={handleRemove} />
            )}
        </div>
    );
}
