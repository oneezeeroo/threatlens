'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { NormalizedCVE, AnalystNote, AssetTag, Environment } from '@/types/cve';
import { fetchCVEById, RateLimitError } from '@/lib/nvdClient';
import { isTracked, addToWatchlist, removeFromWatchlist, getNote, saveNote } from '@/lib/storage';
import { SEVERITY_COLORS } from '@/lib/severity';
import SeverityBadge from '@/components/SeverityBadge';
import { CVEDetailSkeleton } from '@/components/LoadingSkeleton';
import ErrorState from '@/components/ErrorState';

const ASSET_TAGS: AssetTag[] = ['Web App', 'Server', 'DB', 'Endpoint', 'Network'];
const ENVIRONMENTS: Environment[] = ['Prod', 'Dev', 'Test'];

export default function CVEDetailPage() {
    const searchParams = useSearchParams();
    const cveId = searchParams.get('id') || '';

    const [cve, setCve] = useState<NormalizedCVE | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isRateLimit, setIsRateLimit] = useState(false);
    const [tracked, setTracked] = useState(false);

    const [noteAsset, setNoteAsset] = useState<AssetTag>('Web App');
    const [noteEnv, setNoteEnv] = useState<Environment>('Prod');
    const [noteText, setNoteText] = useState('');
    const [noteSaved, setNoteSaved] = useState(false);

    const loadCVE = useCallback(async () => {
        if (!cveId) return;
        setLoading(true);
        setError(null);
        setIsRateLimit(false);

        try {
            const result = await fetchCVEById(cveId);
            if (result) {
                setCve(result);
            } else {
                setError(`CVE ${cveId} not found.`);
            }
        } catch (err) {
            if (err instanceof RateLimitError) {
                setIsRateLimit(true);
                setError(err.message);
            } else {
                setError(err instanceof Error ? err.message : 'Failed to load CVE.');
            }
        } finally {
            setLoading(false);
        }
    }, [cveId]);

    useEffect(() => {
        loadCVE();
        if (cveId) {
            setTracked(isTracked(cveId));
            const existingNote = getNote(cveId);
            if (existingNote) {
                setNoteAsset(existingNote.assetTag);
                setNoteEnv(existingNote.environment);
                setNoteText(existingNote.notes);
            }
        }
    }, [cveId, loadCVE]);

    const handleToggleTrack = () => {
        if (tracked) { removeFromWatchlist(cveId); } else { addToWatchlist(cveId); }
        setTracked(!tracked);
    };

    const handleSaveNote = () => {
        const note: AnalystNote = { cveId, assetTag: noteAsset, environment: noteEnv, notes: noteText, updatedAt: new Date().toISOString() };
        saveNote(note);
        setNoteSaved(true);
        setTimeout(() => setNoteSaved(false), 2000);
    };

    if (!cveId) {
        return (
            <div className="py-12 text-center">
                <p className="text-slate-400">No CVE ID provided.</p>
                <Link href="/search" className="mt-4 inline-block text-sm text-cyan-400 hover:text-cyan-300">← Back to Search</Link>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-8 w-48 animate-pulse rounded bg-slate-700/50" />
                <CVEDetailSkeleton />
            </div>
        );
    }

    if (error) return <ErrorState message={error} isRateLimit={isRateLimit} onRetry={loadCVE} />;
    if (!cve) return null;

    const colors = SEVERITY_COLORS[cve.severity];

    return (
        <div className="space-y-8">
            <nav className="flex items-center gap-2 text-sm text-slate-500">
                <Link href="/search" className="hover:text-slate-300">Search</Link>
                <span>/</span>
                <span className="text-slate-300">{cve.id}</span>
            </nav>

            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="font-mono text-2xl font-bold text-white">{cve.id}</h1>
                        <SeverityBadge severity={cve.severity} />
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                        Published: {cve.published ? new Date(cve.published).toLocaleDateString() : 'N/A'} ·
                        Modified: {cve.lastModified ? new Date(cve.lastModified).toLocaleDateString() : 'N/A'}
                    </p>
                </div>
                <button onClick={handleToggleTrack}
                    className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${tracked ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 hover:bg-red-500/15 hover:text-red-400 hover:border-red-500/30' : 'bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20'}`}
                    aria-label={tracked ? 'Remove from watchlist' : 'Add to watchlist'}>
                    {tracked ? (<><svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" fill="#020617" /></svg>Tracking</>) : (<><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>Track</>)}
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <InfoCard label="CVSS Score" value={cve.cvss.score !== null ? String(cve.cvss.score) : 'N/A'} accent={colors.text} />
                <InfoCard label="CVSS Version" value={cve.cvss.version} />
                <InfoCard label="Severity" value={cve.severity} accent={colors.text} />
                <InfoCard label="CWE" value={cve.cwe.length > 0 ? cve.cwe.join(', ') : 'None identified'} />
            </div>

            <section className="rounded-xl border border-white/5 bg-slate-900/40 p-5">
                <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-slate-400">Description</h2>
                <p className="text-sm leading-relaxed text-slate-300">{cve.description}</p>
            </section>

            {cve.cvss.vector && (
                <section className="rounded-xl border border-white/5 bg-slate-900/40 p-5">
                    <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-slate-400">CVSS Vector String</h2>
                    <code className="break-all text-sm text-cyan-400">{cve.cvss.vector}</code>
                </section>
            )}

            {cve.references.length > 0 && (
                <section className="rounded-xl border border-white/5 bg-slate-900/40 p-5">
                    <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-slate-400">References ({cve.references.length})</h2>
                    <ul className="space-y-2">
                        {cve.references.map((ref, i) => (
                            <li key={i} className="flex items-start gap-2">
                                <svg className="mt-0.5 h-4 w-4 shrink-0 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m9.86-2.54a4.5 4.5 0 0 0-1.242-7.244l-4.5-4.5a4.5 4.5 0 0 0-6.364 6.364L5.876 8.04" /></svg>
                                <div>
                                    <a href={ref.url} target="_blank" rel="noreferrer noopener" className="text-sm text-cyan-400 hover:text-cyan-300 hover:underline break-all">{ref.url}</a>
                                    {ref.source && <span className="ml-2 text-xs text-slate-500">({ref.source})</span>}
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {cve.cpes.length > 0 && (
                <section className="rounded-xl border border-white/5 bg-slate-900/40 p-5">
                    <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-slate-400">Affected Products ({cve.cpes.length})</h2>
                    <div className="flex flex-wrap gap-2">
                        {cve.cpes.map((cpe, i) => <span key={i} className="rounded-lg bg-white/5 px-2.5 py-1 font-mono text-xs text-slate-400">{cpe}</span>)}
                    </div>
                </section>
            )}

            <section className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-5">
                <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-purple-400">Analyst Notes</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-slate-400">Asset Tag</label>
                        <select value={noteAsset} onChange={(e) => setNoteAsset(e.target.value as AssetTag)} className="w-full rounded-lg border border-white/10 bg-slate-800/60 px-3 py-2 text-sm text-slate-200 focus:border-purple-500/40 focus:outline-none" aria-label="Asset tag">
                            {ASSET_TAGS.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-slate-400">Environment</label>
                        <select value={noteEnv} onChange={(e) => setNoteEnv(e.target.value as Environment)} className="w-full rounded-lg border border-white/10 bg-slate-800/60 px-3 py-2 text-sm text-slate-200 focus:border-purple-500/40 focus:outline-none" aria-label="Environment">
                            {ENVIRONMENTS.map((e) => <option key={e} value={e}>{e}</option>)}
                        </select>
                    </div>
                </div>
                <div className="mt-4">
                    <label className="mb-1.5 block text-xs font-medium text-slate-400">Notes</label>
                    <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} rows={4} placeholder="Add context: impact assessment, remediation plan, affected systems…" className="w-full rounded-lg border border-white/10 bg-slate-800/60 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:border-purple-500/40 focus:outline-none" aria-label="Analyst notes" />
                </div>
                <div className="mt-3 flex items-center gap-3">
                    <button onClick={handleSaveNote} className="rounded-lg bg-purple-500/15 px-4 py-2 text-sm font-medium text-purple-400 transition-colors hover:bg-purple-500/25">Save Notes</button>
                    {noteSaved && <span className="text-xs text-green-400">✓ Saved</span>}
                </div>
            </section>
        </div>
    );
}

function InfoCard({ label, value, accent }: { label: string; value: string; accent?: string }) {
    return (
        <div className="rounded-xl border border-white/5 bg-slate-900/40 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
            <p className={`mt-1 text-lg font-semibold ${accent || 'text-slate-200'}`}>{value}</p>
        </div>
    );
}
