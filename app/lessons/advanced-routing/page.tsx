// =============================================================================
// app/lessons/advanced-routing/page.tsx
// SERVER entry for /lessons/advanced-routing — Module 5 · Lesson 4.
// -----------------------------------------------------------------------------
// 🧠 STATIC HUB
// This page is the lesson "home": theory + decision table + three lab cards
// that link out to the actual sub-routes (/dashboard, /gallery, /crumbs/…).
// No request-time data here → Cache Components prerenders it.
//
// 🧠 THE LABS LIVE IN REAL ROUTES, NOT EMBEDDED
// Unlike previous lessons where labs were Client components passed as slots,
// here the labs ARE actual route segments — that's the only way to prove
// the parallel/intercepting machinery actually works (which depends on
// real navigation). So this page just links out.
// =============================================================================

import type { Metadata } from 'next';
import IndexView from './_components/index-view';

export const metadata: Metadata = {
    title: 'Advanced Routing · Living Notebook',
    description:
        'Module 5 · Lesson 4: route groups, private folders, parallel routes with @analytics + @team slots, intercepting routes for the modal-from-link pattern, catch-all routes, useSelectedLayoutSegment for active links.',
};

export default function AdvancedRoutingPage() {
    return <IndexView />;
}
