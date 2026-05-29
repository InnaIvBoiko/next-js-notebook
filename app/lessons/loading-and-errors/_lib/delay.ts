// =============================================================================
// app/lessons/loading-and-errors/_lib/delay.ts
// Tiny async sleep helper — the ONLY purpose of this file is to make the
// streaming and loading demos visibly slow during the lesson.
// -----------------------------------------------------------------------------
// 💡 In production you would NEVER artificially block a Server Component —
//    the slowness in real apps comes from real I/O (database, API, file
//    system). The mechanism shown by `loading.tsx` and `<Suspense>` is the
//    same; only the source of the wait is different.
// =============================================================================

export function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}
