// =============================================================================
// app/lessons/seo-metadata/_lib/content.ts
// Inline i18n dictionary for Module 5 · Lesson 2 (SEO & Metadata).
// =============================================================================

import type { Lang } from '../../../_lib/dictionaries';

type Section = { heading: string; description: string; snippet: string };

type Dictionary = {
    badge: string;
    title: string;
    intro: string;
    sections: {
        pipeline: Section;
        staticMetadata: Section;
        generateMetadata: Section;
        ogImage: Section;
        sitemap: Section;
        robots: Section;
        jsonLd: Section;
    };
    decisionTable: {
        heading: string;
        intro: string;
        rows: { scenario: string; choice: string }[];
    };
    labs: {
        heading: string;
        metaInspector: {
            badge: string;
            description: string;
            titleLabel: string;
            descriptionLabel: string;
            ogTitleLabel: string;
            ogImageLabel: string;
            canonicalLabel: string;
            jsonLdLabel: string;
        };
        posts: {
            badge: string;
            description: string;
            listHeading: string;
            visitLabel: string;
        };
        routes: {
            badge: string;
            description: string;
            sitemapLabel: string;
            robotsLabel: string;
            ogImageLabel: string;
            lessonOgLabel: string;
        };
    };
    debug: { heading: string; description: string; steps: string[] };
    // Strings used by the [slug] Server Component. Picked via the `nb-lang`
    // cookie because Server Components cannot read the LangProvider context.
    postPage: {
        backLabel: string;
        readingSuffix: string;
        whatHappened: { heading: string; steps: string[] };
        tryThis: { heading: string; items: string[] };
        notFoundTitle: string;
    };
};

// -----------------------------------------------------------------------------
// IT — base
// -----------------------------------------------------------------------------
const it: Dictionary = {
    badge: 'Modulo 5 · Lezione 2',
    title: 'SEO & Metadata',
    intro: "Niente più `<Head>` manuale come in Next 12. Nel App Router l'`<head>` HTML è prodotto da TRE meccanismi che si compongono: l'oggetto `metadata` esportato (statico), la funzione `generateMetadata` (async, legge `params`), e le **file conventions** (`opengraph-image.tsx`, `icon.tsx`, `robots.ts`, `sitemap.ts`). Tutto è tipizzato via `Metadata` di `next`, niente magic string. In questa lezione vedrai una root con metadata statico, una sotto-route `[slug]` con `generateMetadata` async, una OG image dinamica generata via `ImageResponse` su Edge runtime, un `sitemap.ts` che itera la dictionary delle lezioni, e un `robots.ts` che linka la sitemap. Sopra a tutto, **JSON-LD** (Schema.org Course) per i rich results di Google.",
    sections: {
        pipeline: {
            heading: '§1 Come Next produce il tag <head>',
            description: "Ordine di precedenza, dal più basso al più alto:\n\n1. **`metadata` / `generateMetadata` dei layout genitori** (più profondo = più specifico vince via shallow merge)\n2. **`metadata` / `generateMetadata` della page** sovrascrive i layout\n3. **File conventions** (`opengraph-image.tsx`, `icon.tsx`, `robots.ts`, `sitemap.ts`) — vincono SEMPRE sopra i corrispondenti campi nell'oggetto `metadata`\n\nUna regola d'oro: `metadata` e `generateMetadata` sono **Server-only** (non si esportano da Client Component). Risolti PRIMA del render della page → vanno nella prima risposta HTML insieme alla shell.\n\nDa Next 14, **`viewport`** è un export separato (`export const viewport`), non più dentro `metadata`. Il motivo: il viewport può dipendere dalla richiesta (es. dark mode preference) mentre il resto della metadata no.",
            snippet: `// Cascade: root layout → lesson layout → page → file conventions

// app/layout.tsx
export const metadata: Metadata = {
  title: { template: '%s · Living Notebook', default: 'Living Notebook' },
  description: 'Quaderno interattivo Next.js 16',
};

// app/lessons/seo-metadata/page.tsx
export const metadata: Metadata = {
  title: 'SEO & Metadata',  // → '<title>SEO & Metadata · Living Notebook</title>'
  description: '…',          // sovrascrive il root
};

// app/lessons/seo-metadata/opengraph-image.tsx
// → vince sopra metadata.openGraph.images del root`,
        },
        staticMetadata: {
            heading: '§2 metadata statico',
            description: 'Quando la pagina NON dipende da `params` / `searchParams` / dati esterni, `export const metadata` è la scelta giusta: viene letto a build time, niente runtime cost. Pattern per landing page, about, docs, dashboard interni. Supporta `title.template` per il branding (es. `"%s · Living Notebook"` aggiunge `· Living Notebook` automaticamente a tutte le sub-route).',
            snippet: `import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SEO & Metadata',
  description: 'Modulo 5 · Lezione 2 …',
  openGraph: {
    title: 'SEO & Metadata',
    description: '…',
    type: 'article',
    locale: 'it_IT',
  },
  twitter: { card: 'summary_large_image' },
  alternates: {
    canonical: '/lessons/seo-metadata',
    languages: {
      it: '/lessons/seo-metadata?lang=it',
      en: '/lessons/seo-metadata?lang=en',
      uk: '/lessons/seo-metadata?lang=uk',
    },
  },
};`,
        },
        generateMetadata: {
            heading: '§3 generateMetadata async',
            description: "Quando l'`<head>` dipende da un parametro di route (slug del blog post, id del prodotto, lingua), usi `generateMetadata`: async, riceve `{ params, searchParams }`, ritorna un `Metadata`. Trucchi senior: (1) `fetch` chiamati qui sono **memoizzati** automaticamente — se la page chiama lo stesso fetch, va in cache. (2) Puoi accedere alla `parent` metadata (root layout) per ESTENDERLA invece di rimpiazzarla (es. mantieni la `og:images` del sito + aggiungi quella del post). (3) Da Next 16, `params` è una `Promise` (era sincrono fino a 14): devi `await`.",
            snippet: `// app/lessons/seo-metadata/[slug]/page.tsx
import type { Metadata } from 'next';
import { getPostBySlug } from '../_lib/posts';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata(
  { params }: Props,
): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: 'Post non trovato' };
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author],
    },
  };
}`,
        },
        ogImage: {
            heading: '§4 Open Graph Image dinamica con ImageResponse',
            description: "File convention più potente di Next: `opengraph-image.tsx` che esporta una function default ritorna `ImageResponse` (da `next/og`). Renderizza JSX-LIKE → PNG 1200×630 al volo. Edge runtime → no Node API, ma `process.cwd()` funziona per caricare font (necessario perché su Edge non c'è il sistema fonts). Risultato: ogni volta che condividi un link su Twitter/Slack/LinkedIn, vedono una card generata. Pattern produzione: `app/opengraph-image.tsx` (default del sito) + override per le route che vogliono una propria (es. `app/lessons/seo-metadata/opengraph-image.tsx`).",
            snippet: `// app/opengraph-image.tsx — site default
import { ImageResponse } from 'next/og';

export const alt = 'Living Notebook';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div style={{
        display: 'flex', width: '100%', height: '100%',
        background: 'linear-gradient(135deg, #020617, #0c4a6e)',
        color: 'white', alignItems: 'center', justifyContent: 'center',
        fontSize: 84, fontWeight: 700,
      }}>
        Living Notebook
      </div>
    ),
    size,
  );
}`,
        },
        sitemap: {
            heading: '§5 sitemap.ts dinamico dalla dictionary',
            description: 'Niente XML scritto a mano. `app/sitemap.ts` esporta una function che ritorna un array di `MetadataRoute.Sitemap`. Next genera il file `/sitemap.xml` matching il protocol Sitemaps di Google. In questo notebook iteriamo `app/_lib/dictionaries.ts` per emettere un URL per OGNI lezione, con `alternates.languages` per IT/EN/UK (hreflang). Quando aggiungiamo `/lessons/security-env`, la sitemap si aggiorna SOLA al prossimo build, niente da toccare.',
            snippet: `// app/sitemap.ts
import type { MetadataRoute } from 'next';
import { dictionaries } from './_lib/dictionaries';

const BASE = 'https://living-notebook.local';

export default function sitemap(): MetadataRoute.Sitemap {
  const lessons = dictionaries.it.modules.flatMap((m) => m.lessons);
  return [
    { url: BASE, lastModified: new Date(), priority: 1, changeFrequency: 'weekly' },
    ...lessons.map((l) => ({
      url: \`\${BASE}/lessons/\${l.slug}\`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: l.status === 'done' ? 0.8 : 0.3,
      alternates: {
        languages: {
          it: \`\${BASE}/lessons/\${l.slug}?lang=it\`,
          en: \`\${BASE}/lessons/\${l.slug}?lang=en\`,
          uk: \`\${BASE}/lessons/\${l.slug}?lang=uk\`,
        },
      },
    })),
  ];
}`,
        },
        robots: {
            heading: '§6 robots.ts come TypeScript',
            description: 'Same pattern del sitemap: invece di un `robots.txt` plain text, esporti un oggetto tipizzato. Vantaggi: typecheck (zero typo nelle direttive), poteri di TypeScript (es. condizionare `disallow` in base a `NODE_ENV` per tenere staging fuori dall\'indice), refactoring-friendly. Linka esplicitamente la `sitemap` al fondo — è una delle prime cose che cercano i crawler.',
            snippet: `// app/robots.ts
import type { MetadataRoute } from 'next';

const BASE = 'https://living-notebook.local';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/', '/lessons/*/protected'],
      },
    ],
    sitemap: \`\${BASE}/sitemap.xml\`,
    host: BASE,
  };
}`,
        },
        jsonLd: {
            heading: '§7 JSON-LD per i rich results',
            description: 'OpenGraph dice "ecco come deve apparire questa pagina quando condivisa". JSON-LD (Schema.org) dice "ecco COSA È questa pagina" — un Corso, un Articolo, un Prodotto. Google legge JSON-LD per generare i **rich results** (stelle di rating, breadcrumb breadcrumbs, prezzo). Si emette come `<script type="application/ld+json">` nel body o head. In Next: un piccolo Server Component che `JSON.stringify(schema)` e lo emette via `<script>` con `dangerouslySetInnerHTML` — non c\'è XSS perché stiamo serializzando NOI il JSON.',
            snippet: `// _components/jsonld.tsx — Server Component
type Props = { schema: Record<string, unknown> };

export function JsonLd({ schema }: Props) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// In page.tsx
const courseSchema = {
  '@context': 'https://schema.org',
  '@type': 'Course',
  name: 'SEO & Metadata',
  description: 'Modulo 5 · Lezione 2 del Living Notebook',
  provider: { '@type': 'Organization', name: 'Living Notebook' },
};

<JsonLd schema={courseSchema} />`,
        },
    },
    decisionTable: {
        heading: '§8 Quale strumento usare?',
        intro: 'Mapping scenario → API.',
        rows: [
            {
                scenario: 'Landing page, about, docs — contenuto fisso',
                choice: 'export const metadata (statico)',
            },
            {
                scenario: 'Blog post / prodotto / utente — dipende da [slug]',
                choice: 'generateMetadata({ params }) async + fetch memoizzato',
            },
            {
                scenario: 'OG card uniforme per tutto il sito',
                choice: 'app/opengraph-image.tsx (default site-wide)',
            },
            {
                scenario: 'OG card custom per la singola lezione/post',
                choice: 'app/<route>/opengraph-image.tsx (override segmento)',
            },
            {
                scenario: 'Lista URL del sito per i crawler',
                choice: 'app/sitemap.ts iterando dati interni',
            },
            {
                scenario: 'Controllare cosa indicizzano i crawler',
                choice: 'app/robots.ts tipizzato',
            },
            {
                scenario: 'Apparire nei rich results (stelle, breadcrumb)',
                choice: 'JSON-LD via <script type="application/ld+json">',
            },
            {
                scenario: 'Multi-lingua: dire a Google che esistono varianti',
                choice: 'metadata.alternates.languages + sitemap alternates',
            },
        ],
    },
    labs: {
        heading: '🧪 Lab interattivi',
        metaInspector: {
            badge: 'Lab 1',
            description: "Apri DevTools → Elements → trova il `<head>`. Trovi tutti i tag che vedi qui sotto. Cambia lingua col selettore in alto → ricarica → il `<title>` cambia. Le card mostrano il valore REALE letto dalla pagina, non un mockup.",
            titleLabel: '<title>',
            descriptionLabel: '<meta name="description">',
            ogTitleLabel: '<meta property="og:title">',
            ogImageLabel: '<meta property="og:image">',
            canonicalLabel: '<link rel="canonical">',
            jsonLdLabel: '<script type="application/ld+json">',
        },
        posts: {
            badge: 'Lab 2',
            description: 'Click su un post → vai a una route `[slug]` con `generateMetadata` async. Apri DevTools → Elements → nota che `<title>` e `<meta og:image>` sono diversi per ogni post (calcolati dallo slug, non hardcoded).',
            listHeading: 'Post di esempio',
            visitLabel: 'Apri →',
        },
        routes: {
            badge: 'Lab 3',
            description: 'I file conventions di Next espongono route reali. Click → vedi il file generato.',
            sitemapLabel: '/sitemap.xml',
            robotsLabel: '/robots.txt',
            ogImageLabel: '/opengraph-image (site default)',
            lessonOgLabel: '/lessons/seo-metadata/opengraph-image',
        },
    },
    debug: {
        heading: '🔬 Debugging Lab',
        description: 'Sei tool che usi su QUALSIASI sito per fare audit SEO.',
        steps: [
            "**View Source** (Cmd+U): scrolla nel `<head>`. Conta i `<meta>` tag. Una buona pagina ne ha ~15-20 (title, description, charset, viewport, og:*, twitter:*, canonical, robots).",
            '**OG image preview**: apri http://localhost:3000/opengraph-image — vedi il PNG generato dal default site OG. Poi http://localhost:3000/lessons/seo-metadata/opengraph-image — vedi quello override-ato per la lezione. Sono PNG REALI, generati al volo su Edge.',
            '**sitemap.xml**: apri http://localhost:3000/sitemap.xml — XML formattato, una `<url>` per ogni lezione, `<xhtml:link rel="alternate" hreflang="…">` per IT/EN/UK.',
            '**robots.txt**: apri http://localhost:3000/robots.txt — output testuale generato dal `robots.ts`.',
            '**JSON-LD validator**: copia il contenuto del `<script type="application/ld+json">` e incollalo su https://validator.schema.org per vedere come Google interpreta lo schema Course.',
            "**Rich Results Test** (in produzione): l'URL pubblico → https://search.google.com/test/rich-results. Locale: usa Lighthouse → SEO audit (Cmd+Shift+P → Run Lighthouse → SEO).",
            '**Social preview**: in produzione (URL pubblico) usa https://www.opengraph.xyz — incolla la URL, vedi come appare su Twitter/Facebook/LinkedIn senza dover postare. In locale puoi solo verificare i meta tag manualmente.',
        ],
    },
    postPage: {
        backLabel: '← Torna alla lezione',
        readingSuffix: 'min di lettura',
        whatHappened: {
            heading: 'Cosa è appena successo',
            steps: [
                'Next ha chiamato `generateMetadata({ params })` sul server con `slug = "{slug}"`.',
                'La funzione ha letto il cookie `nb-lang` per scegliere la lingua, poi ha atteso `getPostBySlug(slug)` e ritornato un oggetto `Metadata` (title, description, OG, canonical) fatto su misura per questo post.',
                'Next ha composto quei tag nell\'HTML pre-renderizzato. Apri DevTools → Elements → `<head>` per vederli.',
                "L'`opengraph-image.tsx` del segmento genitore vince comunque per `og:image` perché non lo abbiamo sovrascritto qui.",
                'In aggiunta abbiamo iniettato un blocco JSON-LD Article — view-source per trovare `<script type=\"application/ld+json\">`.',
            ],
        },
        tryThis: {
            heading: 'Prova questo',
            items: [
                'Cambia la lingua col selettore in alto, ricarica questo post — il body cambia perché legge il cookie `nb-lang`.',
                'Modifica un campo `title` in `_lib/posts.ts`, salva — l\'HMR ri-esegue `generateMetadata` e il `<title>` si aggiorna.',
                'Visita `/lessons/seo-metadata/posts/non-esiste` — la metadata ritorna `robots: index:false` e la page chiama `notFound()`.',
            ],
        },
        notFoundTitle: 'Post non trovato',
    },
};

// -----------------------------------------------------------------------------
// EN
// -----------------------------------------------------------------------------
const en: Dictionary = {
    badge: 'Module 5 · Lesson 2',
    title: 'SEO & Metadata',
    intro: 'No more manual `<Head>` like in Next 12. In the App Router the HTML `<head>` is produced by THREE composable mechanisms: the exported `metadata` object (static), the `generateMetadata` function (async, reads `params`), and **file conventions** (`opengraph-image.tsx`, `icon.tsx`, `robots.ts`, `sitemap.ts`). Everything is typed via `Metadata` from `next`, no magic strings. In this lesson you build a root with static metadata, a `[slug]` sub-route with async `generateMetadata`, a dynamic OG image generated via `ImageResponse` on the Edge runtime, a `sitemap.ts` that iterates the lessons dictionary, and a `robots.ts` linking the sitemap. Cherry on top: **JSON-LD** (Schema.org Course) for Google rich results.',
    sections: {
        pipeline: {
            heading: '§1 How Next builds the <head>',
            description: "Precedence order, lowest to highest:\n\n1. **Parent layouts' `metadata` / `generateMetadata`** (deeper = more specific wins via shallow merge)\n2. **Page's `metadata` / `generateMetadata`** overrides layouts\n3. **File conventions** (`opengraph-image.tsx`, `icon.tsx`, `robots.ts`, `sitemap.ts`) — ALWAYS win over the matching fields in the `metadata` object\n\nGolden rule: `metadata` and `generateMetadata` are **Server-only** (can't be exported from a Client Component). Resolved BEFORE the page renders → they land in the initial HTML alongside the shell.\n\nSince Next 14, **`viewport`** is a separate export (`export const viewport`), no longer inside `metadata`. The reason: viewport can depend on the request (e.g. dark mode preference) while the rest of metadata does not.",
            snippet: `// Cascade: root layout → lesson layout → page → file conventions

// app/layout.tsx
export const metadata: Metadata = {
  title: { template: '%s · Living Notebook', default: 'Living Notebook' },
  description: 'Interactive Next.js 16 notebook',
};

// app/lessons/seo-metadata/page.tsx
export const metadata: Metadata = {
  title: 'SEO & Metadata',  // → '<title>SEO & Metadata · Living Notebook</title>'
  description: '…',          // overrides root
};

// app/lessons/seo-metadata/opengraph-image.tsx
// → wins over root metadata.openGraph.images`,
        },
        staticMetadata: {
            heading: '§2 Static metadata',
            description: "When the page does NOT depend on `params` / `searchParams` / external data, `export const metadata` is the right choice: it's read at build time, no runtime cost. Pattern for landing pages, about, docs, internal dashboards. Supports `title.template` for branding (e.g. `\"%s · Living Notebook\"` automatically appends `· Living Notebook` to all sub-routes).",
            snippet: `import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SEO & Metadata',
  description: 'Module 5 · Lesson 2 …',
  openGraph: {
    title: 'SEO & Metadata',
    description: '…',
    type: 'article',
    locale: 'en_US',
  },
  twitter: { card: 'summary_large_image' },
  alternates: {
    canonical: '/lessons/seo-metadata',
    languages: {
      it: '/lessons/seo-metadata?lang=it',
      en: '/lessons/seo-metadata?lang=en',
      uk: '/lessons/seo-metadata?lang=uk',
    },
  },
};`,
        },
        generateMetadata: {
            heading: '§3 Async generateMetadata',
            description: "When the `<head>` depends on a route param (blog slug, product id, language), use `generateMetadata`: async, receives `{ params, searchParams }`, returns a `Metadata`. Senior tricks: (1) `fetch` called here is **automatically memoized** — if the page calls the same fetch, it's cached. (2) You can access the `parent` metadata (root layout) to EXTEND it instead of replacing (e.g. keep the site `og:images` + add the post's). (3) Since Next 16, `params` is a `Promise` (was sync until 14): you must `await`.",
            snippet: `// app/lessons/seo-metadata/[slug]/page.tsx
import type { Metadata } from 'next';
import { getPostBySlug } from '../_lib/posts';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata(
  { params }: Props,
): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: 'Post not found' };
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author],
    },
  };
}`,
        },
        ogImage: {
            heading: '§4 Dynamic Open Graph image via ImageResponse',
            description: "Next's most powerful file convention: `opengraph-image.tsx` exports a default function returning `ImageResponse` (from `next/og`). Renders JSX-LIKE → PNG 1200×630 on the fly. Edge runtime → no Node API, but `process.cwd()` works for loading fonts (needed because Edge has no system fonts). Result: every time a link is shared on Twitter/Slack/LinkedIn, viewers see a generated card. Production pattern: `app/opengraph-image.tsx` (site default) + per-route overrides (e.g. `app/lessons/seo-metadata/opengraph-image.tsx`).",
            snippet: `// app/opengraph-image.tsx — site default
import { ImageResponse } from 'next/og';

export const alt = 'Living Notebook';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div style={{
        display: 'flex', width: '100%', height: '100%',
        background: 'linear-gradient(135deg, #020617, #0c4a6e)',
        color: 'white', alignItems: 'center', justifyContent: 'center',
        fontSize: 84, fontWeight: 700,
      }}>
        Living Notebook
      </div>
    ),
    size,
  );
}`,
        },
        sitemap: {
            heading: '§5 Dynamic sitemap.ts from the dictionary',
            description: "No hand-written XML. `app/sitemap.ts` exports a function returning an array of `MetadataRoute.Sitemap`. Next generates the `/sitemap.xml` file matching Google's Sitemaps protocol. In this notebook we iterate `app/_lib/dictionaries.ts` to emit one URL per lesson, with `alternates.languages` for IT/EN/UK (hreflang). When we add `/lessons/security-env`, the sitemap updates ITSELF on the next build, no touch.",
            snippet: `// app/sitemap.ts
import type { MetadataRoute } from 'next';
import { dictionaries } from './_lib/dictionaries';

const BASE = 'https://living-notebook.local';

export default function sitemap(): MetadataRoute.Sitemap {
  const lessons = dictionaries.it.modules.flatMap((m) => m.lessons);
  return [
    { url: BASE, lastModified: new Date(), priority: 1, changeFrequency: 'weekly' },
    ...lessons.map((l) => ({
      url: \`\${BASE}/lessons/\${l.slug}\`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: l.status === 'done' ? 0.8 : 0.3,
      alternates: {
        languages: {
          it: \`\${BASE}/lessons/\${l.slug}?lang=it\`,
          en: \`\${BASE}/lessons/\${l.slug}?lang=en\`,
          uk: \`\${BASE}/lessons/\${l.slug}?lang=uk\`,
        },
      },
    })),
  ];
}`,
        },
        robots: {
            heading: '§6 robots.ts as TypeScript',
            description: "Same pattern as sitemap: instead of a plain-text `robots.txt`, you export a typed object. Pros: typecheck (zero typos in directives), TypeScript powers (e.g. conditional `disallow` based on `NODE_ENV` to keep staging out of the index), refactor-friendly. Always link the `sitemap` at the bottom — it's one of the first things crawlers look for.",
            snippet: `// app/robots.ts
import type { MetadataRoute } from 'next';

const BASE = 'https://living-notebook.local';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/', '/lessons/*/protected'],
      },
    ],
    sitemap: \`\${BASE}/sitemap.xml\`,
    host: BASE,
  };
}`,
        },
        jsonLd: {
            heading: '§7 JSON-LD for rich results',
            description: "OpenGraph says \"this is how the page should look when shared\". JSON-LD (Schema.org) says \"this is WHAT the page IS\" — a Course, an Article, a Product. Google reads JSON-LD to generate **rich results** (rating stars, breadcrumbs, price). Emitted as `<script type=\"application/ld+json\">` in body or head. In Next: a tiny Server Component that `JSON.stringify(schema)` and emits via `<script>` with `dangerouslySetInnerHTML` — no XSS because WE are serializing the JSON.",
            snippet: `// _components/jsonld.tsx — Server Component
type Props = { schema: Record<string, unknown> };

export function JsonLd({ schema }: Props) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// In page.tsx
const courseSchema = {
  '@context': 'https://schema.org',
  '@type': 'Course',
  name: 'SEO & Metadata',
  description: 'Module 5 · Lesson 2 of Living Notebook',
  provider: { '@type': 'Organization', name: 'Living Notebook' },
};

<JsonLd schema={courseSchema} />`,
        },
    },
    decisionTable: {
        heading: '§8 Which tool to use?',
        intro: 'Scenario → API mapping.',
        rows: [
            {
                scenario: 'Landing, about, docs — fixed content',
                choice: 'export const metadata (static)',
            },
            {
                scenario: 'Blog post / product / user — depends on [slug]',
                choice: 'async generateMetadata({ params }) + memoized fetch',
            },
            {
                scenario: 'Uniform OG card site-wide',
                choice: 'app/opengraph-image.tsx (site default)',
            },
            {
                scenario: 'Custom OG card per lesson/post',
                choice: 'app/<route>/opengraph-image.tsx (segment override)',
            },
            {
                scenario: 'URL list for crawlers',
                choice: 'app/sitemap.ts iterating internal data',
            },
            {
                scenario: 'Control what crawlers index',
                choice: 'Typed app/robots.ts',
            },
            {
                scenario: 'Show up in rich results (stars, breadcrumbs)',
                choice: 'JSON-LD via <script type="application/ld+json">',
            },
            {
                scenario: 'Multi-language: tell Google about variants',
                choice: 'metadata.alternates.languages + sitemap alternates',
            },
        ],
    },
    labs: {
        heading: '🧪 Interactive labs',
        metaInspector: {
            badge: 'Lab 1',
            description: 'Open DevTools → Elements → find the `<head>`. You will find all the tags shown below. Switch language with the selector at the top → reload → `<title>` changes. The cards show the ACTUAL values read from the page, not a mockup.',
            titleLabel: '<title>',
            descriptionLabel: '<meta name="description">',
            ogTitleLabel: '<meta property="og:title">',
            ogImageLabel: '<meta property="og:image">',
            canonicalLabel: '<link rel="canonical">',
            jsonLdLabel: '<script type="application/ld+json">',
        },
        posts: {
            badge: 'Lab 2',
            description: 'Click a post → goes to a `[slug]` route with async `generateMetadata`. Open DevTools → Elements → notice `<title>` and `<meta og:image>` differ per post (computed from the slug, not hardcoded).',
            listHeading: 'Sample posts',
            visitLabel: 'Open →',
        },
        routes: {
            badge: 'Lab 3',
            description: "Next's file conventions expose real routes. Click → see the generated file.",
            sitemapLabel: '/sitemap.xml',
            robotsLabel: '/robots.txt',
            ogImageLabel: '/opengraph-image (site default)',
            lessonOgLabel: '/lessons/seo-metadata/opengraph-image',
        },
    },
    debug: {
        heading: '🔬 Debugging Lab',
        description: 'Six tools you use to audit ANY website for SEO.',
        steps: [
            '**View Source** (Cmd+U): scroll through the `<head>`. Count the `<meta>` tags. A good page has ~15-20 (title, description, charset, viewport, og:*, twitter:*, canonical, robots).',
            '**OG image preview**: open http://localhost:3000/opengraph-image — see the PNG generated by the site default OG. Then http://localhost:3000/lessons/seo-metadata/opengraph-image — see the lesson override. Real PNGs, generated on the fly on Edge.',
            '**sitemap.xml**: open http://localhost:3000/sitemap.xml — formatted XML, one `<url>` per lesson, `<xhtml:link rel="alternate" hreflang="…">` for IT/EN/UK.',
            '**robots.txt**: open http://localhost:3000/robots.txt — text output generated by `robots.ts`.',
            '**JSON-LD validator**: copy the contents of `<script type="application/ld+json">` and paste at https://validator.schema.org to see how Google interprets the Course schema.',
            "**Rich Results Test** (in production): public URL → https://search.google.com/test/rich-results. Local: use Lighthouse → SEO audit (Cmd+Shift+P → Run Lighthouse → SEO).",
            '**Social preview**: in production (public URL) use https://www.opengraph.xyz — paste the URL, see how it looks on Twitter/Facebook/LinkedIn without having to post. Locally you can only verify meta tags manually.',
        ],
    },
    postPage: {
        backLabel: '← Back to lesson',
        readingSuffix: 'min read',
        whatHappened: {
            heading: 'What just happened',
            steps: [
                'Next called `generateMetadata({ params })` on the server with `slug = "{slug}"`.',
                'The function read the `nb-lang` cookie to pick the language, then awaited `getPostBySlug(slug)` and returned a fresh `Metadata` object (title, description, OG, canonical) tailored to this post.',
                'Next composed those tags into the prerendered HTML. Open DevTools → Elements → `<head>` to see them.',
                "The parent segment's `opengraph-image.tsx` still wins for `og:image` because we didn't override it here.",
                'We additionally injected an Article JSON-LD block — view source to find `<script type="application/ld+json">`.',
            ],
        },
        tryThis: {
            heading: 'Try this',
            items: [
                'Switch the language at the top, reload this post — the body changes because the page reads the `nb-lang` cookie.',
                'Edit a `title` field in `_lib/posts.ts`, save — HMR re-runs `generateMetadata` and the `<title>` updates.',
                'Visit `/lessons/seo-metadata/posts/does-not-exist` — the metadata returns `robots: index:false` and the page calls `notFound()`.',
            ],
        },
        notFoundTitle: 'Post not found',
    },
};

// -----------------------------------------------------------------------------
// UK
// -----------------------------------------------------------------------------
const uk: Dictionary = {
    badge: 'Модуль 5 · Лекція 2',
    title: 'SEO та Metadata',
    intro: "Більше жодного ручного `<Head>` як у Next 12. В App Router HTML `<head>` створюється ТРЬОМА composable механізмами: експортованим об'єктом `metadata` (статичний), функцією `generateMetadata` (async, читає `params`), і **file conventions** (`opengraph-image.tsx`, `icon.tsx`, `robots.ts`, `sitemap.ts`). Все типізовано через `Metadata` із `next`, ніяких magic strings. У цій лекції побудуєш root зі статичним metadata, sub-route `[slug]` з async `generateMetadata`, динамічне OG зображення через `ImageResponse` на Edge runtime, `sitemap.ts`, який ітерує словник лекцій, і `robots.ts`, що лінкує sitemap. Бонус: **JSON-LD** (Schema.org Course) для rich results Google.",
    sections: {
        pipeline: {
            heading: '§1 Як Next будує <head>',
            description: 'Порядок пріоритету, від найнижчого до найвищого:\n\n1. **`metadata` / `generateMetadata` батьківських layouts** (глибше = специфічніше виграє через shallow merge)\n2. **`metadata` / `generateMetadata` сторінки** перевизначає layouts\n3. **File conventions** (`opengraph-image.tsx`, `icon.tsx`, `robots.ts`, `sitemap.ts`) — ЗАВЖДИ виграють над відповідними полями в об\'єкті `metadata`\n\nЗолоте правило: `metadata` і `generateMetadata` — **Server-only** (не експортуються з Client Component). Резолвляться ПЕРЕД рендером сторінки → потрапляють у первинний HTML разом із shell.\n\nЗ Next 14 **`viewport`** — окремий експорт (`export const viewport`), вже не всередині `metadata`. Причина: viewport може залежати від request (наприклад dark mode preference), а решта metadata — ні.',
            snippet: `// Cascade: root layout → lesson layout → page → file conventions

// app/layout.tsx
export const metadata: Metadata = {
  title: { template: '%s · Living Notebook', default: 'Living Notebook' },
  description: 'Інтерактивний Next.js 16 зошит',
};

// app/lessons/seo-metadata/page.tsx
export const metadata: Metadata = {
  title: 'SEO & Metadata',  // → '<title>SEO & Metadata · Living Notebook</title>'
  description: '…',          // перевизначає root
};

// app/lessons/seo-metadata/opengraph-image.tsx
// → виграє над root metadata.openGraph.images`,
        },
        staticMetadata: {
            heading: '§2 Статичний metadata',
            description: "Коли сторінка НЕ залежить від `params` / `searchParams` / зовнішніх даних, `export const metadata` — правильний вибір: читається на build time, нуль runtime cost. Патерн для landing, about, docs, internal dashboards. Підтримує `title.template` для branding (наприклад `\"%s · Living Notebook\"` автоматично додає `· Living Notebook` до всіх sub-routes).",
            snippet: `import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SEO & Metadata',
  description: 'Модуль 5 · Лекція 2 …',
  openGraph: {
    title: 'SEO & Metadata',
    description: '…',
    type: 'article',
    locale: 'uk_UA',
  },
  twitter: { card: 'summary_large_image' },
  alternates: {
    canonical: '/lessons/seo-metadata',
    languages: {
      it: '/lessons/seo-metadata?lang=it',
      en: '/lessons/seo-metadata?lang=en',
      uk: '/lessons/seo-metadata?lang=uk',
    },
  },
};`,
        },
        generateMetadata: {
            heading: '§3 Async generateMetadata',
            description: 'Коли `<head>` залежить від route param (slug блогу, id продукту, мова), використовуй `generateMetadata`: async, приймає `{ params, searchParams }`, повертає `Metadata`. Senior-трюки: (1) `fetch`, викликаний тут, **автоматично memoize**-иться — якщо сторінка викликає той самий fetch, він кешується. (2) Можеш дістатися `parent` metadata (root layout), щоб РОЗШИРИТИ її замість заміни (напр. зберегти site `og:images` + додати img посту). (3) З Next 16 `params` — це `Promise` (до 14 був синхронний): треба `await`.',
            snippet: `// app/lessons/seo-metadata/[slug]/page.tsx
import type { Metadata } from 'next';
import { getPostBySlug } from '../_lib/posts';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata(
  { params }: Props,
): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: 'Пост не знайдено' };
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author],
    },
  };
}`,
        },
        ogImage: {
            heading: '§4 Динамічне Open Graph зображення через ImageResponse',
            description: "Найпотужніший file convention Next: `opengraph-image.tsx` експортує default function, яка повертає `ImageResponse` (з `next/og`). Рендерить JSX-LIKE → PNG 1200×630 на льоту. Edge runtime → ні Node API, але `process.cwd()` працює для завантаження шрифтів (потрібно, бо Edge не має system fonts). Результат: щораз, коли посилання шерять у Twitter/Slack/LinkedIn, бачать згенеровану картку. Production-патерн: `app/opengraph-image.tsx` (default сайту) + override для маршрутів, які хочуть власну (напр. `app/lessons/seo-metadata/opengraph-image.tsx`).",
            snippet: `// app/opengraph-image.tsx — site default
import { ImageResponse } from 'next/og';

export const alt = 'Living Notebook';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div style={{
        display: 'flex', width: '100%', height: '100%',
        background: 'linear-gradient(135deg, #020617, #0c4a6e)',
        color: 'white', alignItems: 'center', justifyContent: 'center',
        fontSize: 84, fontWeight: 700,
      }}>
        Living Notebook
      </div>
    ),
    size,
  );
}`,
        },
        sitemap: {
            heading: '§5 Динамічний sitemap.ts зі словника',
            description: 'Жодного XML вручну. `app/sitemap.ts` експортує функцію, яка повертає масив `MetadataRoute.Sitemap`. Next генерує `/sitemap.xml` за протоколом Sitemaps Google. У цьому notebook ітеруємо `app/_lib/dictionaries.ts`, щоб видати один URL на лекцію, з `alternates.languages` для IT/EN/UK (hreflang). Коли додаємо `/lessons/security-env`, sitemap оновлюється САМ на наступному build, нічого не треба чіпати.',
            snippet: `// app/sitemap.ts
import type { MetadataRoute } from 'next';
import { dictionaries } from './_lib/dictionaries';

const BASE = 'https://living-notebook.local';

export default function sitemap(): MetadataRoute.Sitemap {
  const lessons = dictionaries.it.modules.flatMap((m) => m.lessons);
  return [
    { url: BASE, lastModified: new Date(), priority: 1, changeFrequency: 'weekly' },
    ...lessons.map((l) => ({
      url: \`\${BASE}/lessons/\${l.slug}\`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: l.status === 'done' ? 0.8 : 0.3,
      alternates: {
        languages: {
          it: \`\${BASE}/lessons/\${l.slug}?lang=it\`,
          en: \`\${BASE}/lessons/\${l.slug}?lang=en\`,
          uk: \`\${BASE}/lessons/\${l.slug}?lang=uk\`,
        },
      },
    })),
  ];
}`,
        },
        robots: {
            heading: '§6 robots.ts як TypeScript',
            description: "Той самий патерн, що й sitemap: замість plain-text `robots.txt` експортуєш типізований об'єкт. Плюси: typecheck (нуль опечаток у директивах), сила TypeScript (напр. conditional `disallow` залежно від `NODE_ENV`, щоб staging не потрапив в індекс), refactor-friendly. Завжди лінкуй `sitemap` у кінці — це одне з перших, що шукають crawlers.",
            snippet: `// app/robots.ts
import type { MetadataRoute } from 'next';

const BASE = 'https://living-notebook.local';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/', '/lessons/*/protected'],
      },
    ],
    sitemap: \`\${BASE}/sitemap.xml\`,
    host: BASE,
  };
}`,
        },
        jsonLd: {
            heading: '§7 JSON-LD для rich results',
            description: 'OpenGraph каже "ось як сторінка має виглядати при шерингу". JSON-LD (Schema.org) каже "ось ЩО ця сторінка є" — Курс, Стаття, Продукт. Google читає JSON-LD, щоб генерувати **rich results** (зірки рейтингу, breadcrumbs, ціна). Емітиться як `<script type="application/ld+json">` у body чи head. У Next: маленький Server Component, який `JSON.stringify(schema)` і емітить через `<script>` із `dangerouslySetInnerHTML` — нуль XSS, бо МИ серіалізуємо JSON.',
            snippet: `// _components/jsonld.tsx — Server Component
type Props = { schema: Record<string, unknown> };

export function JsonLd({ schema }: Props) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// In page.tsx
const courseSchema = {
  '@context': 'https://schema.org',
  '@type': 'Course',
  name: 'SEO & Metadata',
  description: 'Модуль 5 · Лекція 2 Living Notebook',
  provider: { '@type': 'Organization', name: 'Living Notebook' },
};

<JsonLd schema={courseSchema} />`,
        },
    },
    decisionTable: {
        heading: '§8 Який інструмент обрати?',
        intro: 'Сценарій → API.',
        rows: [
            {
                scenario: 'Landing, about, docs — фіксований контент',
                choice: 'export const metadata (статичний)',
            },
            {
                scenario: 'Blog пост / продукт / користувач — залежить від [slug]',
                choice: 'async generateMetadata({ params }) + memoized fetch',
            },
            {
                scenario: 'Уніформа OG картка для всього сайту',
                choice: 'app/opengraph-image.tsx (site default)',
            },
            {
                scenario: 'Кастомна OG картка для конкретної лекції/посту',
                choice: 'app/<route>/opengraph-image.tsx (segment override)',
            },
            {
                scenario: 'Список URL для crawlers',
                choice: 'app/sitemap.ts, який ітерує внутрішні дані',
            },
            {
                scenario: 'Контролювати, що індексують crawlers',
                choice: 'Типізований app/robots.ts',
            },
            {
                scenario: 'Потрапити в rich results (зірки, breadcrumbs)',
                choice: 'JSON-LD через <script type="application/ld+json">',
            },
            {
                scenario: 'Multi-language: сказати Google про варіанти',
                choice: 'metadata.alternates.languages + sitemap alternates',
            },
        ],
    },
    labs: {
        heading: '🧪 Інтерактивні лабораторії',
        metaInspector: {
            badge: 'Лаб 1',
            description: 'DevTools → Elements → знайди `<head>`. Знайдеш усі теги нижче. Переключи мову — перезавантаж — `<title>` зміниться. Картки показують РЕАЛЬНІ значення зі сторінки, не mockup.',
            titleLabel: '<title>',
            descriptionLabel: '<meta name="description">',
            ogTitleLabel: '<meta property="og:title">',
            ogImageLabel: '<meta property="og:image">',
            canonicalLabel: '<link rel="canonical">',
            jsonLdLabel: '<script type="application/ld+json">',
        },
        posts: {
            badge: 'Лаб 2',
            description: 'Click на пост → перехід на `[slug]` маршрут із async `generateMetadata`. DevTools → Elements → зверни увагу, що `<title>` і `<meta og:image>` різні для кожного посту (обчислені зі slug, не hardcoded).',
            listHeading: 'Приклади постів',
            visitLabel: 'Відкрити →',
        },
        routes: {
            badge: 'Лаб 3',
            description: 'File conventions Next відкривають реальні маршрути. Click → побачиш згенерований файл.',
            sitemapLabel: '/sitemap.xml',
            robotsLabel: '/robots.txt',
            ogImageLabel: '/opengraph-image (site default)',
            lessonOgLabel: '/lessons/seo-metadata/opengraph-image',
        },
    },
    debug: {
        heading: '🔬 Debugging Lab',
        description: 'Шість інструментів для SEO audit будь-якого сайту.',
        steps: [
            '**View Source** (Cmd+U): скролни через `<head>`. Порахуй `<meta>` теги. Гарна сторінка має ~15-20 (title, description, charset, viewport, og:*, twitter:*, canonical, robots).',
            '**OG image preview**: відкрий http://localhost:3000/opengraph-image — побачиш PNG, згенерований default OG сайту. Потім http://localhost:3000/lessons/seo-metadata/opengraph-image — override для лекції. Реальні PNG, згенеровані на льоту на Edge.',
            '**sitemap.xml**: відкрий http://localhost:3000/sitemap.xml — форматований XML, один `<url>` на лекцію, `<xhtml:link rel="alternate" hreflang="…">` для IT/EN/UK.',
            '**robots.txt**: відкрий http://localhost:3000/robots.txt — текстовий вивід, згенерований із `robots.ts`.',
            '**JSON-LD validator**: скопіюй вміст `<script type="application/ld+json">` і встав на https://validator.schema.org, щоб побачити, як Google інтерпретує Course schema.',
            "**Rich Results Test** (у production): публічний URL → https://search.google.com/test/rich-results. Локально: Lighthouse → SEO audit (Cmd+Shift+P → Run Lighthouse → SEO).",
            '**Social preview**: у production (публічний URL) https://www.opengraph.xyz — встав URL, побач, як виглядає у Twitter/Facebook/LinkedIn без публікації. Локально перевіриш тільки meta теги вручну.',
        ],
    },
    postPage: {
        backLabel: '← Назад до лекції',
        readingSuffix: 'хв читання',
        whatHappened: {
            heading: 'Що щойно сталося',
            steps: [
                'Next викликав `generateMetadata({ params })` на сервері з `slug = "{slug}"`.',
                'Функція прочитала cookie `nb-lang`, щоб обрати мову, потім await-нула `getPostBySlug(slug)` і повернула свіжий об\'єкт `Metadata` (title, description, OG, canonical), скроєний під цей пост.',
                'Next зкомпонував ці теги в prerendered HTML. DevTools → Elements → `<head>`, щоб їх побачити.',
                "`opengraph-image.tsx` батьківського сегмента все одно виграє для `og:image`, бо ми його тут не перевизначали.",
                'Додатково ми ін\'єктували Article JSON-LD блок — view-source, щоб знайти `<script type="application/ld+json">`.',
            ],
        },
        tryThis: {
            heading: 'Спробуй це',
            items: [
                'Переключи мову нагорі, перезавантаж цей пост — body змінюється, бо сторінка читає cookie `nb-lang`.',
                'Зміни поле `title` у `_lib/posts.ts`, збережи — HMR перезапустить `generateMetadata`, і `<title>` оновиться.',
                'Відвідай `/lessons/seo-metadata/posts/does-not-exist` — metadata повертає `robots: index:false`, і page викликає `notFound()`.',
            ],
        },
        notFoundTitle: 'Пост не знайдено',
    },
};

export const content: Record<Lang, Dictionary> = { it, en, uk };
