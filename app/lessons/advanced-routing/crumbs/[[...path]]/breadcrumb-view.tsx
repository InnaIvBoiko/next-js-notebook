'use client';
// =============================================================================
// app/lessons/advanced-routing/crumbs/[[...path]]/breadcrumb-view.tsx
// Renders the breadcrumb trail + a parallel view via useSelectedLayoutSegments.
// -----------------------------------------------------------------------------
// 🧠 SERVER `params.path` vs CLIENT `useSelectedLayoutSegments()`
// Both return the same array of path segments under the catch-all. The
// server reads from the request URL during render; the hook reads from
// the App Router's client-side navigation tree (same tree, just exposed
// to React Client components).
//
// Why show both? On soft navigation (e.g. clicking an example link), the
// hook updates IMMEDIATELY without a re-render of the server component
// (the page is cached). The server `path` reflects the last server
// render. On hard navigation (URL paste, refresh), both agree from the
// first frame. Side-by-side they make the soft/hard distinction obvious.
//
// 🧠 i18n
// This component IS a Client Component → it can use the LangProvider's
// `useLang()` hook directly. The catch-all server page only passes the
// already-resolved `serverPath` array, no lang threading needed.
// =============================================================================

import Link from 'next/link';
import { useSelectedLayoutSegments } from 'next/navigation';
import { useLang } from '../../../_components/lang-provider';
import { content } from '../../_lib/content';

type Props = {
    serverPath: string[];
};

export function BreadcrumbView({ serverPath }: Props) {
    const lang = useLang();
    const t = content[lang].subroutes.crumbs;

    // useSelectedLayoutSegments returns the array of segments under the
    // CLOSEST layout. Our layout sits at /crumbs/, so segments here are
    // exactly the path after /crumbs/.
    const clientSegments = useSelectedLayoutSegments();

    // The catch-all dynamic segment itself shows up in the array as the
    // bracketed slug — strip it so we display just the runtime parts.
    const cleanedClientSegments = clientSegments.filter(
        (s) => !s.startsWith('['),
    );

    return (
        <div className='space-y-6'>
            <header className='space-y-2'>
                <span className='inline-block rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-300'>
                    {t.badge}
                </span>
                <h1 className='text-2xl font-bold text-white'>{t.title}</h1>
                <p className='max-w-2xl text-sm leading-relaxed text-slate-400'>
                    {t.description}
                </p>
            </header>

            {/* Quick navigation to test depths */}
            <nav className='flex flex-wrap gap-2'>
                {[
                    '/lessons/advanced-routing/crumbs',
                    '/lessons/advanced-routing/crumbs/dashboards/analytics',
                    '/lessons/advanced-routing/crumbs/products/electronics/laptops/macbook',
                ].map((href) => (
                    <Link
                        key={href}
                        href={href}
                        className='rounded-md border border-cyan-500/40 bg-cyan-500/10 px-3 py-1.5 font-(--font-mono) text-[11px] text-cyan-200 transition hover:bg-cyan-500/20'
                    >
                        {href.replace('/lessons/advanced-routing', '')}
                    </Link>
                ))}
            </nav>

            {/* Breadcrumb rendered from the SERVER `path` array */}
            <section className='space-y-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4'>
                <div className='flex items-center gap-2'>
                    <span className='rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-medium tracking-wide text-amber-300 uppercase'>
                        {t.serverBadge}
                    </span>
                    <span
                        className='text-xs text-slate-400'
                        dangerouslySetInnerHTML={{
                            __html: t.serverFrom.replace(
                                /`([^`]+)`/g,
                                '<code>$1</code>',
                            ),
                        }}
                    />
                </div>
                <BreadcrumbTrail
                    segments={serverPath}
                    accent='amber'
                    emptyLabel={t.emptyState}
                />
            </section>

            {/* Same breadcrumb rendered from the CLIENT hook */}
            <section className='space-y-3 rounded-lg border border-violet-500/30 bg-violet-500/5 p-4'>
                <div className='flex items-center gap-2'>
                    <span className='rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] font-medium tracking-wide text-violet-300 uppercase'>
                        {t.clientBadge}
                    </span>
                    <span
                        className='text-xs text-slate-400'
                        dangerouslySetInnerHTML={{
                            __html: t.clientFrom.replace(
                                /`([^`]+)`/g,
                                '<code>$1</code>',
                            ),
                        }}
                    />
                </div>
                <BreadcrumbTrail
                    segments={cleanedClientSegments}
                    accent='violet'
                    emptyLabel={t.emptyState}
                />
            </section>
        </div>
    );
}

const accentMap = {
    amber: 'border-amber-500/40 bg-amber-500/15 text-amber-200',
    violet: 'border-violet-500/40 bg-violet-500/15 text-violet-200',
} as const;

function BreadcrumbTrail({
    segments,
    accent,
    emptyLabel,
}: {
    segments: string[];
    accent: keyof typeof accentMap;
    emptyLabel: string;
}) {
    if (segments.length === 0) {
        return (
            <p
                className='text-sm text-slate-500 italic'
                dangerouslySetInnerHTML={{
                    __html: emptyLabel.replace(/`([^`]+)`/g, '<code>$1</code>'),
                }}
            />
        );
    }
    return (
        <ol className='flex flex-wrap items-center gap-1 text-sm'>
            <li className='font-(--font-mono) text-xs text-slate-500'>
                /crumbs
            </li>
            {segments.map((segment, idx) => (
                <li
                    key={`${idx}-${segment}`}
                    className='flex items-center gap-1'
                >
                    <span className='font-(--font-mono) text-xs text-slate-500'>
                        /
                    </span>
                    <span
                        className={`rounded-md border px-2 py-0.5 font-(--font-mono) text-xs ${accentMap[accent]}`}
                    >
                        {segment}
                    </span>
                </li>
            ))}
        </ol>
    );
}
