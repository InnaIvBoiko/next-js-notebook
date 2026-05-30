// =============================================================================
// app/lessons/layout.tsx — SHARED LAYOUT for the whole /lessons/* subtree
// -----------------------------------------------------------------------------
// 🧠 ARCHITECTURE
// A `layout.tsx` file defines UI that wraps EVERY route segment below its
// folder. The critical property of an App Router layout is:
//
//   👉 On navigation between sibling routes, the layout component instance
//      is NOT unmounted. Its React tree (state, scroll position, open
//      portals, mounted client islands) is preserved. Only the `children`
//      slot is swapped.
//
// 🧠 SUSPENSE WRAP — required by Cache Components
// The lessons layout reads the `nb-lang` cookie via `cookies()` so it can
// pass `initialLang` to the LangProvider. `cookies()` is uncached/request-time
// data, and under Cache Components it MUST live inside <Suspense> (or be
// moved into a page). We use a thin async child `<LangScope>` that does the
// cookie read + provider mounting, wrapped in a top-level <Suspense>. Each
// downstream lesson page keeps its own Suspense for its own dynamic content.
//
// 📚 Doc: node_modules/next/dist/docs/01-app/01-getting-started/08-caching.md
// 📚 Doc: node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md
// =============================================================================

import { Suspense, type ReactNode } from 'react';
import { cookies } from 'next/headers';
import type { Lang } from '../_lib/dictionaries';
import { LangProvider } from './_components/lang-provider';

export default function LessonsLayout({ children }: LayoutProps<'/lessons'>) {
    return (
        <Suspense fallback={<LayoutSkeleton />}>
            <LangScope>{children}</LangScope>
        </Suspense>
    );
}

// Async Server Component — reads the `nb-lang` cookie (written by proxy.ts
// on first visit, by LangBar on user switch) and seeds the LangProvider.
// Living inside <Suspense> satisfies Cache Components' rule that uncached
// data access must be behind a boundary.
async function LangScope({ children }: { children: ReactNode }) {
    const cookieStore = await cookies();
    const rawLang = cookieStore.get('nb-lang')?.value;
    const initialLang: Lang =
        rawLang === 'en' || rawLang === 'uk' ? rawLang : 'it';

    return (
        <LangProvider initialLang={initialLang}>
            <Shell>{children}</Shell>
        </LangProvider>
    );
}

// The static visual shell — header + main. Doesn't read any request data;
// it's just JSX, so it gets prerendered when the parent skeleton resolves.
function Shell({ children }: { children: ReactNode }) {
    // Avoid pulling Link/LangBar/PersistenceProbe imports unless we render
    // the real shell (we always do here, but it keeps the contract clean).
    return <ShellInner>{children}</ShellInner>;
}

function ShellInner({ children }: { children: ReactNode }) {
    return (
        <div className='min-h-full bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100'>
            <Header />
            <main className='mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12'>
                {children}
            </main>
        </div>
    );
}

// Header is its own function so the imports stay grouped near it.
function Header() {
    return (
        <header className='sticky top-0 z-10 border-b border-slate-800/60 bg-slate-950/70 backdrop-blur'>
            <div className='mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6'>
                <div className='flex items-center gap-3'>
                    <HomeLink />
                    <span className='font-mono text-xs text-sky-400'>
                        /lessons
                    </span>
                    <span className='hidden text-xs text-slate-500 sm:inline'>
                        laboratorio interattivo
                    </span>
                </div>
                <div className='flex items-center gap-3'>
                    <LangBar />
                    <PersistenceProbe />
                </div>
            </div>
        </header>
    );
}

// Imports kept down here to make it visually obvious which Client islands
// live in the header.
import Link from 'next/link';
import LangBar from './_components/lang-bar';
import PersistenceProbe from './_components/persistence-probe';

function HomeLink() {
    return (
        <Link
            href='/'
            className='inline-flex items-center gap-1 rounded-md border border-slate-700/60 bg-slate-900/50 px-2.5 py-1 text-xs font-medium text-slate-300 transition-colors hover:border-slate-600 hover:text-slate-100'
        >
            <span aria-hidden>←</span> Home
        </Link>
    );
}

function LayoutSkeleton() {
    return (
        <div className='min-h-full bg-slate-950'>
            <div className='sticky top-0 z-10 h-14 border-b border-slate-800/60 bg-slate-950/70' />
            <div className='mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12'>
                <div className='h-6 w-32 animate-pulse rounded-full bg-slate-800/60' />
            </div>
        </div>
    );
}
