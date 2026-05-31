// =============================================================================
// app/sitemap.ts
// Typed XML sitemap — file convention at the root of `app`.
// -----------------------------------------------------------------------------
// 🧠 RESULT
// At build time Next exposes a route at `/sitemap.xml` that returns
// `application/xml` matching the Sitemaps 0.9 protocol. Crawlers read this
// to discover every URL of the site without crawling the whole graph.
//
// 🧠 SINGLE SOURCE OF TRUTH
// The lesson list lives in `app/_lib/dictionaries.ts` (consumed by the
// home page). We import it HERE so the sitemap stays automatically in sync:
// add a new lesson to the dictionary → next `next build` and `/sitemap.xml`
// includes it. Zero double-bookkeeping.
//
// 🧠 hreflang ALTERNATES
// Every URL is emitted with `alternates.languages` for IT/EN/UK. Next
// renders this as `<xhtml:link rel="alternate" hreflang="…">` — what Google
// uses to know that `/lessons/foo?lang=en` and `/lessons/foo?lang=it` are
// the SAME page in different languages and shouldn't compete for the same
// search query.
//
// 🧠 STATIC + REGENERATABLE
// Pure data, no Request-time API → Next prerenders this at build. To
// regenerate on a content change, call `revalidatePath('/sitemap.xml')`
// from a Server Action when the lesson dictionary changes.
//
// 📚 Doc: node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/sitemap.md
// =============================================================================

import type { MetadataRoute } from 'next';
import { dictionaries, type Lang } from './_lib/dictionaries';

const BASE_URL = 'https://living-notebook.local';
const LOCALES: Lang[] = ['it', 'en', 'uk'];

// Per-status priority — `done` lessons rank higher than `next` or `locked`
// because they are the URLs we actually want indexed first.
const priorityByStatus = {
    done: 0.8,
    next: 0.6,
    locked: 0.3,
} as const;

export default function sitemap(): MetadataRoute.Sitemap {
    // Flatten lessons across all modules from the IT dictionary (the base
    // language — slugs are identical across translations). The dictionary
    // holds the full structure, so this iteration scales as we add lessons.
    const lessons = dictionaries.it.modules.flatMap((module) =>
        module.lessons.map((lesson) => ({
            slug: lesson.slug,
            status: lesson.status,
        })),
    );

    const now = new Date();

    const buildLangAlternates = (path: string) =>
        Object.fromEntries(
            LOCALES.map((locale) => [locale, `${BASE_URL}${path}?lang=${locale}`]),
        );

    return [
        // Homepage — highest priority, weekly cadence since the lesson list
        // changes there.
        {
            url: BASE_URL,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 1,
            alternates: { languages: buildLangAlternates('') },
        },
        // One entry per lesson, with hreflang alternates.
        ...lessons.map((lesson) => ({
            url: `${BASE_URL}/lessons/${lesson.slug}`,
            lastModified: now,
            changeFrequency: 'monthly' as const,
            priority: priorityByStatus[lesson.status],
            alternates: {
                languages: buildLangAlternates(`/lessons/${lesson.slug}`),
            },
        })),
    ];
}
