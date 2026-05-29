'use client';
// =============================================================================
// app/lessons/loading-and-errors/boom/error.tsx
// SEGMENT-SCOPED Error Boundary fallback for /lessons/loading-and-errors/boom.
// -----------------------------------------------------------------------------
// 🧠 WHY 'use client'
// React Error Boundaries are implemented on top of class lifecycles
// (getDerivedStateFromError, componentDidCatch) and useEffect for logging.
// Both require the Client runtime — hence error.tsx MUST be a Client Component.
// You'll see a build error if you forget the directive.
//
// 🧠 PROP TYPES (Next 16.2)
// - `error`: the thrown Error (with an optional .digest matching server logs).
// - `unstable_retry`: NEW in Next 16.2. Calling it re-fetches and re-renders
//    the boundary's children. Replaces the previous `reset` prop, which is
//    still supported but on the way out — you'll see it in old tutorials.
//
// 🧠 WHY THE PARENT LAYOUT STAYS ALIVE
// error.tsx wraps loading.tsx, not-found.tsx, page.tsx, and any nested layouts
// — but NOT the layout in the SAME segment. So when /boom/page.tsx throws:
//   • /lessons/layout.tsx → still mounted (LangBar + "layout clicks" pill survive)
//   • /boom/page.tsx → replaced by this fallback
//
// (Module 3, Lesson 1 lifted the LangProvider from this lesson's layout up to
// /lessons/layout.tsx — there is no longer a dedicated loading-and-errors
// layout segment; the parent /lessons layout serves directly.)
//
// 📚 Doc: node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/error.md
// =============================================================================

import Link from 'next/link';
import { useEffect } from 'react';
import { content } from '../_lib/content';
// We hard-default to English here. Although the upstream <LangProvider> lives
// above this boundary and would technically be readable, keeping this fallback
// independent of any Context is a defensive pattern: if a future refactor
// moved the provider below an error boundary, this file would still render.

type ErrorWithDigest = Error & { digest?: string };

export default function BoomError({
    error,
    unstable_retry,
}: {
    error: ErrorWithDigest;
    unstable_retry: () => void;
}) {
    // Side-effect: log the error to the console (in production you would send
    // this to Sentry / Datadog / your error tracker). Using error.digest you
    // can correlate the client-side report with the server-side log.
    useEffect(() => {
        console.error('[boom/error.tsx] caught error:', error);
    }, [error]);

    const t = content.en.errorBoundary;

    return (
        <section className='space-y-5 rounded-lg border border-rose-500/30 bg-rose-500/5 p-6'>
            <span className='inline-block rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs font-medium text-rose-300'>
                {t.badge}
            </span>

            <h1 className='text-2xl font-bold tracking-tight text-white sm:text-3xl'>
                {t.title}
            </h1>

            {/* Show the error message in dev. In production Next sanitizes the
                message for Server-thrown errors and gives you the digest only. */}
            <pre className='overflow-x-auto rounded-md border border-rose-500/20 bg-rose-950/40 p-3 font-mono text-xs leading-relaxed text-rose-100'>
                {error.message}
                {error.digest ? `\n\n${t.digestLabel}: ${error.digest}` : ''}
            </pre>

            <div className='flex flex-wrap items-center gap-3'>
                <button
                    type='button'
                    onClick={() => unstable_retry()}
                    className='inline-flex items-center gap-2 rounded-md bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-rose-500/30 transition-colors hover:bg-rose-400'
                >
                    🔁 {t.retryLabel}
                </button>
                <Link
                    href='/lessons/loading-and-errors'
                    className='inline-flex items-center gap-2 rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-slate-600 hover:bg-slate-800'
                >
                    {t.backToIndex}
                </Link>
            </div>

            <p className='text-xs leading-relaxed text-slate-400'>
                {t.retryHint}
            </p>
            <p className='border-t border-rose-500/20 pt-3 text-[11px] leading-relaxed text-slate-500'>
                {t.resetNote}
            </p>
        </section>
    );
}
