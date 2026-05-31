// =============================================================================
// app/lessons/advanced-routing/_components/photo-grid.tsx
// Thumbnail grid used by /gallery — clicking a tile triggers SOFT navigation
// to /gallery/photos/[id] which the @modal slot intercepts.
// -----------------------------------------------------------------------------
// 🧠 SERVER COMPONENT — no 'use client'
// Plain server-side render; the <Link> handles the navigation. The intercepting
// route works because the navigation is client-side via <Link>; React Server
// Components, Suspense, and the App Router negotiate the rest.
//
// 🧠 i18n
// The lang prop is passed in from the parent Server Component (page.tsx),
// which reads it from the `nb-lang` cookie via getLessonLang(). We pipe it
// into `localizePhoto` to flatten the Record<Lang, string> fields.
// =============================================================================

import Image from 'next/image';
import Link from 'next/link';
import type { Lang } from '../../../_lib/dictionaries';
import { localizePhoto, photos } from '../_lib/photos';

type Props = {
    lang: Lang;
};

export default function PhotoGrid({ lang }: Props) {
    return (
        <ul className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
            {photos.map((photo) => {
                const localized = localizePhoto(photo, lang);
                return (
                    <li key={photo.id}>
                        {/* Internal Link → SOFT navigation → intercepting route        */}
                        {/* matches via @modal/(..)photos/[id]/page.tsx, NOT the full   */}
                        {/* page. Same href = different UX depending on origin.         */}
                        <Link
                            href={`/lessons/advanced-routing/gallery/photos/${photo.id}`}
                            className='group block overflow-hidden rounded-lg border border-slate-700/60 bg-slate-900/40 transition hover:border-fuchsia-400/60'
                        >
                            <div className='relative aspect-3/2 w-full overflow-hidden'>
                                <Image
                                    src={photo.src}
                                    alt={localized.title}
                                    fill
                                    sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
                                    className='object-cover transition group-hover:scale-[1.02]'
                                />
                            </div>
                            <div className='space-y-1 p-3'>
                                <h3 className='text-sm font-semibold text-slate-100'>
                                    {localized.title}
                                </h3>
                                <p className='line-clamp-2 text-xs leading-relaxed text-slate-400'>
                                    {localized.description}
                                </p>
                            </div>
                        </Link>
                    </li>
                );
            })}
        </ul>
    );
}
