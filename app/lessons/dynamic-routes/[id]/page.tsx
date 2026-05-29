// =============================================================================
// app/lessons/dynamic-routes/[id]/page.tsx
// SERVER entry for /lessons/dynamic-routes/[id] — the DYNAMIC route itself.
// -----------------------------------------------------------------------------
// 🧠 THIS FILE IS THE LESSON. Four things happen here and each one is a named
// concept of the App Router:
//
//   1. `generateStaticParams` — declares which [id] values to PRERENDER at
//      build time. Returns one object per item; the keys must match the
//      dynamic segment names ([id] → { id }).
//
//   2. `generateMetadata` — runs per (resolved) param, so the <title> in the
//      browser tab matches the specific item. Uses the same Promise-based
//      `params` as the page.
//
//   3. `await params` — the breaking change vs Next 14 tutorials. `params` is
//      a Promise in Next 15+. You await it in a Server Component, or call
//      React's `use(params)` in a Client Component.
//
//   4. `notFound()` — when the id is unknown, halt rendering and surface the
//      closest `not-found.tsx` (here, the one right next to this file).
//      Returns HTTP 404, not 200 — important for SEO and caches.
//
// 📚 Doc: node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/dynamic-routes.md
// =============================================================================

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { findItem, items } from '../_lib/items';
import DetailView from '../_components/detail-view';

// -----------------------------------------------------------------------------
// 1) generateStaticParams — prerender ALL items at `next build`.
// -----------------------------------------------------------------------------
// What gets returned here is the COMPLETE set of static [id] values. Next
// generates a static .html for each one. In `next dev` (what you run today)
// this runs every navigation; in `next build` you'll see one log per id, then
// the route is served from disk on subsequent requests.
//
// 💡 Want partial prerender (ISR-style)? Return only a subset here and leave
//    `dynamicParams` at its default (true). Want strict whitelist? Add
//    `export const dynamicParams = false` below.
export async function generateStaticParams(): Promise<{ id: string }[]> {
    console.log(
        '[generateStaticParams] called — producing %d ids',
        items.length,
    );
    return items.map(i => ({ id: i.id }));
}

// -----------------------------------------------------------------------------
// 2) generateMetadata — per-item <title> and description.
// -----------------------------------------------------------------------------
// Note that `params` is also a Promise here. Awaiting it gives us the resolved
// id, which we look up in the data source. For an unknown id we return a
// generic title; the page below will then call `notFound()`.
export async function generateMetadata({
    params,
}: PageProps<'/lessons/dynamic-routes/[id]'>): Promise<Metadata> {
    const { id } = await params;
    const item = findItem(id);
    if (!item) {
        return { title: 'Not found · Dynamic Routes · Living Notebook' };
    }
    // Pick `en` for the document <title> (browser chrome is language-agnostic
    // in this notebook). The page body itself stays multilingual via Context.
    return {
        title: `${item.i18n.en.title} · Dynamic Routes · Living Notebook`,
        description: item.i18n.en.synopsis,
    };
}

// -----------------------------------------------------------------------------
// 3) Page — Server Component; awaits params, decides valid/invalid, renders.
// -----------------------------------------------------------------------------
export default async function DynamicRouteIdPage({
    params,
}: PageProps<'/lessons/dynamic-routes/[id]'>) {
    // 👇 The defining call of Next 15+. Without `await`, `id` would be a
    //    Promise object, not a string. TypeScript will tell you immediately.
    const { id } = await params;

    // Server-side log — appears in the `npm run dev` terminal, ONCE per build
    // when prerendered, every request otherwise. Use this as the proof in the
    // Debugging Lab below.
    console.log('[/dynamic-routes/[id]] rendering id=%s', id);

    const item = findItem(id);

    // 4) Unknown id → render the closest not-found.tsx with a 404 status.
    if (!item) {
        notFound();
    }

    // Hand the resolved item to the Client view. The view reads `lang` from
    // <LangProvider> (mounted in the parent layout) and picks the right
    // translation. We pass the whole item object — Next will serialize what
    // crosses the Server → Client boundary.
    return <DetailView item={item} />;
}
