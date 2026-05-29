// =============================================================================
// app/lessons/zustand-store/page.tsx
// SERVER entry for /lessons/zustand-store — Module 3 · Lesson 2.
// =============================================================================

import type { Metadata } from 'next';
import IndexView from './_components/index-view';

export const metadata: Metadata = {
    title: 'Zustand Store · Living Notebook',
    description:
        'Module 3 · Lesson 2: Zustand selectors, module-scoped vs factory+provider in the App Router, persist + devtools middleware.',
};

export default function ZustandStorePage() {
    return <IndexView />;
}
