'use client';
// =============================================================================
// app/lessons/seo-metadata/_components/meta-inspector.tsx
// Live snapshot of the page's <head> as the BROWSER actually sees it.
// -----------------------------------------------------------------------------
// 🧠 WHY CLIENT
// We could pass these strings down from the Server page, but the didactic
// goal is "this is what the browser parsed". So we read them from
// `document.head` post-hydration. If JS is off, the SSR fallback values
// (passed as props from the server) are shown — keeping the page useful
// even without React on the client.
//
// 🧠 useSyncExternalStore vs useEffect + setState
// The "obvious" pattern would be `useEffect(() => setSnap(readSnapshot()))`.
// That works, but it cascades an extra render and triggers the React 19 lint
// rule `react-hooks/set-state-in-effect`. `useSyncExternalStore` is the
// React-idiomatic way to read from an EXTERNAL system (here `document.head`)
// with SSR support: it accepts a server-snapshot fn for the initial HTML and
// a client-snapshot fn for after hydration, swapping them seamlessly.
//
// 🧠 NO SUBSCRIPTION NEEDED
// Next's metadata API writes `document.head` once at SSR and never mutates
// it during this page's lifetime. We pass a `noopSubscribe` returning a
// noop cleanup; React calls our snapshot getter once and reuses the cached
// reference.
//
// 🧠 MODULE-LEVEL CACHE
// `useSyncExternalStore` compares snapshots with `Object.is`. If our getter
// returned a freshly built object on every render, React would see "the
// store changed" forever and loop. We read `document.head` ONCE, stash the
// resulting object in `cachedClientSnapshot`, and return the same reference
// from every subsequent call.
// =============================================================================

import { useSyncExternalStore } from 'react';
import { useLang } from '../../_components/lang-provider';
import { content } from '../_lib/content';

type Props = {
    title: string;
    description: string;
    canonical: string;
};

type Snapshot = {
    title: string;
    description: string;
    ogTitle: string;
    ogImage: string;
    canonical: string;
    jsonLdType: string;
};

// -----------------------------------------------------------------------------
// Client-side: read document.head ONCE, cache forever.
// -----------------------------------------------------------------------------
let cachedClientSnapshot: Snapshot | null = null;

function readClientSnapshot(): Snapshot {
    const get = (sel: string, attr = 'content') =>
        document.head.querySelector(sel)?.getAttribute(attr) ?? '';

    let jsonLdType = '';
    const ld = document.head.querySelector(
        'script[type="application/ld+json"]',
    );
    if (ld?.textContent) {
        try {
            const parsed = JSON.parse(ld.textContent) as { '@type'?: string };
            jsonLdType = parsed['@type'] ?? '';
        } catch {
            /* malformed — leave blank */
        }
    }

    return {
        title: document.title,
        description: get('meta[name="description"]'),
        ogTitle: get('meta[property="og:title"]'),
        ogImage: get('meta[property="og:image"]'),
        canonical: get('link[rel="canonical"]', 'href'),
        jsonLdType,
    };
}

function getClientSnapshot(): Snapshot {
    if (cachedClientSnapshot === null) {
        cachedClientSnapshot = readClientSnapshot();
    }
    return cachedClientSnapshot;
}

// No-op subscription. The head metadata is set once at SSR and never changes
// for this page's lifetime — there's no event to subscribe to. React stays
// quiet after the first render and we avoid a `MutationObserver`.
function noopSubscribe(): () => void {
    return () => {};
}

// -----------------------------------------------------------------------------
// Row — module-level so its component identity is stable across renders.
// Defining a sub-component inside another component re-creates it on every
// render → React treats every instance as a brand-new type and breaks
// memoisation.
// -----------------------------------------------------------------------------
function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className='space-y-1'>
            <div className='font-(--font-mono) text-[11px] tracking-wide text-slate-500 uppercase'>
                {label}
            </div>
            <div className='overflow-x-auto rounded bg-slate-950/60 p-2 font-(--font-mono) text-[12px] text-emerald-200'>
                {value || <span className='text-slate-600'>(empty)</span>}
            </div>
        </div>
    );
}

export default function MetaInspector({
    title,
    description,
    canonical,
}: Props) {
    const lang = useLang();
    const t = content[lang].labs.metaInspector;

    // SSR snapshot: the values the page already sent us as props. Wrapped in
    // a closure so its IDENTITY changes only when the props change, not on
    // every render — this keeps useSyncExternalStore's Object.is check happy
    // and avoids hydration mismatch warnings.
    const serverSnapshot: Snapshot = {
        title,
        description,
        ogTitle: title,
        ogImage: '',
        canonical,
        jsonLdType: '',
    };
    const getServerSnapshot = () => serverSnapshot;

    const snap = useSyncExternalStore(
        noopSubscribe,
        getClientSnapshot,
        getServerSnapshot,
    );

    return (
        <div className='grid gap-3 lg:grid-cols-2'>
            <Row label={t.titleLabel} value={snap.title} />
            <Row label={t.descriptionLabel} value={snap.description} />
            <Row label={t.ogTitleLabel} value={snap.ogTitle} />
            <Row label={t.ogImageLabel} value={snap.ogImage} />
            <Row label={t.canonicalLabel} value={snap.canonical} />
            <Row
                label={t.jsonLdLabel}
                value={snap.jsonLdType ? `@type: ${snap.jsonLdType}` : ''}
            />
        </div>
    );
}
