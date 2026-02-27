import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import NavBar from '@/components/NavBar';
import Script from 'next/script';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'ThreatLens — CVE Risk Intelligence Dashboard',
  description:
    'A modern cybersecurity dashboard for tracking, analyzing, and reporting CVE vulnerabilities using the NVD API.',
  keywords: ['CVE', 'vulnerability', 'cybersecurity', 'NVD', 'threat intelligence', 'risk assessment'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Restore path after GitHub Pages SPA 404 redirect */}
        <Script id="spa-redirect" strategy="beforeInteractive">{`
          (function() {
            var l = window.location;
            if (l.search[1] === '/') {
              var decoded = l.search.slice(1).split('&').map(function(s) {
                return s.replace(/~and~/g, '&');
              }).join('?');
              history.replaceState(null, null,
                l.pathname.slice(0, -1) + decoded + (l.hash || '')
              );
            }
          })();
        `}</Script>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <NavBar />
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </body>
    </html>
  );
}
