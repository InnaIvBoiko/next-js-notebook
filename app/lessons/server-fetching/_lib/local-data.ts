// =============================================================================
// app/lessons/server-fetching/_lib/local-data.ts
// In-memory "database" simulators for the /parallel and /dynamic demos.
// -----------------------------------------------------------------------------
// 🧠 WHY LOCAL DATA (and not real fetch) for these demos?
//
// The /parallel demo measures sequential vs Promise.all timing. If we used
// a public API the timing would be noisy (network jitter, CDN cache, etc.)
// and the lesson would lose its didactic precision.
//
// The /dynamic demo focuses on cookies()/headers() forcing dynamic rendering.
// The data source there is irrelevant — what matters is reading per-request
// inputs.
//
// The /default demo uses a REAL external fetch (jsonplaceholder) so the
// network tab actually lights up. Two distinct sources by design.
// =============================================================================

import { delay } from './delay';

export type User = { id: number; name: string; role: string };
export type Post = { id: number; userId: number; title: string };

const USERS: User[] = [
    { id: 1, name: 'Ada Lovelace', role: 'Engineer' },
    { id: 2, name: 'Alan Turing', role: 'Cryptographer' },
    { id: 3, name: 'Grace Hopper', role: 'Compiler designer' },
];

const POSTS: Post[] = [
    { id: 101, userId: 1, title: 'On the analytical engine' },
    { id: 102, userId: 2, title: 'Computable numbers' },
    { id: 103, userId: 3, title: 'COBOL and the early compilers' },
    { id: 104, userId: 1, title: 'Algorithms before silicon' },
    { id: 105, userId: 2, title: 'Imitation games revisited' },
];

// Each "fetch" deliberately takes ~1 second so the parallel-vs-sequential
// difference is visible to the naked eye.
const SIM_LATENCY_MS = 1000;

export async function getUsers(): Promise<User[]> {
    console.log('[local-data] getUsers() starting…');
    await delay(SIM_LATENCY_MS);
    console.log('[local-data] getUsers() done');
    return USERS;
}

export async function getPosts(): Promise<Post[]> {
    console.log('[local-data] getPosts() starting…');
    await delay(SIM_LATENCY_MS);
    console.log('[local-data] getPosts() done');
    return POSTS;
}
