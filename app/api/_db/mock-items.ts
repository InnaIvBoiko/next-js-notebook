// =============================================================================
// app/api/_db/mock-items.ts
// In-memory mock data used by both the Route Handlers (HTTP) and the Server
// Component prefetch (direct function call). The `_db` folder is a private
// folder (underscore prefix) — Next.js does NOT map it to a route.
// -----------------------------------------------------------------------------
// 🧠 Two surfaces, one source of truth
// The same `getItems()` function is callable from:
//   • Route Handlers, which serve it over HTTP for the client
//   • Server Components, which can skip the HTTP roundtrip and call directly
// This is the canonical pattern for Server Component prefetch + client query.
//
// ⚠️ Module-scoped mutable state: this leaks across requests on a single
// Node process. For a real app, replace `MUTABLE_ITEMS` with a database.
// For a teaching mock it's the simplest way to get realistic mutations.
// =============================================================================

export type Item = {
    id: string;
    title: string;
    tag: 'frontend' | 'backend' | 'devops';
    favorite: boolean;
};

// Mutable in-memory store. Toggling favorite via the POST route mutates this
// array directly so subsequent GET requests reflect the change.
const MUTABLE_ITEMS: Item[] = [
    { id: '1', title: 'React Server Components', tag: 'frontend', favorite: false },
    { id: '2', title: 'PostgreSQL window functions', tag: 'backend', favorite: false },
    { id: '3', title: 'Tailwind v4 native cascade layers', tag: 'frontend', favorite: false },
    { id: '4', title: 'GitHub Actions matrix builds', tag: 'devops', favorite: false },
    { id: '5', title: 'Drizzle ORM relational queries', tag: 'backend', favorite: false },
    { id: '6', title: 'TanStack Query v5 selectors', tag: 'frontend', favorite: false },
    { id: '7', title: 'Kubernetes liveness probes', tag: 'devops', favorite: false },
    { id: '8', title: 'Next.js Partial Prerendering', tag: 'frontend', favorite: false },
    { id: '9', title: 'pgvector embeddings', tag: 'backend', favorite: false },
    { id: '10', title: 'Cloudflare Tunnel zero-trust', tag: 'devops', favorite: false },
];

const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

// Default latency makes loading states visible. Override via ?delay= in the
// route handler to simulate slow networks / errors.
export async function getItems(query?: string, delayMs = 700): Promise<Item[]> {
    await sleep(delayMs);
    const q = query?.trim().toLowerCase() ?? '';
    if (q.length === 0) return MUTABLE_ITEMS.slice();
    return MUTABLE_ITEMS.filter(
        i =>
            i.title.toLowerCase().includes(q) ||
            i.tag.toLowerCase().includes(q),
    );
}

export async function toggleFavorite(id: string, delayMs = 500): Promise<Item> {
    await sleep(delayMs);
    // 25% chance the mutation "fails" — used by the lesson to demonstrate the
    // optimistic-update rollback pattern.
    if (Math.random() < 0.25) {
        throw new Error('Simulated server failure');
    }
    const item = MUTABLE_ITEMS.find(i => i.id === id);
    if (!item) {
        throw new Error(`Item ${id} not found`);
    }
    item.favorite = !item.favorite;
    return { ...item };
}
