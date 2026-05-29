// =============================================================================
// app/lessons/routing-basics/page.tsx
// LESSON: Routing Basics & Layouts — multilingual server entry
// -----------------------------------------------------------------------------
// Server entry: keeps `metadata` (Client pages cannot export it) and hands
// the body off to <MainView>, a Client island that reads the lang from the
// layout's <LangProvider> Context.
// =============================================================================

import type { Metadata } from 'next';
import MainView from './_components/main-view';

export const metadata: Metadata = {
    title: 'Routing Basics · Living Notebook',
    description:
        'Module 1 · Lesson 2: how folders in app/ become URLs, and why layouts do not unmount.',
};

export default function RoutingBasicsPage() {
    return <MainView />;
}
