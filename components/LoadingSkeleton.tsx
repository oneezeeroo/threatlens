export function CardSkeleton() {
    return (
        <div className="animate-pulse rounded-xl border border-white/5 bg-slate-900/60 p-5">
            <div className="h-3 w-24 rounded bg-slate-700/50" />
            <div className="mt-3 h-8 w-16 rounded bg-slate-700/50" />
            <div className="mt-2 h-3 w-32 rounded bg-slate-700/50" />
        </div>
    );
}

export function TableRowSkeleton() {
    return (
        <div className="flex items-center gap-4 border-b border-white/5 px-4 py-3">
            <div className="h-4 w-32 animate-pulse rounded bg-slate-700/50" />
            <div className="h-4 w-16 animate-pulse rounded bg-slate-700/50" />
            <div className="hidden h-4 w-64 animate-pulse rounded bg-slate-700/50 md:block" />
            <div className="ml-auto h-4 w-12 animate-pulse rounded bg-slate-700/50" />
        </div>
    );
}

export function CVEDetailSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="h-8 w-48 rounded bg-slate-700/50" />
            <div className="h-4 w-full rounded bg-slate-700/50" />
            <div className="h-4 w-3/4 rounded bg-slate-700/50" />
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-20 rounded-lg bg-slate-700/50" />
                ))}
            </div>
            <div className="h-32 rounded-lg bg-slate-700/50" />
        </div>
    );
}

export function SearchResultSkeleton() {
    return (
        <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-xl border border-white/5 bg-slate-900/60 p-4">
                    <div className="flex items-center gap-3">
                        <div className="h-5 w-36 rounded bg-slate-700/50" />
                        <div className="h-5 w-16 rounded-full bg-slate-700/50" />
                    </div>
                    <div className="mt-2 h-3 w-full rounded bg-slate-700/50" />
                    <div className="mt-1 h-3 w-2/3 rounded bg-slate-700/50" />
                </div>
            ))}
        </div>
    );
}
