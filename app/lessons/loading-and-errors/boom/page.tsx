// =============================================================================
// app/lessons/loading-and-errors/boom/page.tsx
// SERVER entry for the /boom demo.
// -----------------------------------------------------------------------------
// 🧠 ARCHITECTURE
// The Server entry exists to export metadata and to render the multilingual
// <DemoHeader/>. The actual interactive piece is <BoomView/> — a Client
// island that throws on demand.
//
// The error.tsx file sitting next to this page is the Error Boundary that
// catches the throw. We do nothing special here for that: as long as
// error.tsx exists in the segment, Next wraps this page in a boundary.
// =============================================================================

import type { Metadata } from 'next';
import DemoHeader from '../_components/demo-header';
import BoomView from '../_components/boom-view';

export const metadata: Metadata = {
    title: 'Boom · Loading & Errors · Living Notebook',
};

export default function BoomDemoPage() {
    return (
        <article className='space-y-8'>
            <DemoHeader which='boom' />
            <BoomView />
        </article>
    );
}
