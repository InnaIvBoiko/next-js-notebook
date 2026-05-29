// =============================================================================
// app/lessons/server-actions/_lib/store.ts
// In-memory items "database" used by /form and /revalidate demos.
// -----------------------------------------------------------------------------
// 🧠 WHY IN-MEMORY (and not a real DB)?
//
// This lesson teaches the Server Action mechanic itself — not data persistence
// (that's Module 4). A module-level array is the cleanest possible store: the
// student can see exactly what mutates and when.
//
// ⚠️  PRODUCTION CAVEAT
// In serverless (Vercel), each function instance gets its own copy of this
// module. State will appear to "jump" between values as you hit different
// instances. For real persistence use a database — Module 4 (database-orm).
// =============================================================================

import { cacheLife, cacheTag } from 'next/cache';

let items: string[] = ['Ada Lovelace', 'Alan Turing', 'Grace Hopper'];

// -----------------------------------------------------------------------------
// READS
// -----------------------------------------------------------------------------

// Uncached read: always reflects the current array. Used by /form (where we
// want immediate visibility) and by the "uncached" side of /revalidate.
export async function getItemsUncached(): Promise<string[]> {
    return [...items];
}

// Cached read: tagged with 'items'. Used by the "cached" side of /revalidate
// to show what stale data looks like before invalidation. cacheLife('hours')
// is generous so the demo isn't disturbed by automatic revalidation — the
// only way the cache invalidates here is via updateTag('items') from a
// Server Action.
export async function getItemsCached(): Promise<string[]> {
    'use cache';
    cacheLife('hours');
    cacheTag('items');
    console.log('[store] getItemsCached() executed — cache MISS');
    return [...items];
}

// -----------------------------------------------------------------------------
// WRITES
// -----------------------------------------------------------------------------

export function addItem(name: string): void {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (items.includes(trimmed)) return;
    items = [...items, trimmed];
}

export function removeItem(name: string): void {
    items = items.filter(i => i !== name);
}
