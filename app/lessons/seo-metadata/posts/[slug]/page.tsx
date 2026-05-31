// =============================================================================
// app/lessons/seo-metadata/posts/[slug]/page.tsx
// Dynamic sub-route demonstrating `generateMetadata` + per-post JSON-LD.
// -----------------------------------------------------------------------------
// 🧠 WHY THIS SUB-ROUTE EXISTS
// The parent page (`/lessons/seo-metadata`) shows STATIC metadata (built at
// compile time). This sub-route shows the OTHER half: ASYNC metadata that
// depends on the route param. Same pattern you'd use for /blog/[slug] or
// /products/[id] in production.
//
// 🧠 generateMetadata PROMISE PARAMS (Next 16 BREAKING CHANGE)
// In Next 14 and earlier, `params` was a plain object: `{ params: { slug } }`.
// Since Next 16, `params` is a Promise: `{ params: Promise<{ slug }> }`.
// You MUST `await` it. Same for `searchParams` and the page's own `params`.
// Forgetting the await silently gives you `[object Promise]` in the title —
// the most common Next 16 upgrade bug.
//
// 🧠 I18N IN A SERVER COMPONENT
// The lesson's `LangProvider` is a Client Context — Server Components can't
// read it. So we read the `nb-lang` cookie directly via `cookies()`, the same
// way `app/lessons/layout.tsx` does. This makes the page DYNAMIC (per-request)
// because cookies are Request-time data. The page renders the right language
// from the FIRST byte of HTML — no flash, no client roundtrip.
//
// 🧠 fetch MEMOIZATION
// If `generateMetadata` and the page component both call the same fetch
// (or in this case the same `getPostBySlug`), Next's request-scoped cache
// returns the same Promise — zero double-fetch.
//
// 📚 Doc: node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-metadata.md
// =============================================================================

import type { Metadata } from 'next';
import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { connection } from 'next/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Lang } from '../../../../_lib/dictionaries';
import { JsonLd } from '../../_components/jsonld';
import { content } from '../../_lib/content';
import {
    getPostBySlug,
    listPosts,
    localizePost,
    type Post,
} from '../../_lib/posts';

type PageProps = { params: Promise<{ slug: string }> };

// Resolve the language from the `nb-lang` cookie. Falls back to IT (base lang).
// Same logic as `app/lessons/layout.tsx` — we duplicate it here because this
// route doesn't have its own LangProvider available server-side.
async function getLangFromCookie(): Promise<Lang> {
    const cookieStore = await cookies();
    const raw = cookieStore.get('nb-lang')?.value;
    return raw === 'en' || raw === 'uk' ? raw : 'it';
}

// -----------------------------------------------------------------------------
// generateStaticParams — declares the slugs that EXIST. Without language as
// part of the route, the page is request-time-dynamic (cookie-driven), so
// Next can't prerender it per language pair. We still emit the slug list so
// 404 detection works at build for invalid URLs.
// -----------------------------------------------------------------------------
export async function generateStaticParams() {
    const posts = await listPosts();
    return posts.map((p) => ({ slug: p.slug }));
}

// -----------------------------------------------------------------------------
// generateMetadata — ASYNC; reads `params` AND the `nb-lang` cookie, fetches
// the post, returns the localised `<head>` shape.
// -----------------------------------------------------------------------------
export async function generateMetadata({
    params,
}: PageProps): Promise<Metadata> {
    const [{ slug }, lang] = await Promise.all([params, getLangFromCookie()]);
    const t = content[lang].postPage;
    const post = await getPostBySlug(slug);

    // Graceful fallback metadata when the slug is invalid. The page itself
    // will trigger `notFound()` and render the closest not-found.tsx, but
    // the metadata still needs a sensible value in case a bot reaches the
    // 404 URL through a stale link.
    if (!post) {
        return {
            title: t.notFoundTitle,
            robots: { index: false, follow: false },
        };
    }

    const localized = localizePost(post, lang);

    return {
        title: localized.title,
        description: localized.excerpt,
        openGraph: {
            title: localized.title,
            description: localized.excerpt,
            type: 'article',
            publishedTime: post.publishedAt,
            authors: [post.author],
            tags: [post.tag],
            // og:locale matches the cookie language. Helps social platforms
            // pick the right preview language.
            locale: { it: 'it_IT', en: 'en_US', uk: 'uk_UA' }[lang],
            // NOTE: no `images` here — the parent segment's
            // `opengraph-image.tsx` is inherited automatically.
        },
        twitter: {
            card: 'summary_large_image',
            title: localized.title,
            description: localized.excerpt,
        },
        alternates: {
            canonical: `/lessons/seo-metadata/posts/${post.slug}`,
            // hreflang — Google sees each language version via the cookie URL.
            languages: {
                it: `/lessons/seo-metadata/posts/${post.slug}?lang=it`,
                en: `/lessons/seo-metadata/posts/${post.slug}?lang=en`,
                uk: `/lessons/seo-metadata/posts/${post.slug}?lang=uk`,
            },
        },
        robots: { index: true, follow: true },
    };
}

// -----------------------------------------------------------------------------
// Article Schema.org JSON-LD — distinct from the Course schema on the parent.
// Article rich results show authors, publish date, headline.
// -----------------------------------------------------------------------------
function buildArticleSchema(post: Post, lang: Lang) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title[lang],
        description: post.excerpt[lang],
        author: { '@type': 'Person', name: post.author },
        datePublished: post.publishedAt,
        keywords: post.tag,
        timeRequired: `PT${post.readingMinutes}M`, // ISO 8601 duration
        inLanguage: lang,
    };
}

export default function PostPage({ params }: PageProps) {
    // The Suspense + connection() pattern is what the other dynamic lessons
    // (auth-setup, middleware-logic) use under cacheComponents. It tells Next
    // "this branch is request-time" so cookie reads are allowed.
    return (
        <Suspense fallback={<PostSkeleton />}>
            <PostContent params={params} />
        </Suspense>
    );
}

async function PostContent({ params }: PageProps) {
    await connection();

    const [{ slug }, lang] = await Promise.all([params, getLangFromCookie()]);
    const post = await getPostBySlug(slug);

    if (!post) notFound();

    const t = content[lang].postPage;
    const localized = localizePost(post, lang);
    const localeMap: Record<Lang, string> = {
        it: 'it-IT',
        en: 'en-US',
        uk: 'uk-UA',
    };
    const publishedDate = new Date(post.publishedAt).toLocaleDateString(
        localeMap[lang],
        { year: 'numeric', month: 'short', day: 'numeric' },
    );

    // The first step contains a `{slug}` placeholder so each language can
    // phrase the sentence naturally around it.
    const steps = t.whatHappened.steps.map((step) =>
        step.replace('{slug}', post.slug),
    );

    return (
        <>
            <JsonLd schema={buildArticleSchema(post, lang)} />

            <article className='space-y-8'>
                <Link
                    href='/lessons/seo-metadata'
                    className='inline-flex items-center gap-1 text-sm text-sky-300 hover:text-sky-200'
                >
                    {t.backLabel}
                </Link>

                <header className='space-y-3'>
                    <div className='flex flex-wrap items-center gap-3'>
                        <span className='rounded-full border border-violet-500/40 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300'>
                            {post.tag}
                        </span>
                        <span className='text-xs text-slate-500'>
                            {publishedDate} · {post.readingMinutes}{' '}
                            {t.readingSuffix} · {post.author}
                        </span>
                    </div>
                    <h1 className='text-3xl font-bold tracking-tight text-white sm:text-4xl'>
                        {localized.title}
                    </h1>
                    <p className='max-w-2xl text-base leading-relaxed text-slate-400'>
                        {localized.excerpt}
                    </p>
                </header>

                <section className='space-y-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4'>
                    <h2 className='text-sm font-semibold tracking-wide text-emerald-300 uppercase'>
                        {t.whatHappened.heading}
                    </h2>
                    <ol className='list-decimal space-y-2 pl-5 text-sm leading-relaxed text-slate-300 marker:text-emerald-400'>
                        {steps.map((step, idx) => (
                            <li
                                key={idx}
                                className='whitespace-pre-line'
                            >
                                {step}
                            </li>
                        ))}
                    </ol>
                </section>

                <section className='space-y-3 rounded-lg border border-slate-700/60 bg-slate-900/40 p-4'>
                    <h2 className='text-sm font-semibold tracking-wide text-slate-300 uppercase'>
                        {t.tryThis.heading}
                    </h2>
                    <ul className='list-disc space-y-1 pl-5 text-sm text-slate-300 marker:text-slate-500'>
                        {t.tryThis.items.map((item, idx) => (
                            <li key={idx} className='whitespace-pre-line'>
                                {item}
                            </li>
                        ))}
                    </ul>
                </section>
            </article>
        </>
    );
}

function PostSkeleton() {
    return (
        <div className='space-y-4'>
            <div className='h-4 w-32 animate-pulse rounded-full bg-slate-800/60' />
            <div className='h-10 w-3/4 animate-pulse rounded bg-slate-800/60' />
            <div className='h-4 w-full animate-pulse rounded bg-slate-800/40' />
            <div className='h-4 w-5/6 animate-pulse rounded bg-slate-800/40' />
        </div>
    );
}
