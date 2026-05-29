// =============================================================================
// app/lessons/loading-and-errors/page.tsx
// SERVER entry for the lesson hub /lessons/loading-and-errors.
// -----------------------------------------------------------------------------
// Stays Server so we can export `metadata` (Client pages cannot). Hands the
// body off to <IndexView>, the Client island that reads the lang from the
// layout's <LangProvider> and renders the prose + the three demo links.
// =============================================================================

import type { Metadata } from 'next';
import IndexView from './_components/index-view';

export const metadata: Metadata = {
    title: 'Loading & Errors · Living Notebook',
    description:
        'Module 1 · Lesson 4: loading.tsx, manual <Suspense>, error.tsx + unstable_retry (Next 16.2).',
};

export default function LoadingAndErrorsIndexPage() {
    return <IndexView />;
}
