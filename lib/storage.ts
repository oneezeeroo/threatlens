import { WatchlistItem, AnalystNote, AppSettings, CacheEntry } from '@/types/cve';

const WATCHLIST_KEY = 'threatlens_watchlist';
const NOTES_KEY = 'threatlens_notes';
const SETTINGS_KEY = 'threatlens_settings';
const CACHE_PREFIX = 'threatlens_cache_';
const DEFAULT_TTL = 30 * 60 * 1000; // 30 minutes

// ─── Helpers ───────────────────────────────────────────
function isBrowser(): boolean {
    return typeof window !== 'undefined';
}

function getItem<T>(key: string, fallback: T): T {
    if (!isBrowser()) return fallback;
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return fallback;
        return JSON.parse(raw) as T;
    } catch {
        return fallback;
    }
}

function setItem<T>(key: string, value: T): void {
    if (!isBrowser()) return;
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.warn('localStorage write failed:', e);
    }
}

// ─── Watchlist ─────────────────────────────────────────
export function getWatchlist(): WatchlistItem[] {
    return getItem<WatchlistItem[]>(WATCHLIST_KEY, []);
}

export function addToWatchlist(cveId: string): void {
    const list = getWatchlist();
    if (list.some((w) => w.cveId === cveId)) return;
    list.push({ cveId, addedAt: new Date().toISOString() });
    setItem(WATCHLIST_KEY, list);
}

export function removeFromWatchlist(cveId: string): void {
    const list = getWatchlist().filter((w) => w.cveId !== cveId);
    setItem(WATCHLIST_KEY, list);
}

export function isTracked(cveId: string): boolean {
    return getWatchlist().some((w) => w.cveId === cveId);
}

// ─── Analyst Notes ─────────────────────────────────────
export function getAllNotes(): Record<string, AnalystNote> {
    return getItem<Record<string, AnalystNote>>(NOTES_KEY, {});
}

export function getNote(cveId: string): AnalystNote | null {
    const notes = getAllNotes();
    return notes[cveId] || null;
}

export function saveNote(note: AnalystNote): void {
    const notes = getAllNotes();
    notes[note.cveId] = { ...note, updatedAt: new Date().toISOString() };
    setItem(NOTES_KEY, notes);
}

// ─── Settings ──────────────────────────────────────────
const DEFAULT_SETTINGS: AppSettings = { apiKey: '', demoMode: false };

export function getSettings(): AppSettings {
    return getItem<AppSettings>(SETTINGS_KEY, DEFAULT_SETTINGS);
}

export function saveSettings(settings: AppSettings): void {
    setItem(SETTINGS_KEY, settings);
}

// ─── TTL Cache ─────────────────────────────────────────
export function getCached<T>(key: string): T | null {
    if (!isBrowser()) return null;
    try {
        const raw = localStorage.getItem(CACHE_PREFIX + key);
        if (!raw) return null;
        const entry = JSON.parse(raw) as CacheEntry<T>;
        if (Date.now() - entry.timestamp > entry.ttl) {
            localStorage.removeItem(CACHE_PREFIX + key);
            return null;
        }
        return entry.data;
    } catch {
        return null;
    }
}

export function setCache<T>(key: string, data: T, ttl: number = DEFAULT_TTL): void {
    if (!isBrowser()) return;
    try {
        const entry: CacheEntry<T> = { data, timestamp: Date.now(), ttl };
        localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
    } catch (e) {
        console.warn('Cache write failed:', e);
    }
}

export function clearAllCache(): void {
    if (!isBrowser()) return;
    const toRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(CACHE_PREFIX)) {
            toRemove.push(key);
        }
    }
    toRemove.forEach((k) => localStorage.removeItem(k));
}

export function getCacheCount(): number {
    if (!isBrowser()) return 0;
    let count = 0;
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(CACHE_PREFIX)) count++;
    }
    return count;
}
