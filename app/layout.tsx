import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

// Static metadata exported from a Server Component (layout/page).
// Next.js auto-generates <title>, <meta name="description">, etc.
// 📚 Doc: node_modules/next/dist/docs/01-app/01-getting-started/14-metadata-and-og-images.md
export const metadata: Metadata = {
    title: 'Living Notebook · Impara Next.js costruendolo',
    description:
        'Quaderno interattivo di Next.js 16 + React 19: ogni rotta è una lezione viva con teoria, codice e debugging.',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        // `lang="it"` because Italian is the BASE language of the notebook.
        // The client-side language switcher toggles visible content but does NOT
        // change this attribute — we will do that properly in /advanced-routing
        // with the `app/[lang]/...` pattern.
        <html
            lang='it'
            className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
        >
            <body className='flex min-h-full flex-col bg-slate-950'>
                {children}
            </body>
        </html>
    );
}
