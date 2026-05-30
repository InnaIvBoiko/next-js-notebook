// =============================================================================
// app/lessons/tanstack-query/_lib/query-keys.ts
// CENTRAL REGISTRY of query keys for this lesson.
// -----------------------------------------------------------------------------
// 🧠 Why a key factory matters
// A query key is the cache identity of a query. TanStack Query deduplicates,
// invalidates and refetches by key equality (deep-equals). If you spread
// keys ad-hoc across the codebase you end up with typos, near-duplicates and
// invalidation calls that miss the right queries.
//
// The "tkdodo factory pattern" (Dominik Dorfmeister's industry-standard
// recipe) centralises every key as a const tuple builder. Hierarchical keys
// let you invalidate a whole subtree with one call: invalidating the
// `items` root invalidates all `items/list/<query>` underneath.
// =============================================================================

export const queryKeys = {
    items: {
        // All item queries — use to invalidate everything below.
        all: ['items'] as const,
        // A specific search result, identified by its query string.
        list: (query: string) => ['items', 'list', query] as const,
    },
    serverTime: () => ['server-time'] as const,
} as const;
