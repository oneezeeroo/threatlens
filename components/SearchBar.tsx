'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef, useCallback } from 'react';
import { looksLikeCveId, normalizeCveId } from '@/lib/validators';

interface SearchBarProps {
    /** Initial value for the input */
    initialValue?: string;
    /** Callback for debounced keyword search */
    onSearch?: (query: string) => void;
    /** Placeholder text */
    placeholder?: string;
    /** Auto-focus on mount */
    autoFocus?: boolean;
    /** Compact mode for navbar */
    compact?: boolean;
}

export default function SearchBar({
    initialValue = '',
    onSearch,
    placeholder = 'Search CVE ID or keyword…',
    autoFocus = false,
    compact = false,
}: SearchBarProps) {
    const [value, setValue] = useState(initialValue);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const router = useRouter();

    // Debounce search callback
    const debouncedSearch = useCallback(
        (query: string) => {
            if (timerRef.current) clearTimeout(timerRef.current);
            timerRef.current = setTimeout(() => {
                onSearch?.(query);
            }, 500);
        },
        [onSearch]
    );

    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value;
        setValue(v);
        if (!compact) {
            debouncedSearch(v);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = value.trim();
        if (!trimmed) return;

        if (looksLikeCveId(trimmed)) {
            router.push(`/cve?id=${normalizeCveId(trimmed)}`);
        } else if (compact) {
            router.push(`/search?q=${encodeURIComponent(trimmed)}`);
        } else {
            onSearch?.(trimmed);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={compact ? 'w-full max-w-xs' : 'w-full'}>
            <div className="relative">
                {/* Search icon */}
                <svg
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>

                <input
                    type="text"
                    value={value}
                    onChange={handleChange}
                    placeholder={placeholder}
                    autoFocus={autoFocus}
                    aria-label="Search CVEs"
                    className={`w-full rounded-lg border border-white/10 bg-slate-800/60 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-500 backdrop-blur-sm transition-all focus:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 ${compact ? 'py-2' : 'py-3'
                        }`}
                />
            </div>
        </form>
    );
}
