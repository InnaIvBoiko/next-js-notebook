// =============================================================================
// app/lessons/middleware-logic/protected/page.tsx
// SERVER entry for /lessons/middleware-logic/protected — gated by proxy.ts.
// -----------------------------------------------------------------------------
// 🧠 The proxy at root checks for `nb-demo-pass=1` on every request to
// /lessons/middleware-logic/protected*. If the cookie is missing it returns
// a 307 redirect to /lessons/middleware-logic?denied=1, so THIS code only
// ever executes when the cookie IS present.
//
// That's the point of the lab: the gating happens BEFORE this Server
// Component even runs. The page itself has zero auth check.
// =============================================================================

import type { Metadata } from 'next';
import ProtectedView from './_components/protected-view';

export const metadata: Metadata = {
    title: 'Protected Zone · Living Notebook',
};

export default function ProtectedPage() {
    return <ProtectedView />;
}
