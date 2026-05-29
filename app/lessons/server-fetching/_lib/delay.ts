// =============================================================================
// app/lessons/server-fetching/_lib/delay.ts
// Tiny async sleep helper used by the local-data simulators in /parallel
// and /dynamic. We keep one locally instead of importing from another lesson
// so each lesson stays self-contained.
// =============================================================================

export function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}
