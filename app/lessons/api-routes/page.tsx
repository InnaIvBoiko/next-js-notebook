// =============================================================================
// app/lessons/api-routes/page.tsx
// SERVER entry for /lessons/api-routes — Module 4 · Lesson 1.
// -----------------------------------------------------------------------------
// A thin Server Component that delegates to the Client IndexView. The lesson
// hub itself does no data fetching: every demo lives inside its own client
// island and talks to the Route Handlers over HTTP, which is exactly what we
// want to teach here.
// =============================================================================

import type { Metadata } from 'next';
import IndexView from './_components/index-view';

export const metadata: Metadata = {
    title: 'API Routes · Living Notebook',
    description:
        "Module 4 · Lesson 1: Route Handlers anatomy — verbs, NextRequest, RouteContext, dynamic segments, body parsing, status codes, and `'use cache'` caching with Cache Components.",
};

export default function ApiRoutesPage() {
    return <IndexView />;
}
