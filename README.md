# ThreatLens — CVE Risk Intelligence Dashboard

A modern, production-quality cybersecurity dashboard for tracking, analyzing, and reporting CVE vulnerabilities. Built with **Next.js 15**, **TypeScript**, and **Tailwind CSS**, integrating the **NVD CVE API 2.0** for real-time vulnerability data.

> ⚠️ This project uses client-side storage (localStorage) for now. Supabase integration for persistent backend storage and authentication will be added in a future phase.

---

## Features

- **Dashboard** — Overview of tracked CVEs with severity breakdown donut chart and stat cards
- **CVE Search** — Debounced keyword search and direct CVE ID lookup with paginated results
- **CVE Details** — Full vulnerability information: description, CVSS metrics, CWE, references, affected CPEs, and a Track/Untrack toggle
- **Analyst Notes** — Per-CVE notes with asset tag (Web App/Server/DB/Endpoint/Network) and environment (Prod/Dev/Test) dropdowns, saved locally
- **Watchlist** — Sortable, filterable table of tracked CVEs with text search and severity filters
- **Export** — CSV download and printable HTML report view with severity distribution visualization
- **Settings** — NVD API key configuration, Demo mode toggle, and cache management
- **Rate-Limit Friendly** — 500ms debounced search, response caching (30-min TTL), retry with exponential backoff on HTTP 429
- **Mock/Demo Mode** — Built-in fallback to local mock data for offline usage and demos

## Screenshots

> _Screenshots coming soon — run the app locally to see the UI._

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 15 (App Router) | Framework & routing |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| Recharts | Severity breakdown chart |
| NVD API 2.0 | CVE vulnerability data |
| localStorage | Client-side persistence |

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Clone the repo
git clone <your-repo-url>
cd threatlens

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

---

## API Configuration

### NVD CVE API 2.0

This app uses the official National Vulnerability Database (NVD) API.

**Base URL:** `https://services.nvd.nist.gov/rest/json/cves/2.0`

**Example queries:**
- By CVE ID: `?cveId=CVE-2021-44228`
- Keyword search: `?keywordSearch=apache&resultsPerPage=20&startIndex=0`
- Date range: `?pubStartDate=2024-01-01T00:00:00.000&pubEndDate=2024-12-31T23:59:59.999`

### Rate Limits

| Tier | Limit |
|------|-------|
| Without API key | 5 requests per 30 seconds |
| With API key | 50 requests per 30 seconds |

To add an API key:
1. Request one at https://nvd.nist.gov/developers/start-here
2. Go to **Settings** in the app
3. Paste your API key and save

The key is sent via the `apiKey` HTTP header on each request.

### Caching

API responses are cached in localStorage with a 30-minute TTL. You can clear the cache from the Settings page.

### NVD Documentation

- NVD Vulnerability APIs: https://nvd.nist.gov/developers/vulnerabilities
- NVD Getting Started (rate limits): https://nvd.nist.gov/developers/start-here

---

## Demo / Mock Mode

To use the app without hitting the NVD API:

1. Go to **Settings** (`/settings`)
2. Toggle **Demo Mode** on
3. The app will serve data from the built-in `data/mockCves.json` file

The mock dataset includes 10 well-known CVEs (Log4Shell, Zerologon, XZ backdoor, etc.)

If the NVD API is unreachable or returns errors, the app automatically falls back to mock data.

---

## Project Structure

```
threatlens/
├── app/
│   ├── layout.tsx            # Root layout (dark theme shell + NavBar)
│   ├── page.tsx              # Dashboard
│   ├── search/page.tsx       # CVE search with results
│   ├── cve/[id]/page.tsx     # CVE detail view
│   ├── watchlist/page.tsx    # Tracked CVEs table
│   ├── report/page.tsx       # Printable report view
│   ├── settings/page.tsx     # API key, demo mode, cache
│   └── globals.css           # Global styles + dark theme
├── components/
│   ├── NavBar.tsx             # Top nav with global search
│   ├── SearchBar.tsx          # Debounced search input
│   ├── CVECard.tsx            # Search result card
│   ├── CVETable.tsx           # Sortable/filterable table
│   ├── SeverityBadge.tsx      # Colored severity pill
│   ├── StatCard.tsx           # Dashboard stat tile
│   ├── LoadingSkeleton.tsx    # Loading skeleton variants
│   ├── ErrorState.tsx         # Error display with retry
│   └── ChartSeverityBreakdown.tsx  # Recharts donut chart
├── lib/
│   ├── nvdClient.ts           # NVD API fetch wrapper
│   ├── nvdParser.ts           # NVD response normalizer
│   ├── severity.ts            # Score → severity mapping
│   ├── storage.ts             # localStorage helpers + TTL cache
│   ├── export.ts              # CSV export + report builder
│   └── validators.ts          # CVE ID validation
├── types/
│   └── cve.ts                 # TypeScript type definitions
└── data/
    └── mockCves.json          # Fallback mock CVE data
```

---

## Key Design Decisions

- **No backend required** — All API calls are made from the client. Server actions can be added later if needed.
- **Graceful degradation** — Missing CVSS scores, CWEs, or CPEs are handled without errors.
- **Security** — External links use `rel="noreferrer noopener"`, text content is sanitized to prevent XSS, and CVE IDs are validated before API calls.
- **Performance** — Debounced search (500ms), TTL caching, and retry with exponential backoff on rate limiting.

---

## License

MIT
