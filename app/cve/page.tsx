import { Suspense } from 'react';
import CVEDetailPage from './CVEDetailPage';

export default function CVEPage() {
    return (
        <Suspense fallback={
            <div className="space-y-6">
                <div className="h-8 w-48 animate-pulse rounded bg-slate-700/50" />
                <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-800/50" />
                    ))}
                </div>
            </div>
        }>
            <CVEDetailPage />
        </Suspense>
    );
}
