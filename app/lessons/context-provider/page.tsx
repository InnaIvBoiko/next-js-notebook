// =============================================================================
// app/lessons/context-provider/page.tsx
// SERVER entry for /lessons/context-provider — Module 3 · Lesson 1.
// The page itself is a Server Component (no 'use client'): it ships zero JS
// for the route shell. All interactivity lives inside <IndexView />, which
// is a Client island.
// =============================================================================

import type { Metadata } from 'next';
import IndexView from './_components/index-view';

export const metadata: Metadata = {
    title: 'Context Provider · Living Notebook',
    description:
        'Module 3 · Lesson 1: React Context in the App Router — provider placement, split contexts for state vs setter, and sessionStorage persistence.',
};

export default function ContextProviderPage() {
    return <IndexView />;
}
