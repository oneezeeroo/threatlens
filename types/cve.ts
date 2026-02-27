// Internal CVE model types for ThreatLens

export type SeverityLevel = 'Critical' | 'High' | 'Medium' | 'Low' | 'Unknown';

export interface CVSSInfo {
  version: string;
  score: number | null;
  vector: string | null;
}

export interface CVEReference {
  url: string;
  source?: string;
}

export interface NormalizedCVE {
  id: string;
  description: string;
  published: string | null;
  lastModified: string | null;
  cvss: CVSSInfo;
  severity: SeverityLevel;
  cwe: string[];
  references: CVEReference[];
  cpes: string[];
}

export interface AnalystNote {
  cveId: string;
  assetTag: AssetTag;
  environment: Environment;
  notes: string;
  updatedAt: string;
}

export type AssetTag = 'Web App' | 'Server' | 'DB' | 'Endpoint' | 'Network';
export type Environment = 'Prod' | 'Dev' | 'Test';

export interface WatchlistItem {
  cveId: string;
  addedAt: string;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface AppSettings {
  apiKey: string;
  demoMode: boolean;
}

export interface NVDSearchParams {
  cveId?: string;
  keywordSearch?: string;
  resultsPerPage?: number;
  startIndex?: number;
  pubStartDate?: string;
  pubEndDate?: string;
  lastModStartDate?: string;
  lastModEndDate?: string;
}

// NVD API raw response types (partial, for parsing)
export interface NVDApiResponse {
  resultsPerPage: number;
  startIndex: number;
  totalResults: number;
  vulnerabilities: NVDVulnerability[];
}

export interface NVDVulnerability {
  cve: NVDCve;
}

export interface NVDCve {
  id: string;
  descriptions: { lang: string; value: string }[];
  published?: string;
  lastModified?: string;
  metrics?: NVDMetrics;
  weaknesses?: NVDWeakness[];
  references?: { url: string; source?: string }[];
  configurations?: NVDConfiguration[];
}

export interface NVDMetrics {
  cvssMetricV40?: NVDCvssMetric[];
  cvssMetricV31?: NVDCvssMetric[];
  cvssMetricV30?: NVDCvssMetric[];
  cvssMetricV2?: NVDCvssMetricV2[];
}

export interface NVDCvssMetric {
  cvssData: {
    version: string;
    baseScore: number;
    vectorString: string;
  };
}

export interface NVDCvssMetricV2 {
  cvssData: {
    version: string;
    baseScore: number;
    vectorString: string;
  };
}

export interface NVDWeakness {
  description: { lang: string; value: string }[];
}

export interface NVDConfiguration {
  nodes?: NVDConfigNode[];
}

export interface NVDConfigNode {
  cpeMatch?: { criteria: string }[];
}
