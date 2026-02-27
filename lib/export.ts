import { NormalizedCVE } from '@/types/cve';

/**
 * Build CSV string from an array of CVEs.
 */
export function buildCSV(cves: NormalizedCVE[]): string {
    const headers = ['CVE ID', 'Severity', 'CVSS Score', 'CVSS Version', 'Published', 'Last Modified', 'CWE', 'Description'];
    const rows = cves.map((c) => [
        c.id,
        c.severity,
        c.cvss.score !== null ? String(c.cvss.score) : 'N/A',
        c.cvss.version,
        c.published ? new Date(c.published).toLocaleDateString() : 'N/A',
        c.lastModified ? new Date(c.lastModified).toLocaleDateString() : 'N/A',
        c.cwe.join('; ') || 'N/A',
        `"${c.description.replace(/"/g, '""')}"`,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

/**
 * Trigger a file download in the browser.
 */
export function downloadFile(content: string, filename: string, mimeType = 'text/csv'): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Export CVEs as CSV download.
 */
export function exportCSV(cves: NormalizedCVE[]): void {
    const csv = buildCSV(cves);
    const timestamp = new Date().toISOString().slice(0, 10);
    downloadFile(csv, `threatlens-report-${timestamp}.csv`, 'text/csv;charset=utf-8;');
}

/**
 * Build report data for the printable HTML report.
 */
export function buildReportData(cves: NormalizedCVE[]) {
    const severityCounts = { Critical: 0, High: 0, Medium: 0, Low: 0, Unknown: 0 };
    for (const c of cves) {
        severityCounts[c.severity]++;
    }

    const avgScore =
        cves.filter((c) => c.cvss.score !== null).reduce((sum, c) => sum + (c.cvss.score || 0), 0) /
        (cves.filter((c) => c.cvss.score !== null).length || 1);

    return {
        totalCVEs: cves.length,
        severityCounts,
        averageScore: Math.round(avgScore * 10) / 10,
        generatedAt: new Date().toISOString(),
        cves,
    };
}
