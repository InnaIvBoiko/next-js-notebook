// =============================================================================
// app/lessons/caching/page.tsx
// SERVER entry for the lesson hub /lessons/caching.
// =============================================================================

import type { Metadata } from 'next';
import IndexView from './_components/index-view';

export const metadata: Metadata = {
    title: 'Caching · Living Notebook',
    description:
        "Module 2 · Lesson 2: Cache Components, `'use cache'` directive, cacheLife profiles, React.cache() per-request memoization.",
};

export default function CachingIndexPage() {
    return <IndexView />;
}
