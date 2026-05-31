// =============================================================================
// app/lessons/advanced-routing/gallery/default.tsx
// Default for the `children` slot of the gallery layout.
// -----------------------------------------------------------------------------
// 🧠 WHY THIS FILE EXISTS
// When the gallery layout sees a HARD navigation to `/gallery/photos/3`,
// React reconciles both slots:
//   • children = matches /gallery/photos/3/page.tsx → full page
//   • modal    = matches @modal/default.tsx → null
// All good.
//
// But on certain edge cases (e.g. browser cold start with a non-matching
// child segment), Next may need a children fallback too. Providing one
// silences the rare "missing default" warning and matches the convention.
// In practice this rarely renders — but the cost of including it is zero.
// =============================================================================

import GalleryPage from './page';

// Reuse the gallery page itself as the children fallback so the user lands
// on the grid even in unexpected edge cases.
export default function GalleryDefault() {
    return <GalleryPage />;
}
