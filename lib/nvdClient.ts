import { NVDApiResponse, NVDSearchParams, NormalizedCVE } from '@/types/cve';
import { parseNVDResponse } from '@/lib/nvdParser';
import { getCached, setCache, getSettings } from '@/lib/storage';
import mockData from '@/data/mockCves.json';

const BASE_URL = 'https://services.nvd.nist.gov/rest/json/cves/2.0';
const TIMEOUT_MS = 15000;
const MAX_RETRIES = 2;

export interface NVDSearchResult {
    cves: NormalizedCVE[];
    totalResults: number;
    startIndex: number;
    resultsPerPage: number;
}

/**
 * Search NVD CVE API with caching, rate-limit handling, and mock fallback.
 */
export async function searchCVEs(params: NVDSearchParams): Promise<NVDSearchResult> {
    const settings = getSettings();

    // Demo mode → use mock data
    if (settings.demoMode) {
        return getMockResults(params);
    }

    const url = buildUrl(params);
    const cacheKey = url;

    // Check cache first
    const cached = getCached<NVDApiResponse>(cacheKey);
    if (cached) {
        return {
            cves: parseNVDResponse(cached),
            totalResults: cached.totalResults,
            startIndex: cached.startIndex,
            resultsPerPage: cached.resultsPerPage,
        };
    }

    // Fetch from API with retry
    try {
        const data = await fetchWithRetry(url, settings.apiKey);
        setCache(cacheKey, data);
        return {
            cves: parseNVDResponse(data),
            totalResults: data.totalResults,
            startIndex: data.startIndex,
            resultsPerPage: data.resultsPerPage,
        };
    } catch (error) {
        // Fallback to mock on error
        console.warn('NVD API request failed, falling back to mock data:', error);
        const mockResult = getMockResults(params);
        // Re-throw if not a network issue but mark it
        if (error instanceof RateLimitError) {
            throw error;
        }
        if (error instanceof Error && error.message.includes('timeout')) {
            throw error;
        }
        // For other errors, return mock with a warning
        return mockResult;
    }
}

/**
 * Fetch a single CVE by ID.
 */
export async function fetchCVEById(cveId: string): Promise<NormalizedCVE | null> {
    const result = await searchCVEs({ cveId });
    return result.cves[0] || null;
}

// ─── Internal helpers ──────────────────────────────────

function buildUrl(params: NVDSearchParams): string {
    const url = new URL(BASE_URL);
    if (params.cveId) url.searchParams.set('cveId', params.cveId);
    if (params.keywordSearch) url.searchParams.set('keywordSearch', params.keywordSearch);
    if (params.resultsPerPage) url.searchParams.set('resultsPerPage', String(params.resultsPerPage));
    if (params.startIndex !== undefined) url.searchParams.set('startIndex', String(params.startIndex));
    if (params.pubStartDate) url.searchParams.set('pubStartDate', params.pubStartDate);
    if (params.pubEndDate) url.searchParams.set('pubEndDate', params.pubEndDate);
    if (params.lastModStartDate) url.searchParams.set('lastModStartDate', params.lastModStartDate);
    if (params.lastModEndDate) url.searchParams.set('lastModEndDate', params.lastModEndDate);
    return url.toString();
}

export class RateLimitError extends Error {
    constructor() {
        super('Rate limited by NVD API. Please wait or add an API key in Settings.');
        this.name = 'RateLimitError';
    }
}

async function fetchWithRetry(url: string, apiKey?: string, attempt = 0): Promise<NVDApiResponse> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
        const headers: Record<string, string> = {
            'Accept': 'application/json',
        };
        if (apiKey) {
            headers['apiKey'] = apiKey;
        }

        const response = await fetch(url, {
            headers,
            signal: controller.signal,
        });

        if (response.status === 429) {
            if (attempt < MAX_RETRIES) {
                const backoff = Math.pow(2, attempt + 1) * 1000 + Math.random() * 1000;
                await sleep(backoff);
                return fetchWithRetry(url, apiKey, attempt + 1);
            }
            throw new RateLimitError();
        }

        if (!response.ok) {
            throw new Error(`NVD API error: ${response.status} ${response.statusText}`);
        }

        return (await response.json()) as NVDApiResponse;
    } catch (error) {
        if (error instanceof RateLimitError) throw error;
        if ((error as Error).name === 'AbortError') {
            throw new Error('Request timeout: NVD API did not respond in time.');
        }
        throw error;
    } finally {
        clearTimeout(timer);
    }
}

function sleep(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
}

function getMockResults(params: NVDSearchParams): NVDSearchResult {
    const parsed = parseNVDResponse(mockData as unknown as NVDApiResponse);

    let filtered = parsed;
    if (params.cveId) {
        filtered = parsed.filter((c) => c.id.toLowerCase() === params.cveId!.toLowerCase());
    } else if (params.keywordSearch) {
        const kw = params.keywordSearch.toLowerCase();
        filtered = parsed.filter(
            (c) =>
                c.id.toLowerCase().includes(kw) ||
                c.description.toLowerCase().includes(kw)
        );
    }

    const start = params.startIndex || 0;
    const perPage = params.resultsPerPage || 20;
    const page = filtered.slice(start, start + perPage);

    return {
        cves: page,
        totalResults: filtered.length,
        startIndex: start,
        resultsPerPage: perPage,
    };
}
