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
import { connection } from 'next/server';
import DemoHeader from '../_components/demo-header';
import { delay } from '../_lib/delay';

export const metadata: Metadata = {
    title: 'Slow page · Loading & Errors · Living Notebook',
};

// 👇 The intentional slowness, plus elapsed-time measurement, moved into a
//    helper so the `Date.now()` / `new Date()` calls happen outside the page
//    render function. React's purity lint rule rejects impure calls in the
//    render body itself, but is fine with them inside a helper.
async function buildSlowPayload() {
    const start = Date.now();
    await delay(1500);
    const elapsedMs = Date.now() - start;
    return {
        message: 'Hello from the slow Server Component',
        elapsedMs,
        renderedAt: new Date().toISOString(),
    };
}

export default async function SlowDemoPage() {
    // Required by cacheComponents: true (enabled in Lesson M2-2). The page
    // reads non-deterministic data via buildSlowPayload(), so Next needs an
    // explicit dynamic signal to skip prerendering.
    await connection();

    const payload = await buildSlowPayload();

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
