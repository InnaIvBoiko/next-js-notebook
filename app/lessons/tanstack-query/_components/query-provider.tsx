'use client';
// =============================================================================
// app/lessons/tanstack-query/_components/query-provider.tsx
// CLIENT provider — wraps the lesson tree with a QueryClient and mounts the
// React Query DevTools floating panel.
// -----------------------------------------------------------------------------
// 🧠 ARCHITECTURE — the App Router pattern straight from TanStack docs
// (https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr)
//
// Two scenarios to handle:
//   1) Running on the SERVER (each request): we must create a FRESH client.
//      Sharing one client across concurrent requests would leak user A's
//      cached data into user B's response.
//   2) Running in the BROWSER: we want ONE client that survives re-renders
//      AND fast-refresh HMR. A new client on every render would discard the
//      cache and refetch everything.
//
// The `isServer` import from `@tanstack/react-query` plus a singleton on
// `browserQueryClient` solves both. `getQueryClient` returns:
//   • server  → new QueryClient every call
//   • browser → the singleton, lazily created the first time
//
// We then create the client OUTSIDE the component body so that React Suspense
// and StrictMode double-renders cannot create multiple clients on the client.
// =============================================================================

import {
    QueryClient,
    QueryClientProvider,
    isServer,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import type { ReactNode } from 'react';

function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                // 60s of "fresh" data — useQuery won't refetch on remount
                // within that window. Tune per query as needed.
                staleTime: 60 * 1000,
                // Retry once on transient errors before surfacing them.
                retry: 1,
            },
        },
    });
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient(): QueryClient {
    if (isServer) {
        // Every server render → new client. No leak between requests.
        return makeQueryClient();
    }
    // Browser: lazily create once, then reuse forever (until full reload).
    if (!browserQueryClient) {
        browserQueryClient = makeQueryClient();
    }
    return browserQueryClient;
}

export function QueryProvider({ children }: { children: ReactNode }) {
    const queryClient = getQueryClient();
    return (
        <QueryClientProvider client={queryClient}>
            {children}
            {/* DevTools render NOTHING in production — they're tree-shaken out.
                The floating "TanStack" badge appears only in dev. */}
            <ReactQueryDevtools initialIsOpen={false} buttonPosition='bottom-right' />
        </QueryClientProvider>
    );
}
