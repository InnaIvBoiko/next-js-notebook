// =============================================================================
// app/lessons/action-pending/_lib/store.ts
// Shared in-memory "subscribers" store used by all three demos.
// -----------------------------------------------------------------------------
// 🧠 The same caveat as Lesson 3: in serverless this state may reset between
// requests. For real persistence, use a database (Module 4). The artificial
// `delay()` simulates I/O so pending states and optimistic updates are
// actually visible to the user.
// =============================================================================

let subscribers: string[] = ['Alan Turing', 'Grace Hopper'];

export async function getSubscribers(): Promise<string[]> {
    return [...subscribers];
}

export type AddResult =
    | { ok: true }
    | { ok: false; reason: 'empty' | 'duplicate' };

export function addSubscriber(name: string): AddResult {
    const trimmed = name.trim();
    if (!trimmed) return { ok: false, reason: 'empty' };
    if (subscribers.includes(trimmed)) {
        return { ok: false, reason: 'duplicate' };
    }
    subscribers = [...subscribers, trimmed];
    return { ok: true };
}

export function removeSubscriber(name: string): void {
    subscribers = subscribers.filter(s => s !== name);
}

// Artificial latency so pending/optimistic states are visible. In real apps
// the latency comes from genuine I/O (DB query, API call) — same mechanism.
export function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}
