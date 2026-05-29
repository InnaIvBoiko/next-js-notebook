// =============================================================================
// app/lessons/server-fetching/default/page.tsx
// SERVER COMPONENT demonstrating the Next 16 default fetch behavior + the
// per-render memoization React applies to identical fetch calls.
// -----------------------------------------------------------------------------
// 🧠 WHAT THIS DEMO PROVES
//
// 1. The page is an async function. It does `await fetch(...)` directly — no
//    /api route, no useEffect.
//
// 2. We call the same fetch TWICE. React de-duplicates: only ONE network
//    request reaches jsonplaceholder. The second await resolves from the
//    same in-memory Response. You'll see this in:
//      - The npm-run-dev terminal: a single GET log line per page render.
//      - The two elapsed times below: first ~hundreds of ms (real network),
//        second ~0ms (memoization).
//
// 3. Reload the page (Cmd+R). The `fetchedAt` timestamp updates every time.
//    This is the proof that the Next 16 default is UNCACHED — no `'use cache'`
//    was applied so each request re-runs the component.
//
// 📚 Doc: node_modules/next/dist/docs/01-app/01-getting-started/06-fetching-data.md
// =============================================================================

import type { Metadata } from 'next';
import { connection } from 'next/server';
import DemoHeader from '../_components/demo-header';

export const metadata: Metadata = {
    title: 'Default fetch · Server Fetching · Living Notebook',
};

const POSTS_URL = 'https://jsonplaceholder.typicode.com/posts';

type FetchResult = {
    label: string;
    elapsedMs: number;
    count: number;
    sample: { id: number; title: string }[];
};

// Wrapper around fetch so we can measure each call and log it to the server
// console. The URL is IDENTICAL across both invocations — that's the trigger
// for React's per-render memoization.
async function fetchPosts(label: string): Promise<FetchResult> {
    const t0 = Date.now();
    const res = await fetch(POSTS_URL);
    const elapsedMs = Date.now() - t0;
    const data = (await res.json()) as { id: number; title: string }[];
    console.log(
        '[default] fetch %s: %dms, %d posts',
        label,
        elapsedMs,
        data.length,
    );
    return { label, elapsedMs, count: data.length, sample: data.slice(0, 3) };
}

export default async function DefaultDemoPage() {
    // Required by cacheComponents: true. The page reads new Date() and
    // Date.now() (inside fetchPosts), so Next needs an explicit dynamic
    // signal to skip prerendering.
    await connection();

    const fetchedAt = new Date().toISOString();

    // Two identical fetch calls. React's memoization makes these collapse into
    // a single network roundtrip — the second one is satisfied from the cache
    // of the first one's resolved Response. See terminal logs for proof.
    const first = await fetchPosts('A');
    const second = await fetchPosts('B');

    return (
        <article className='space-y-8'>
            <DemoHeader which='default' />

            {/* Endpoint metadata */}
            <section className='rounded-lg border border-slate-800/60 bg-slate-900/40 p-4 font-mono text-xs'>
                <div className='text-slate-500'>External API</div>
                <div className='mt-1 break-all text-sky-300'>{POSTS_URL}</div>
                <div className='mt-3 grid grid-cols-1 gap-1 sm:grid-cols-2'>
                    <div>
                        <span className='text-slate-500'>fetched_at: </span>
                        <span className='text-emerald-300'>{fetchedAt}</span>
                    </div>
                    <div>
                        <span className='text-slate-500'>total received: </span>
                        <span className='text-emerald-300'>
                            {first.count} posts
                        </span>
                    </div>
                </div>
            </section>

            {/* Two fetch results, side by side. */}
            <section className='grid gap-4 sm:grid-cols-2'>
                <ResultCard accent='sky' result={first} />
                <ResultCard accent='emerald' result={second} />
            </section>

            {/* Memoization explanation tied to the actual measured values. */}
            <section className='space-y-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4'>
                <p className='text-sm font-semibold text-emerald-200'>
                    🧠 Memoization at work
                </p>
                <p className='text-xs leading-relaxed text-slate-300'>
                    Look at the two elapsed times above. The first fetch took{' '}
                    <span className='font-mono text-emerald-300'>
                        {first.elapsedMs}ms
                    </span>{' '}
                    (real network). The second fetch — same URL, same render —
                    took{' '}
                    <span className='font-mono text-emerald-300'>
                        {second.elapsedMs}ms
                    </span>
                    . React reused the in-flight Response; no second roundtrip.
                </p>
                <p className='text-xs leading-relaxed text-slate-400'>
                    Reload the page (Cmd+R) and watch{' '}
                    <span className='font-mono'>fetched_at</span> change every
                    time — proof that the Next 16 default is uncached across
                    requests, while still memoized within a request.
                </p>
            </section>
        </article>
    );
}

// -----------------------------------------------------------------------------
// Presentation helper — pure Server Component, no JS shipped.
// -----------------------------------------------------------------------------
function ResultCard({
    result,
    accent,
}: {
    result: FetchResult;
    accent: 'sky' | 'emerald';
}) {
    const border =
        accent === 'sky' ? 'border-sky-500/20' : 'border-emerald-500/20';
    const bg = accent === 'sky' ? 'bg-sky-500/5' : 'bg-emerald-500/5';
    const text = accent === 'sky' ? 'text-sky-200' : 'text-emerald-200';
    return (
        <div className={`space-y-2 rounded-lg border p-4 ${border} ${bg}`}>
            <div className='flex items-baseline justify-between'>
                <p
                    className={`text-xs font-semibold tracking-wide uppercase ${text}`}
                >
                    fetch {result.label}
                </p>
                <span className='font-mono text-xs text-slate-400'>
                    {result.elapsedMs}ms
                </span>
            </div>
            <ul className='space-y-1 text-xs text-slate-300'>
                {result.sample.map(p => (
                    <li key={p.id} className='truncate'>
                        <span className='font-mono text-slate-500'>
                            #{p.id}
                        </span>{' '}
                        {p.title}
                    </li>
                ))}
                <li className='pt-1 text-[10px] text-slate-500'>
                    …+{result.count - result.sample.length} more
                </li>
            </ul>
        </div>
    );
}
