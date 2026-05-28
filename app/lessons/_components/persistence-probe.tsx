'use client';
// ^^^^^^^^^^^
// Client island embedded in the /lessons layout. Counts how many times this
// button has been clicked. Because it lives in the LAYOUT (not in a page),
// its `useState` value survives navigation between any routes under
// /lessons/*. That is the visible proof that the layout did not unmount.

import { useState } from 'react';

export default function PersistenceProbe() {
    const [clicks, setClicks] = useState(0);

    return (
        <button
            type='button'
            onClick={() => setClicks(c => c + 1)}
            title='Click me, then navigate between lesson sub-routes. The value stays.'
            className='inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300 transition-colors hover:border-emerald-400/60 hover:bg-emerald-500/15'
        >
            <span className='inline-block h-1.5 w-1.5 rounded-full bg-emerald-400' />
            layout clicks: {clicks}
        </button>
    );
}
