// =============================================================================
// app/lessons/seo-metadata/page.tsx
// SERVER entry for /lessons/seo-metadata — Module 5 · Lesson 2.
// -----------------------------------------------------------------------------
// 🧠 STATIC METADATA
// We export `metadata` directly (not `generateMetadata`) because nothing on
// this page depends on `params` / `searchParams` / external data. Next reads
// this object at build time and bakes the `<head>` tags into the prerendered
// HTML — zero runtime cost.
//
// 🧠 TITLE TEMPLATE (production pattern, not yet wired in this repo)
// The root layout currently sets a plain `title: 'Living Notebook · …'` so
// a page-level `title` REPLACES it wholesale. The production pattern (shown
// in the lesson snippet for §1) is to set `title: { template: '%s · Living
// Notebook', default: 'Living Notebook' }` on the root, so a page-level
// `title: 'SEO & Metadata'` composes into `<title>SEO & Metadata · Living
// Notebook</title>` automatically. We don't roll that out here because the
// 16 existing lessons hardcode "· Living Notebook" in their own titles —
// adopting the template would require pruning each one. Left as a follow-up.
//
// 🧠 JSON-LD AT THE PAGE LEVEL
// The `<JsonLd>` component renders a `<script type="application/ld+json">`
// in the page body. Crawlers don't care WHERE in the DOM it lives — head
// or body, both work — but rendering on the server is non-negotiable
// (Googlebot's JS execution is unreliable, see lesson copy).
//
// 📚 Doc: node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-metadata.md
// =============================================================================

import type { Metadata } from 'next';
import IndexView from './_components/index-view';
import MetaInspector from './_components/meta-inspector';
import PostsDemo from './_components/posts-demo';
import RoutesDemo from './_components/routes-demo';
import { JsonLd } from './_components/jsonld';
import { listPosts } from './_lib/posts';

const PAGE_PATH = '/lessons/seo-metadata';
const PAGE_TITLE = 'SEO & Metadata';
const PAGE_DESCRIPTION =
    'Module 5 · Lesson 2 — the App Router metadata pipeline: static metadata, async generateMetadata, ImageResponse for dynamic OG images, typed sitemap.ts / robots.ts, and JSON-LD for rich results.';

export const metadata: Metadata = {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    // OpenGraph — Twitter / Facebook / LinkedIn / Slack all read these.
    openGraph: {
        title: PAGE_TITLE,
        description: PAGE_DESCRIPTION,
        type: 'article',
        // NOTE: we DO NOT set `images` here — the file convention
        // `opengraph-image.tsx` at this segment automatically populates it.
        // If we set `images` here, the file convention would still override.
    },
    twitter: {
        card: 'summary_large_image',
        title: PAGE_TITLE,
        description: PAGE_DESCRIPTION,
    },
    // Canonical + hreflang. Telling Google the IT/EN/UK variants are the
    // same content in different languages → no duplicate-content penalty.
    alternates: {
        canonical: PAGE_PATH,
        languages: {
            it: `${PAGE_PATH}?lang=it`,
            en: `${PAGE_PATH}?lang=en`,
            uk: `${PAGE_PATH}?lang=uk`,
        },
    },
};

// Schema.org Course schema — what Google reads to potentially show this
// page as a "course" rich result with provider, name, description.
// Reference: https://schema.org/Course
const courseSchema = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: 'Living Notebook · SEO & Metadata',
    description: PAGE_DESCRIPTION,
    provider: {
        '@type': 'Organization',
        name: 'Living Notebook',
        sameAs: 'https://living-notebook.local',
    },
    inLanguage: ['it', 'en', 'uk'],
    educationalLevel: 'intermediate',
    teaches: [
        'Next.js App Router metadata API',
        'OpenGraph and Twitter Cards',
        'Dynamic OG image generation with ImageResponse',
        'Typed sitemap.ts and robots.ts',
        'Schema.org JSON-LD structured data',
    ],
};

export default async function SeoMetadataPage() {
    // The post list is small enough to fetch here and pass as a prop to the
    // demo component. In a real app this would be a real DB query.
    const posts = await listPosts();

    // 🧠 EXPLICIT KEYS ON SLOT ELEMENTS
    // React 19 + RSC: when a Server Component passes JSX as named props to a
    // Client Component, the Flight serializer treats those JSX elements as
    // children of an implicit array on the client side. Dev mode therefore
    // emits the "missing key" warning even though we never iterate over them
    // with `.map()`. Adding a stable `key` to each slot element silences the
    // false positive and costs nothing at runtime (the keys are only consumed
    // by React's reconciler dev-mode check).
    return (
        <IndexView
            jsonLd={<JsonLd key='json-ld' schema={courseSchema} />}
            metaInspector={
                <MetaInspector
                    key='meta-inspector'
                    title={PAGE_TITLE}
                    description={PAGE_DESCRIPTION}
                    canonical={PAGE_PATH}
                />
            }
            postsDemo={<PostsDemo key='posts-demo' posts={posts} />}
            routesDemo={<RoutesDemo key='routes-demo' />}
        />
    );
}
