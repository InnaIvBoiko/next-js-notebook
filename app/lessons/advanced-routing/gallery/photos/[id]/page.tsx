// =============================================================================
// app/lessons/advanced-routing/gallery/photos/[id]/page.tsx
// FULL PAGE view of a photo. Rendered on DIRECT URL navigation / refresh /
// hard nav (e.g. user pastes /gallery/photos/3 in a new tab).
// -----------------------------------------------------------------------------
// 🧠 SAME URL, TWO COMPONENTS
// The intercepting route at @modal/(..)photos/[id]/page.tsx shadows THIS file
// during soft navigation from a thumbnail click. When the user does a hard
// navigation, the intercept doesn't run → this file is what they see.
//
// Both files target the SAME route segment (`/photos/[id]`). The split is
// based on navigation origin, not URL.
//
// 🧠 i18n
// Reads `nb-lang` cookie + uses `localizePhoto` to flatten the photo for the
// current language. Same pattern as the modal intercept.
// =============================================================================

import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { content } from '../../../_lib/content';
import { getLessonLang } from '../../../_lib/lang';
import { getPhoto, localizePhoto } from '../../../_lib/photos';

type Props = { params: Promise<{ id: string }> };

export default async function PhotoFullPage({ params }: Props) {
    const [{ id }, lang] = await Promise.all([params, getLessonLang()]);
    const photo = getPhoto(id);
    if (!photo) notFound();

    const localized = localizePhoto(photo, lang);
    const t = content[lang].subroutes.gallery;

    return (
        <article className='space-y-4'>
            <Link
                href='/lessons/advanced-routing/gallery'
                className='inline-block text-sm text-sky-300 hover:text-sky-200'
            >
                {t.backToGallery}
            </Link>

            <div className='space-y-2 rounded-lg border border-slate-700/60 bg-slate-900/40 p-4'>
                <span className='inline-block rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300'>
                    {t.fullPageBadge}
                </span>
                <h1 className='text-2xl font-bold text-white'>
                    {localized.title}
                </h1>
                <p className='text-sm leading-relaxed text-slate-400'>
                    {localized.description}
                </p>
            </div>

            <div className='relative aspect-3/2 w-full overflow-hidden rounded-lg border border-slate-700/60'>
                <Image
                    src={photo.src}
                    alt={localized.title}
                    fill
                    sizes='(max-width: 1024px) 100vw, 1024px'
                    className='object-cover'
                    priority
                />
            </div>
        </article>
    );
}
