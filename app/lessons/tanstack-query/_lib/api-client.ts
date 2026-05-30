// =============================================================================
// app/lessons/tanstack-query/_lib/api-client.ts
// HTTP wrappers used by client-side useQuery/useMutation. Each function
// returns a typed Promise — TanStack Query handles the rest (caching,
// retries, lifecycle).
// -----------------------------------------------------------------------------
// 🧠 Why relative URLs work in the BROWSER but not on the server
// `fetch('/api/items')` in a browser resolves against `window.location.origin`.
// On the server (Server Components, Route Handlers, prefetch in page.tsx)
// there is no window — Node's `fetch` requires an ABSOLUTE URL.
//
// In this lesson, this module is imported only from 'use client' components,
// so we stay relative. The server-side prefetch in page.tsx skips HTTP and
// calls the data layer directly (see `app/api/_db/mock-items.ts`).
// =============================================================================

import type { Item } from '../../../api/_db/mock-items';

export async function fetchItems(query: string): Promise<Item[]> {
    const url = new URL('/api/items', window.location.origin);
    if (query.length > 0) url.searchParams.set('q', query);
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`fetchItems failed: ${res.status}`);
    const { items } = (await res.json()) as { items: Item[] };
    return items;
}

export async function fetchServerTime(): Promise<{
    now: string;
    unixMs: number;
}> {
    const res = await fetch('/api/server-time');
    if (!res.ok) throw new Error(`fetchServerTime failed: ${res.status}`);
    return res.json();
}

export async function toggleFavoriteRequest(id: string): Promise<Item> {
    const res = await fetch(`/api/items/${id}/favorite`, { method: 'POST' });
    if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `toggleFavorite failed: ${res.status}`);
    }
    const { item } = (await res.json()) as { item: Item };
    return item;
}
