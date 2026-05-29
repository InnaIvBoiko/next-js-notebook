// =============================================================================
// app/lessons/action-pending/page.tsx
// SERVER entry for the lesson hub /lessons/action-pending.
// =============================================================================

import type { Metadata } from 'next';
import IndexView from './_components/index-view';

export const metadata: Metadata = {
    title: 'Pending UI · Living Notebook',
    description:
        'Module 2 · Lesson 4: useActionState, useFormStatus, useOptimistic — pending and optimistic UI for Server Actions.',
};

export default function ActionPendingIndexPage() {
    return <IndexView />;
}
