// =============================================================================
// app/lessons/seo-metadata/_lib/posts.ts
// Fake "blog posts" used by the [slug] sub-route to demo `generateMetadata`.
// -----------------------------------------------------------------------------
// In a real app this module would `await db.query(...)` or `fetch(cms)`. We
// keep it in-memory to keep the lesson zero-dependency. The simulated `await`
// in `getPostBySlug` mirrors the real shape: every call is async and could
// fail with `null`.
//
// 🧠 I18N MODEL
// `title` and `excerpt` are `Record<Lang, string>` — one entry per language.
// Other fields are flat (the author name doesn't translate; the date is ISO;
// the slug is the URL primary key and must NOT translate).
// At the call site the consumer passes `lang` to `localizePost(post, lang)`
// to get a flat shape ready to render.
// =============================================================================

import type { Lang } from '../../../_lib/dictionaries';

type LocalizedString = Record<Lang, string>;

export type Post = {
    slug: string;
    title: LocalizedString;
    excerpt: LocalizedString;
    author: string;
    publishedAt: string; // ISO
    readingMinutes: number;
    tag: string;
};

export type LocalizedPost = Omit<Post, 'title' | 'excerpt'> & {
    title: string;
    excerpt: string;
};

// The data is intentionally varied per post (different titles, excerpts, tags)
// so the OG image and <title> in the [slug] route LOOK different per click.
export const posts: Post[] = [
    {
        slug: 'metadata-pipeline',
        title: {
            it: 'Dentro la metadata pipeline di App Router',
            en: 'Inside the App Router metadata pipeline',
            uk: 'Усередині metadata pipeline App Router',
        },
        excerpt: {
            it: "Come Next.js compone layout, page e file conventions per produrre il <head> finale. Regole di cascade, strategia di merge, e l'unica sorpresa: le file conventions vincono SEMPRE.",
            en: "How Next.js stitches together layouts, pages, and file conventions to produce the final <head>. Cascade rules, merge strategy, and the one surprise: file conventions always win.",
            uk: 'Як Next.js поєднує layouts, pages та file conventions, щоб створити фінальний <head>. Правила cascade, стратегія merge, і єдиний сюрприз: file conventions ЗАВЖДИ виграють.',
        },
        author: 'Inna Boiko',
        publishedAt: '2026-04-12T09:00:00.000Z',
        readingMinutes: 7,
        tag: 'architecture',
    },
    {
        slug: 'image-response-deep-dive',
        title: {
            it: 'ImageResponse, Edge runtime, e perché i tuoi font spariscono',
            en: 'ImageResponse, Edge runtime, and why your fonts vanish',
            uk: 'ImageResponse, Edge runtime, і чому твої шрифти зникають',
        },
        excerpt: {
            it: "next/og gira su V8 isolates: niente fs, niente system fonts. La checklist produzione per spedire OG image renderizzate sotto i 200ms in tutto il mondo.",
            en: "next/og runs on V8 isolates: no fs, no system fonts. Here's the production checklist to ship OG images that render under 200ms worldwide.",
            uk: 'next/og працює на V8 isolates: нема fs, нема system fonts. Production-чеклист, щоб OG зображення рендерилися під 200мс у всьому світі.',
        },
        author: 'Inna Boiko',
        publishedAt: '2026-04-20T09:00:00.000Z',
        readingMinutes: 9,
        tag: 'edge',
    },
    {
        slug: 'sitemaps-at-scale',
        title: {
            it: 'Sitemap su larga scala: hreflang, limite 50k, generateSitemaps',
            en: 'Sitemaps at scale: hreflang, 50k limits, and generateSitemaps',
            uk: 'Sitemaps на масштабі: hreflang, 50k ліміти, generateSitemaps',
        },
        excerpt: {
            it: "Un singolo sitemap.ts funziona fino a ~50k URL. Oltre, generateSitemaps shardizza il tuo grafo URL. In più: perché ogni hreflang deve essere reciproco.",
            en: 'Single sitemap.ts works until ~50k URLs. After that, generateSitemaps shards your URL graph. Plus: why every hreflang must be reciprocal.',
            uk: 'Один sitemap.ts працює до ~50k URL. Далі generateSitemaps шардить граф URL. Бонус: чому кожен hreflang має бути взаємним.',
        },
        author: 'Inna Boiko',
        publishedAt: '2026-05-02T09:00:00.000Z',
        readingMinutes: 6,
        tag: 'crawling',
    },
    {
        slug: 'structured-data-cookbook',
        title: {
            it: 'Cookbook JSON-LD: Course, Article, Product, BreadcrumbList',
            en: 'A JSON-LD cookbook: Course, Article, Product, BreadcrumbList',
            uk: 'Кулінарна книга JSON-LD: Course, Article, Product, BreadcrumbList',
        },
        excerpt: {
            it: "Quattro tipi Schema.org che coprono il 90% dell'eleggibilità ai rich results su un content site. Col codice esatto che spedisco in produzione.",
            en: 'Four Schema.org types that account for 90% of rich-result eligibility on a content site. With the exact code I ship.',
            uk: 'Чотири Schema.org типи, що покривають 90% eligibility до rich results на content site. З точним кодом, який я шипую.',
        },
        author: 'Inna Boiko',
        publishedAt: '2026-05-18T09:00:00.000Z',
        readingMinutes: 11,
        tag: 'structured-data',
    },
];

// Flatten a Post for the given language. The rest of the page can then
// render `post.title` and `post.excerpt` as plain strings without knowing
// about the i18n shape.
export function localizePost(post: Post, lang: Lang): LocalizedPost {
    return {
        ...post,
        title: post.title[lang],
        excerpt: post.excerpt[lang],
    };
}

// Simulated async lookup. In production the await would be a real `db.query`.
export async function getPostBySlug(slug: string): Promise<Post | null> {
    // The microtask is what makes this realistic: callers MUST `await`. Without
    // it, accidental sync calls would still work in dev and break in prod.
    await Promise.resolve();
    return posts.find((p) => p.slug === slug) ?? null;
}

export async function listPosts(): Promise<Post[]> {
    await Promise.resolve();
    return posts;
}
