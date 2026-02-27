'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { NormalizedCVE } from '@/types/cve';
import { searchCVEs, RateLimitError } from '@/lib/nvdClient';
import SearchBar from '@/components/SearchBar';
import CVECard from '@/components/CVECard';
import { SearchResultSkeleton } from '@/components/LoadingSkeleton';
import ErrorState from '@/components/ErrorState';

function SearchContent() {
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get('q') || '';

    const [query, setQuery] = useState(initialQuery);
    const [results, setResults] = useState<NormalizedCVE[]>([]);
    const [totalResults, setTotalResults] = useState(0);
    const [startIndex, setStartIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isRateLimit, setIsRateLimit] = useState(false);
    const [searched, setSearched] = useState(false);

    const doSearch = useCallback(async (q: string, append = false) => {
        const trimmed = q.trim();
        if (!trimmed) return;

        if (append) {
            setLoadingMore(true);
        } else {
            setLoading(true);
            setResults([]);
            setStartIndex(0);
        }
        setError(null);
        setIsRateLimit(false);
        setSearched(true);

        try {
            const nextStart = append ? startIndex + 20 : 0;
            const result = await searchCVEs({
                keywordSearch: trimmed,
                resultsPerPage: 20,
                startIndex: nextStart,
            });

            if (append) {
                setResults((prev) => [...prev, ...result.cves]);
            } else {
                setResults(result.cves);
            }
            setTotalResults(result.totalResults);
            setStartIndex(nextStart);
        } catch (err) {
            if (err instanceof RateLimitError) {
                setIsRateLimit(true);
                setError(err.message);
            } else {
                setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
            }
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [startIndex]);

    // Search on mount if query param provided
    useEffect(() => {
        if (initialQuery) {
            setQuery(initialQuery);
            doSearch(initialQuery);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSearch = (q: string) => {
        setQuery(q);
        doSearch(q);
    };

    const hasMore = results.length < totalResults;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">Search CVEs</h1>
                <p className="mt-1 text-sm text-slate-400">
                    Search by keyword or enter a CVE ID directly (e.g., CVE-2021-44228).
                </p>
            </div>

            {/* Search bar */}
            <SearchBar
                initialValue={query}
                onSearch={handleSearch}
                autoFocus
                placeholder="Type a keyword (e.g., apache, buffer overflow) or CVE ID…"
            />

            {/* Loading state */}
            {loading && <SearchResultSkeleton />}

            {/* Error state */}
            {error && (
                <ErrorState
                    message={error}
                    isRateLimit={isRateLimit}
                    onRetry={() => doSearch(query)}
                />
            )}

            {/* Results */}
            {!loading && !error && results.length > 0 && (
                <div className="space-y-3">
                    <p className="text-sm text-slate-400">
                        Showing {results.length} of {totalResults} results for &ldquo;{query}&rdquo;
                    </p>
                    {results.map((cve) => (
                        <CVECard key={cve.id} cve={cve} />
                    ))}

                    {/* Load More */}
                    {hasMore && (
                        <div className="pt-4 text-center">
                            <button
                                onClick={() => doSearch(query, true)}
                                disabled={loadingMore}
                                className="rounded-lg bg-slate-800 px-6 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-700 disabled:opacity-50"
                            >
                                {loadingMore ? 'Loading…' : 'Load more results'}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* No results */}
            {!loading && !error && searched && results.length === 0 && (
                <div className="py-16 text-center">
                    <p className="text-lg text-slate-500">No results found.</p>
                    <p className="mt-1 text-sm text-slate-600">Try a different keyword or check a specific CVE ID.</p>
                </div>
            )}
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<SearchResultSkeleton />}>
            <SearchContent />
        </Suspense>
    );
}
