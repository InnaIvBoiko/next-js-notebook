// =============================================================================
// app/lessons/database-orm/page.tsx
// SERVER entry for /lessons/database-orm — Module 4 · Lesson 2.
// -----------------------------------------------------------------------------
// 🧠 Top-level Suspense + async wrapper (Cache Components pattern)
//
// Cache Components is strict about prerendering. If the page shell touches a
// non-deterministic API (e.g. `Date.now()` indirectly via `new QueryClient()`,
// which TanStack uses for its internal timestamps) BEFORE accessing any
// uncached or Request data, the build aborts.
//
// The Module 3 · Lesson 3 page solves this by returning a SINGLE top-level
// <Suspense>. Everything dynamic — prefetch, RSC reads, the entire content
// tree — lives inside an async child. The page shell is just the skeleton.
//
// We mirror that pattern here: one Suspense, one async child that
//   1) prefetches /api/notes into a QueryClient,
//   2) dehydrates it into a HydrationBoundary,
//   3) renders IndexView, passing the RSC list (its own nested Suspense),
//      the Server Action form, and the Client list as JSX children.
// =============================================================================

import type { Metadata } from 'next';
import { Suspense } from 'react';
import { connection } from 'next/server';
import {
    HydrationBoundary,
    QueryClient,
    dehydrate,
} from '@tanstack/react-query';
import { listNotesWithTags } from '../../_db/queries';
import ClientNotesList from './_components/client-notes-list';
import IndexView from './_components/index-view';
import NotesForm from './_components/notes-form';
import RscNotesList from './_components/rsc-notes-list';

export const metadata: Metadata = {
    title: 'Database & ORM · Living Notebook',
    description:
        'Module 4 · Lesson 2: Drizzle ORM + PGlite (Postgres in WASM), one DB consumed by an RSC direct read, a Server Action mutation, and the Lesson 1 Route Handlers via TanStack Query.',
};

export default function DatabaseOrmPage() {
    return (
        <Suspense fallback={<LessonSkeleton />}>
            <PageContent />
        </Suspense>
    );
}

async function PageContent() {
    // 🧠 Cache Components escape hatch
    // `connection()` is the documented way to opt a Server Component into
    // request-time rendering. Without it, the strict prerender complains
    // about `Date.now()` being touched inside TanStack's QueryClient
    // constructor BEFORE any Request data is read. Awaiting `connection()`
    // up front declares "this branch is dynamic" and the rest of the work
    // (prefetch, render) runs at request time as intended.
    // 📚 Doc: node_modules/next/dist/docs/01-app/03-api-reference/04-functions/connection.md
    await connection();

    // Ephemeral QueryClient just for prefetch. Different instance from the
    // long-lived one mounted by QueryProvider in the layout — that's by
    // design: dehydrate the data, throw this client away.
    const queryClient = new QueryClient();
    await queryClient.prefetchQuery({
        queryKey: ['notes'],
        queryFn: () => listNotesWithTags(),
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <IndexView
                rscList={
                    <Suspense fallback={<RscListSkeleton />}>
                        <RscNotesList />
                    </Suspense>
                }
                serverActionForm={<NotesForm />}
                clientList={<ClientNotesList />}
            />
        </HydrationBoundary>
    );
}

function LessonSkeleton() {
    return (
        <div className='space-y-4'>
            <div className='h-7 w-32 animate-pulse rounded-full bg-slate-800/60' />
            <div className='h-10 w-2/3 animate-pulse rounded bg-slate-800/60' />
            <div className='h-4 w-full animate-pulse rounded bg-slate-800/40' />
            <div className='h-4 w-5/6 animate-pulse rounded bg-slate-800/40' />
        </div>
    );
}

function RscListSkeleton() {
    return (
        <div className='space-y-2'>
            {[0, 1, 2].map(i => (
                <div
                    key={i}
                    className='h-16 animate-pulse rounded-md border border-slate-700/40 bg-slate-900/40'
                />
            ))}
        </div>
    );
}
