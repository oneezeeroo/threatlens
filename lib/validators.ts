/**
 * Validate a CVE ID string.
 * Format: CVE-YYYY-NNNN (at least 4 digits after year).
 */
const CVE_ID_REGEX = /^CVE-\d{4}-\d{4,}$/i;

export function isValidCveId(input: string): boolean {
    return CVE_ID_REGEX.test(input.trim());
}

/**
 * Normalise user input to uppercase CVE ID (if it looks like one).
 */
export function normalizeCveId(input: string): string {
    return input.trim().toUpperCase();
}

/**
 * Detect whether a search query looks like a CVE ID.
 */
export function looksLikeCveId(query: string): boolean {
    return /^cve-\d{4}-/i.test(query.trim());
}

/**
 * Sanitise text to prevent XSS – strips HTML tags.
 */
export function sanitizeText(text: string): string {
    return text.replace(/<[^>]*>/g, '');
}
