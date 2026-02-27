import {
    NVDApiResponse,
    NVDCve,
    NormalizedCVE,
    CVSSInfo,
    CVEReference,
} from '@/types/cve';
import { scoreToSeverity } from '@/lib/severity';
import { sanitizeText } from '@/lib/validators';

/**
 * Parse the full NVD API response to a list of NormalizedCVE.
 */
export function parseNVDResponse(raw: NVDApiResponse): NormalizedCVE[] {
    if (!raw?.vulnerabilities) return [];
    return raw.vulnerabilities
        .map((v) => parseCVE(v.cve))
        .filter((c): c is NormalizedCVE => c !== null);
}

/**
 * Parse a single NVD CVE object into NormalizedCVE.
 */
function parseCVE(cve: NVDCve): NormalizedCVE | null {
    if (!cve?.id) return null;

    const description = extractDescription(cve);
    const cvss = extractCVSS(cve);
    const severity = scoreToSeverity(cvss.score);
    const cwe = extractCWE(cve);
    const references = extractReferences(cve);
    const cpes = extractCPEs(cve);

    return {
        id: cve.id,
        description: sanitizeText(description),
        published: cve.published || null,
        lastModified: cve.lastModified || null,
        cvss,
        severity,
        cwe,
        references,
        cpes,
    };
}

function extractDescription(cve: NVDCve): string {
    if (!cve.descriptions?.length) return 'No description available.';
    const en = cve.descriptions.find((d) => d.lang === 'en');
    return en?.value || cve.descriptions[0]?.value || 'No description available.';
}

function extractCVSS(cve: NVDCve): CVSSInfo {
    const metrics = cve.metrics;
    if (!metrics) return { version: 'N/A', score: null, vector: null };

    // Prefer v4.0 → v3.1 → v3.0 → v2
    if (metrics.cvssMetricV40?.length) {
        const m = metrics.cvssMetricV40[0].cvssData;
        return { version: m.version, score: m.baseScore, vector: m.vectorString };
    }
    if (metrics.cvssMetricV31?.length) {
        const m = metrics.cvssMetricV31[0].cvssData;
        return { version: m.version, score: m.baseScore, vector: m.vectorString };
    }
    if (metrics.cvssMetricV30?.length) {
        const m = metrics.cvssMetricV30[0].cvssData;
        return { version: m.version, score: m.baseScore, vector: m.vectorString };
    }
    if (metrics.cvssMetricV2?.length) {
        const m = metrics.cvssMetricV2[0].cvssData;
        return { version: m.version, score: m.baseScore, vector: m.vectorString };
    }

    return { version: 'N/A', score: null, vector: null };
}

function extractCWE(cve: NVDCve): string[] {
    if (!cve.weaknesses?.length) return [];
    const cwes: string[] = [];
    for (const w of cve.weaknesses) {
        for (const d of w.description) {
            if (d.value && d.value !== 'NVD-CWE-noinfo' && d.value !== 'NVD-CWE-Other') {
                cwes.push(d.value);
            }
        }
    }
    return [...new Set(cwes)];
}

function extractReferences(cve: NVDCve): CVEReference[] {
    if (!cve.references?.length) return [];
    return cve.references.map((r) => ({
        url: r.url,
        source: r.source,
    }));
}

function extractCPEs(cve: NVDCve): string[] {
    if (!cve.configurations?.length) return [];
    const cpes: string[] = [];
    for (const config of cve.configurations) {
        if (!config.nodes) continue;
        for (const node of config.nodes) {
            if (!node.cpeMatch) continue;
            for (const match of node.cpeMatch) {
                if (match.criteria) {
                    // Shorten CPE for display: take product:version part
                    const parts = match.criteria.split(':');
                    if (parts.length >= 5) {
                        cpes.push(`${parts[3]}:${parts[4]}:${parts[5] || '*'}`);
                    } else {
                        cpes.push(match.criteria);
                    }
                }
            }
        }
    }
    return [...new Set(cpes)].slice(0, 20); // Cap at 20
}
