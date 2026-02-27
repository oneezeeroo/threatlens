interface ErrorStateProps {
    message: string;
    onRetry?: () => void;
    isRateLimit?: boolean;
}

export default function ErrorState({ message, onRetry, isRateLimit }: ErrorStateProps) {
    return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-red-500/20 bg-red-500/5 px-6 py-12 text-center">
            {/* Icon */}
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
                <svg className="h-7 w-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
            </div>

            <h3 className="text-lg font-semibold text-red-300">
                {isRateLimit ? 'Rate Limited' : 'Something went wrong'}
            </h3>
            <p className="mt-2 max-w-md text-sm text-slate-400">{message}</p>

            {isRateLimit && (
                <p className="mt-2 text-xs text-slate-500">
                    Tip: Add an API key in{' '}
                    <a href="/settings" className="text-cyan-400 underline hover:text-cyan-300">
                        Settings
                    </a>{' '}
                    for higher limits (50 req/30s).
                </p>
            )}

            {onRetry && (
                <button
                    onClick={onRetry}
                    aria-label="Retry request"
                    className="mt-5 rounded-lg bg-slate-800 px-5 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-700"
                >
                    Try again
                </button>
            )}
        </div>
    );
}
