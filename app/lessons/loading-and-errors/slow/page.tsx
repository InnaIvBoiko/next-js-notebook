// =============================================================================
// app/lessons/loading-and-errors/slow/page.tsx
// SERVER COMPONENT — intentionally slow demo for the loading.tsx fallback.
// -----------------------------------------------------------------------------
// 🧠 WHAT YOU WILL SEE
// 1. You click the demo link from the index.
// 2. ../slow/loading.tsx renders INSTANTLY inside the layout.
// 3. ~1.5s later this page replaces the fallback, with the payload below.
//
// During the wait, the layout chrome above (LangBar, /lessons "layout clicks"
// pill) stays interactive — proof that loading.tsx is scoped to the SEGMENT,
// not to the whole tree.
// =============================================================================

import type { Metadata } from 'next';
import DemoHeader from '../_components/demo-header';
import { delay } from '../_lib/delay';

export const metadata: Metadata = {
    title: 'Slow page · Loading & Errors · Living Notebook',
};

export default async function SlowDemoPage() {
    // 👇 The intentional slowness. In production this would be a DB query or
    //    an external fetch — same Suspense mechanism, real I/O instead of
    //    setTimeout.
    const start = Date.now();
    await delay(1500);
    const elapsedMs = Date.now() - start;

    // Build a fake "server payload" to display once we have unblocked.
    const payload = {
        message: 'Hello from the slow Server Component',
        elapsedMs,
        renderedAt: new Date().toISOString(),
    };

    return (
        <article className='space-y-8'>
            <DemoHeader which='slow' />

            <section className='space-y-3'>
                <pre className='overflow-x-auto rounded-lg border border-sky-500/20 bg-sky-500/5 p-4 font-mono text-xs leading-relaxed text-sky-100'>
                    {JSON.stringify(payload, null, 2)}
                </pre>
            </section>
        </article>
    );
}
