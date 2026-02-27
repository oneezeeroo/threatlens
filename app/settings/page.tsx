'use client';

import { useState, useEffect } from 'react';
import { getSettings, saveSettings, clearAllCache, getCacheCount } from '@/lib/storage';

export default function SettingsPage() {
    const [apiKey, setApiKey] = useState('');
    const [demoMode, setDemoMode] = useState(false);
    const [cacheCount, setCacheCount] = useState(0);
    const [saved, setSaved] = useState(false);
    const [cacheCleared, setCacheCleared] = useState(false);

    useEffect(() => {
        const settings = getSettings();
        setApiKey(settings.apiKey);
        setDemoMode(settings.demoMode);
        setCacheCount(getCacheCount());
    }, []);

    const handleSave = () => {
        saveSettings({ apiKey: apiKey.trim(), demoMode });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleClearCache = () => {
        clearAllCache();
        setCacheCount(0);
        setCacheCleared(true);
        setTimeout(() => setCacheCleared(false), 2000);
    };

    return (
        <div className="mx-auto max-w-2xl space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">Settings</h1>
                <p className="mt-1 text-sm text-slate-400">
                    Configure API access, demo mode, and cache settings.
                </p>
            </div>

            {/* API Key */}
            <section className="rounded-xl border border-white/5 bg-slate-900/40 p-6">
                <h2 className="text-lg font-semibold text-white">NVD API Key</h2>
                <p className="mt-1 text-sm text-slate-400">
                    Without an API key, you are limited to <strong className="text-slate-300">5 requests per 30 seconds</strong>.
                    With an API key, the limit increases to <strong className="text-slate-300">50 requests per 30 seconds</strong>.
                </p>
                <p className="mt-2 text-xs text-slate-500">
                    Request a free API key at{' '}
                    <a
                        href="https://nvd.nist.gov/developers/start-here"
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-cyan-400 hover:text-cyan-300 hover:underline"
                    >
                        nvd.nist.gov/developers/start-here
                    </a>
                </p>

                <div className="mt-4">
                    <label htmlFor="apiKey" className="mb-1.5 block text-xs font-medium text-slate-400">
                        API Key
                    </label>
                    <input
                        id="apiKey"
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Paste your NVD API key here"
                        className="w-full rounded-lg border border-white/10 bg-slate-800/60 px-3 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:border-cyan-500/40 focus:outline-none"
                    />
                </div>
            </section>

            {/* Demo Mode */}
            <section className="rounded-xl border border-white/5 bg-slate-900/40 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-white">Demo Mode</h2>
                        <p className="mt-1 text-sm text-slate-400">
                            Use local mock data instead of the NVD API. Useful for demos or when working offline.
                        </p>
                    </div>
                    <button
                        onClick={() => setDemoMode(!demoMode)}
                        className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors ${demoMode ? 'bg-cyan-500' : 'bg-slate-700'
                            }`}
                        role="switch"
                        aria-checked={demoMode ? "true" : "false"}
                        aria-label="Toggle demo mode"
                    >
                        <span
                            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${demoMode ? 'translate-x-6' : 'translate-x-1'
                                }`}
                        />
                    </button>
                </div>
                {demoMode && (
                    <div className="mt-3 rounded-lg bg-cyan-500/10 px-3 py-2 text-xs text-cyan-400">
                        Demo mode is active — all data is served from local mock dataset.
                    </div>
                )}
            </section>

            {/* Cache */}
            <section className="rounded-xl border border-white/5 bg-slate-900/40 p-6">
                <h2 className="text-lg font-semibold text-white">Cache</h2>
                <p className="mt-1 text-sm text-slate-400">
                    API responses are cached locally for 30 minutes to reduce API calls and improve performance.
                </p>
                <div className="mt-4 flex items-center gap-4">
                    <span className="text-sm text-slate-300">
                        {cacheCount} cached {cacheCount === 1 ? 'entry' : 'entries'}
                    </span>
                    <button
                        onClick={handleClearCache}
                        className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-700"
                    >
                        Clear Cache
                    </button>
                    {cacheCleared && (
                        <span className="text-xs text-green-400">✓ Cache cleared</span>
                    )}
                </div>
            </section>

            {/* Save button */}
            <div className="flex items-center gap-3">
                <button
                    onClick={handleSave}
                    className="rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all hover:shadow-cyan-500/30"
                >
                    Save Settings
                </button>
                {saved && (
                    <span className="text-sm text-green-400">✓ Settings saved</span>
                )}
            </div>

            {/* About */}
            <section className="rounded-xl border border-white/5 bg-slate-900/40 p-6">
                <h2 className="text-lg font-semibold text-white">About ThreatLens</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                    ThreatLens is a CVE Risk Intelligence Dashboard that helps security analysts track, analyze,
                    and report on vulnerabilities. It integrates with the National Vulnerability Database (NVD) API 2.0
                    to provide real-time vulnerability data.
                </p>
                <div className="mt-4 space-y-1.5 text-sm">
                    <p>
                        <span className="text-slate-500">NVD API Docs: </span>
                        <a href="https://nvd.nist.gov/developers/vulnerabilities" target="_blank" rel="noreferrer noopener" className="text-cyan-400 hover:underline">
                            nvd.nist.gov/developers/vulnerabilities
                        </a>
                    </p>
                    <p>
                        <span className="text-slate-500">Rate Limits: </span>
                        <a href="https://nvd.nist.gov/developers/start-here" target="_blank" rel="noreferrer noopener" className="text-cyan-400 hover:underline">
                            nvd.nist.gov/developers/start-here
                        </a>
                    </p>
                </div>
            </section>
        </div>
    );
}
