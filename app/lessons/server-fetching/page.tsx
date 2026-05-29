// =============================================================================
// app/lessons/server-fetching/page.tsx
// SERVER entry for the lesson hub /lessons/server-fetching.
// -----------------------------------------------------------------------------
// Stays Server so we can export `metadata`. Hands the body off to <IndexView>,
// the Client island that reads the lang from the layout's <LangProvider> and
// renders the prose + the three demo links.
// =============================================================================

import type { Metadata } from 'next';
import IndexView from './_components/index-view';

export const metadata: Metadata = {
    title: 'Server Fetching · Living Notebook',
    description:
        'Module 2 · Lesson 1: async RSCs, the Next 16 uncached default, per-render memoization, sequential vs parallel, cookies()/headers() forcing dynamic.',
};

export default function ServerFetchingIndexPage() {
    return <IndexView />;
}
