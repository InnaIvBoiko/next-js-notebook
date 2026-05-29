// =============================================================================
// app/lessons/action-pending/use-optimistic/page.tsx
// SERVER entry: reads the subscribers list, hands it to the Client
// OptimisticView which owns useOptimistic.
// =============================================================================

import { Suspense } from 'react';
import type { Metadata } from 'next';
import DemoHeader from '../_components/demo-header';
import { getSubscribers } from '../_lib/store';
import OptimisticView from './_components/optimistic-view';

export const metadata: Metadata = {
    title: 'useOptimistic · Pending UI · Living Notebook',
};

async function OptimisticSection() {
    const subscribers = await getSubscribers();
    return <OptimisticView subscribers={subscribers} />;
}

function OptimisticSkeleton() {
    return (
        <div className='space-y-6'>
            <div className='flex gap-2'>
                <div className='h-10 flex-1 animate-pulse rounded bg-slate-800' />
                <div className='h-10 w-24 animate-pulse rounded bg-slate-800' />
            </div>
            <div className='space-y-2 rounded-lg border border-slate-800/60 bg-slate-900/40 p-3'>
                {[0, 1].map(i => (
                    <div
                        key={i}
                        className='h-4 w-3/4 animate-pulse rounded bg-slate-800'
                    />
                ))}
            </div>
        </div>
    );
}

export default function UseOptimisticDemoPage() {
    return (
        <article className='space-y-8'>
            <DemoHeader which='optimistic' />
            <Suspense fallback={<OptimisticSkeleton />}>
                <OptimisticSection />
            </Suspense>
        </article>
    );
}
