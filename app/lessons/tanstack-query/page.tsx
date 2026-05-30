// =============================================================================
// app/lessons/tanstack-query/page.tsx
// SERVER entry for /lessons/tanstack-query — Module 3 · Lesson 3.
// -----------------------------------------------------------------------------
// 🧠 Server-side prefetch for the "Preloaded list" lab (§5 + Lab 4)
// We create an EPHEMERAL QueryClient here (separate from the long-lived one in
// QueryProvider), prefetch the items list, dehydrate the cache, and pipe it
// into the client tree via <HydrationBoundary>. When PreloadedList's
// useQuery({ queryKey: ['items', 'preloaded'] }) mounts on the client, it
// finds the data already in cache → no loading state on first render.
//
// Note: prefetchQuery calls getItems() DIRECTLY (no HTTP). On the server we're
// already in the same process as the data layer; going through fetch() would
// be a wasteful self-call.
//
// 🧠 Cache Components + <Suspense>
// In Next 16's Cache Components mode (Module 2 · Lesson 2), any *uncached*
// data fetch in a Server Component must live inside <Suspense>. Otherwise the
// prerender refuses to compile — it can't ship a static shell if the page's
// root awaits a dynamic call.
//
// We split into two Server Components: the page renders the static shell +
// <Suspense>, and <PrefetchedContent> does the dynamic prefetch. The page can
// now be prerendered (partial prerendering), and the prefetched data streams
// in on demand. The lesson copy at §5 explains why this matters.
// =============================================================================

import type { Metadata } from 'next';
import { Suspense } from 'react';
import {
    HydrationBoundary,
    QueryClient,
    dehydrate,
} from '@tanstack/react-query';
import { getItems } from '../../api/_db/mock-items';
import IndexView from './_components/index-view';

export const metadata: Metadata = {
    title: 'TanStack Query · Living Notebook',
    description:
        'Module 3 · Lesson 3: TanStack Query in App Router — useQuery, useMutation with optimistic update, refetchInterval polling and HydrationBoundary prefetch.',
};

export default function TanstackQueryPage() {
    return (
        <Suspense fallback={<LessonSkeleton />}>
            <PrefetchedContent />
        </Suspense>
    );
}

async function PrefetchedContent() {
    const queryClient = new QueryClient();

    await queryClient.prefetchQuery({
        queryKey: ['items', 'preloaded'],
        queryFn: () => getItems(),
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <IndexView />
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
