// =============================================================================
// app/lessons/advanced-routing/gallery/@modal/(..)photos/[id]/page.tsx
// THE INTERCEPTING ROUTE. Triggers ONLY on soft navigation from within the
// app — typically a <Link> click in the gallery thumbnail grid.
// -----------------------------------------------------------------------------
// 🧠 PATH BREAKDOWN
//   • @modal is a parallel slot of the `gallery/` segment.
//   • (..) is the intercepting matcher — "one segment level UP" from where
//     this folder lives in route-segment space.
//   • Because @modal is a SLOT (not a segment) it's transparent to the
//     matcher; so (..) from @modal/ ends up pointing at `gallery/` — and
//     `photos/[id]` from there is `gallery/photos/[id]`.
//
// On SOFT nav: this page renders → modal overlay over the gallery grid.
// On HARD nav: this file is ignored → the user lands on the full page
//              defined at `gallery/photos/[id]/page.tsx`.
//
// 🧠 SAME DATA, DIFFERENT CHROME
// Both the intercepted modal and the full page read from the same
// `getPhoto(id)` function. The CONTENT is identical; only the framing
// (modal vs full page) differs based on the navigation origin.
//
// 🧠 i18n
// Reads `nb-lang` cookie + uses `localizePhoto` to flatten the photo for the
// current language. The LocalisedModal client wrapper picks the close label.
//
// 📚 Doc: node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/intercepting-routes.md
// =============================================================================

import Image from 'next/image';
import { notFound } from 'next/navigation';
import LocalisedModal from '../../../../_components/localised-modal';
import { content } from '../../../../_lib/content';
import { getLessonLang } from '../../../../_lib/lang';
import { getPhoto, localizePhoto } from '../../../../_lib/photos';

type Props = { params: Promise<{ id: string }> };

export default async function PhotoModalIntercept({ params }: Props) {
    const [{ id }, lang] = await Promise.all([params, getLessonLang()]);
    const photo = getPhoto(id);
    if (!photo) notFound();

    const localized = localizePhoto(photo, lang);
    const t = content[lang].subroutes.gallery;

    return (
        <LocalisedModal title={localized.title}>
            <div className='space-y-3'>
                <p className='text-sm leading-relaxed text-slate-400'>
                    {localized.description}
                </p>
                <div className='relative aspect-3/2 w-full overflow-hidden rounded'>
                    <Image
                        src={photo.src}
                        alt={localized.title}
                        fill
                        sizes='(max-width: 1024px) 100vw, 900px'
                        className='object-cover'
                        priority
                    />
                </div>
                <p className='text-[11px] text-slate-500'>
                    {t.modalFootnote}
                </p>
            </div>
        </LocalisedModal>
    );
}
