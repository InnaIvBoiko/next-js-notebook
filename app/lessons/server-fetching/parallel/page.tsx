// =============================================================================
// app/lessons/server-fetching/parallel/page.tsx
// SERVER COMPONENT demonstrating sequential vs Promise.all parallel fetching.
// -----------------------------------------------------------------------------
// 🧠 WHAT THIS DEMO PROVES
//
// Two local async functions each sleep ~1s before returning.
//
//   • SEQUENTIAL: `await A; await B;` — A blocks B. Wall-clock ≈ 2s.
//   • PARALLEL:   `A_promise = A(); B_promise = B(); await Promise.all([…])`
//                 — both start immediately, wall-clock ≈ 1s.
//
// We measure both blocks on the server and surface the timings to the UI.
// The whole page render takes ~3s total (sequential block + parallel block).
//
// 📚 Doc: node_modules/next/dist/docs/01-app/01-getting-started/06-fetching-data.md
// =============================================================================

import type { Metadata } from 'next';
import DemoHeader from '../_components/demo-header';
import { getUsers, getPosts, type User, type Post } from '../_lib/local-data';

export const metadata: Metadata = {
    title: 'Parallel fetch · Server Fetching · Living Notebook',
};

async function runSequential() {
    const t0 = Date.now();
    const users = await getUsers();
    const posts = await getPosts();
    return { users, posts, elapsedMs: Date.now() - t0 };
}

async function runParallel() {
    const t0 = Date.now();
    // Kick off BOTH promises before awaiting either. This is the key — the
    // function calls return their promises immediately; the network/IO begins
    // at that point, not at the `await`.
    const usersPromise = getUsers();
    const postsPromise = getPosts();
    const [users, posts] = await Promise.all([usersPromise, postsPromise]);
    return { users, posts, elapsedMs: Date.now() - t0 };
}

export default async function ParallelDemoPage() {
    // Run them serially to time each block independently. In a real page you
    // would NOT do both — pick one strategy per data dependency.
    const seq = await runSequential();
    const par = await runParallel();

    return (
        <article className='space-y-8'>
            <DemoHeader which='parallel' />

            <section className='grid gap-4 sm:grid-cols-2'>
                <TimingCard
                    accent='slate'
                    title='Sequential'
                    elapsedMs={seq.elapsedMs}
                    users={seq.users}
                    posts={seq.posts}
                    code={`const users = await getUsers();   // waits ~1s
const posts = await getPosts();   // waits ANOTHER ~1s
// total: ~2s`}
                />
                <TimingCard
                    accent='violet'
                    title='Parallel (Promise.all)'
                    elapsedMs={par.elapsedMs}
                    users={par.users}
                    posts={par.posts}
                    code={`const usersPromise = getUsers();   // starts
const postsPromise = getPosts();   // starts IMMEDIATELY after
const [users, posts] = await Promise.all([
    usersPromise, postsPromise
]);
// total: ~1s`}
                />
            </section>

            {/* Takeaway box pinned to the actual measured numbers. */}
            <section className='space-y-2 rounded-lg border border-violet-500/20 bg-violet-500/5 p-4'>
                <p className='text-sm font-semibold text-violet-200'>
                    ⏱ Measured difference
                </p>
                <p className='text-xs leading-relaxed text-slate-300'>
                    Sequential block: {seq.elapsedMs}ms · Parallel block:{' '}
                    {par.elapsedMs}ms · saved ≈{' '}
                    {Math.max(0, seq.elapsedMs - par.elapsedMs)}ms.
                </p>
                <p className='text-xs leading-relaxed text-slate-400'>
                    Rule of thumb: independent data → Promise.all. Sequential
                    only when one request depends on the previous one (e.g.{' '}
                    <code>getPlaylists(artist.id)</code> needs{' '}
                    <code>artist.id</code> first).
                </p>
                <p className='text-[11px] leading-relaxed text-slate-500'>
                    ⚠️ Promise.all rejects if ANY promise rejects. For
                    independent failures use Promise.allSettled and inspect
                    each result individually.
                </p>
            </section>
        </article>
    );
}

// -----------------------------------------------------------------------------
function TimingCard({
    title,
    elapsedMs,
    users,
    posts,
    code,
    accent,
}: {
    title: string;
    elapsedMs: number;
    users: User[];
    posts: Post[];
    code: string;
    accent: 'slate' | 'violet';
}) {
    const border =
        accent === 'violet' ? 'border-violet-500/20' : 'border-slate-700/60';
    const bg = accent === 'violet' ? 'bg-violet-500/5' : 'bg-slate-900/40';
    const titleColor =
        accent === 'violet' ? 'text-violet-200' : 'text-slate-200';
    return (
        <div className={`space-y-3 rounded-lg border p-4 ${border} ${bg}`}>
            <div className='flex items-baseline justify-between'>
                <p className={`text-sm font-semibold ${titleColor}`}>{title}</p>
                <span className='font-mono text-xs text-slate-400'>
                    {elapsedMs}ms
                </span>
            </div>
            <pre className='overflow-x-auto rounded border border-slate-800/60 bg-slate-950/60 p-3 font-mono text-[11px] leading-relaxed text-slate-300'>
                {code}
            </pre>
            <div className='grid grid-cols-2 gap-3 text-xs text-slate-300'>
                <div>
                    <p className='mb-1 text-[10px] tracking-wide text-slate-500 uppercase'>
                        users
                    </p>
                    <ul className='space-y-0.5'>
                        {users.map(u => (
                            <li key={u.id} className='truncate'>
                                {u.name}
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <p className='mb-1 text-[10px] tracking-wide text-slate-500 uppercase'>
                        posts
                    </p>
                    <ul className='space-y-0.5'>
                        {posts.slice(0, 3).map(p => (
                            <li key={p.id} className='truncate'>
                                {p.title}
                            </li>
                        ))}
                        <li className='text-[10px] text-slate-500'>
                            …+{posts.length - 3} more
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
