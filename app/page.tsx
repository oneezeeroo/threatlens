'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { NormalizedCVE, SeverityLevel } from '@/types/cve';
import { getWatchlist } from '@/lib/storage';
import { fetchCVEById } from '@/lib/nvdClient';
import StatCard from '@/components/StatCard';
import ChartSeverityBreakdown from '@/components/ChartSeverityBreakdown';
import SeverityBadge from '@/components/SeverityBadge';
import { CardSkeleton } from '@/components/LoadingSkeleton';

export default function DashboardPage() {
  const [cves, setCves] = useState<NormalizedCVE[]>([]);
  const [loading, setLoading] = useState(true);

  const loadWatchlistCVEs = useCallback(async () => {
    setLoading(true);
    const watchlist = getWatchlist();

    if (watchlist.length === 0) {
      setCves([]);
      setLoading(false);
      return;
    }

    const results: NormalizedCVE[] = [];
    // Fetch in batches to avoid rate limits
    for (const item of watchlist) {
      try {
        const cve = await fetchCVEById(item.cveId);
        if (cve) results.push(cve);
      } catch {
        // Skip failed fetches silently
      }
    }
    setCves(results);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadWatchlistCVEs();
  }, [loadWatchlistCVEs]);

  // Compute stats
  const severityCounts: Record<SeverityLevel, number> = {
    Critical: 0,
    High: 0,
    Medium: 0,
    Low: 0,
    Unknown: 0,
  };
  for (const c of cves) severityCounts[c.severity]++;

  const avgScore =
    cves.filter((c) => c.cvss.score !== null).length > 0
      ? Math.round(
        (cves.filter((c) => c.cvss.score !== null).reduce((s, c) => s + (c.cvss.score || 0), 0) /
          cves.filter((c) => c.cvss.score !== null).length) *
        10
      ) / 10
      : 0;

  const highRisk = severityCounts.Critical + severityCounts.High;

  return (
    <div className="space-y-8">
      {/* Hero header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-400">
          Overview of your tracked vulnerabilities and risk posture.
        </p>
      </div>

      {/* Stats grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Tracked CVEs"
            value={cves.length}
            color="text-cyan-400"
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            }
          />
          <StatCard
            label="High Risk"
            value={highRisk}
            color="text-red-400"
            subtitle="Critical + High"
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            }
          />
          <StatCard
            label="Avg. CVSS Score"
            value={avgScore || '—'}
            color="text-yellow-400"
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
              </svg>
            }
          />
          <StatCard
            label="CWE Patterns"
            value={[...new Set(cves.flatMap((c) => c.cwe))].length}
            color="text-purple-400"
            subtitle="Unique weaknesses"
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23-.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
              </svg>
            }
          />
        </div>
      )}

      {/* Main content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Chart */}
        <div className="lg:col-span-1">
          <ChartSeverityBreakdown data={severityCounts} />
        </div>

        {/* Recent tracked */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-white/[0.04] bg-[#0c0c10] p-4 shadow-lg hover:border-white/[0.08] transition-colors h-full">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Recently Tracked
              </h3>
              <Link href="/watchlist" className="text-xs text-cyan-500 hover:text-cyan-400 font-medium transition-colors">
                View all →
              </Link>
            </div>

            {cves.length === 0 && !loading ? (
              <div className="py-12 text-center">
                <p className="text-sm text-slate-500">No tracked CVEs yet.</p>
                <Link
                  href="/search"
                  className="mt-4 inline-block rounded-lg bg-cyan-500/10 border border-cyan-500/20 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-cyan-400 hover:bg-cyan-500/20 transition-all"
                >
                  Search CVEs to get started
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5 mt-2">
                {cves.slice(0, 6).map((cve) => (
                  <Link
                    key={cve.id}
                    href={`/cve?id=${cve.id}`}
                    className="group flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-white/[0.02]"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-semibold text-slate-300 group-hover:text-cyan-400 transition-colors">{cve.id}</span>
                      <SeverityBadge severity={cve.severity} size="sm" />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-medium text-slate-500">
                        {cve.cvss.score !== null ? `${cve.cvss.score}` : '—'}
                      </span>
                      <svg className="h-4 w-4 text-slate-600 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
