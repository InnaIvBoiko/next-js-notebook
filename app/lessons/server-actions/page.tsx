// =============================================================================
// app/lessons/server-actions/page.tsx
// SERVER entry for the lesson hub /lessons/server-actions.
// =============================================================================

import type { Metadata } from 'next';
import IndexView from './_components/index-view';

export const metadata: Metadata = {
    title: 'Server Actions · Living Notebook',
    description:
        "Module 2 · Lesson 3: `'use server'`, form action invocation, programmatic invocation, updateTag, mutable cookies().",
};

export default function ServerActionsIndexPage() {
    return <IndexView />;
}
