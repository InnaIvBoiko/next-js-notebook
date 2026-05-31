// =============================================================================
// app/lessons/advanced-routing/gallery/@modal/default.tsx
// Fallback for the @modal parallel slot. Returns NULL — meaning "no modal
// to render here".
// -----------------------------------------------------------------------------
// 🧠 WHY THIS FILE IS MANDATORY
// On a HARD navigation to `/gallery/photos/3` (paste URL, refresh), the
// @modal slot has no matching segment (the intercepting route only triggers
// on SOFT navigation). Without this file, Next would 404 the whole route.
// With it, the slot resolves to `null` and the full photo page renders
// as `children` — exactly the UX we want.
//
// Returning `null` is a feature, not a bug. The parallel-slot machinery
// always needs a default; sometimes the default is "nothing".
// =============================================================================

export default function ModalDefault() {
    return null;
}
