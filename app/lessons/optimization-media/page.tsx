// =============================================================================
// app/lessons/optimization-media/page.tsx
// SERVER entry for /lessons/optimization-media — Module 5 · Lesson 1.
// -----------------------------------------------------------------------------
// 🧠 STATIC-FRIENDLY PAGE
// Unlike previous lessons (middleware-logic, auth-setup, database-orm) this
// page reads NO request data: no cookies(), no headers(), no searchParams.
// So under Cache Components it can stay STATIC — fully prerendered at build
// time. The only "dynamic" piece is the language switch handled by the
// LangProvider mounted in the parent layout (which IS wrapped in <Suspense>
// to satisfy Cache Components — see app/lessons/layout.tsx).
//
// 🧠 METADATA
// Per-route metadata via the `Metadata` export overrides the root layout's
// title template. Same pattern used in every other lesson.
// 📚 Doc: node_modules/next/dist/docs/01-app/01-getting-started/14-metadata-and-og-images.md
// =============================================================================

import type { Metadata } from 'next';
import IndexView from './_components/index-view';
import ImageSourceDemo from './_components/image-source-demo';
import ImageLayoutDemo from './_components/image-layout-demo';
import FontDemo from './_components/font-demo';

export const metadata: Metadata = {
    title: 'Images & Fonts · Living Notebook',
    description:
        "Module 5 · Lesson 1: next/image optimization pipeline (3 sources × 2 layouts) and next/font self-hosted Sans + Mono via CSS variables, scoped to this lesson's layout.",
};

export default function OptimizationMediaPage() {
    // Demos are pre-resolved on the server (they are pure RSCs — no client
    // logic, no state) and passed as ReactNode slots to the Client
    // <IndexView>. This keeps the language-aware text in a Client island
    // while the heavy media stays on the server tree.
    return (
        <IndexView
            sourceDemo={<ImageSourceDemo />}
            layoutDemo={<ImageLayoutDemo />}
            fontDemo={<FontDemo />}
        />
    );
}
