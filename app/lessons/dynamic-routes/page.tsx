// =============================================================================
// app/lessons/dynamic-routes/page.tsx
// SERVER entry for /lessons/dynamic-routes (the list / index page).
// -----------------------------------------------------------------------------
// Stays as Server so we can export `metadata` (Client pages cannot). Hands the
// body off to <IndexView>, the Client island that reads the lang from the
// layout's <LangProvider> Context and renders the lesson prose + item grid.
// =============================================================================

import type { Metadata } from 'next';
import IndexView from './_components/index-view';

export const metadata: Metadata = {
    title: 'Dynamic Routes · Living Notebook',
    description:
        'Module 1 · Lesson 3: how [id] folders match any URL value and reach your code as the params Promise.',
};

export default function DynamicRoutesIndexPage() {
    return <IndexView />;
}
