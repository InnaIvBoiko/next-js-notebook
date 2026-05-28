// =============================================================================
// LIVING NOTEBOOK · Inline i18n dictionaries (teaching stub)
// -----------------------------------------------------------------------------
// Convention: the `_lib` folder with the underscore prefix is a Next.js
// "private folder" — it is NOT mapped as a route. Perfect for utilities/data.
//
// The BASE language is Italian (it). EN and UK are translations.
// In production you use libraries like `next-intl` or the `app/[lang]/...`
// pattern. We will cover that in module 5 (/advanced-routing).
// =============================================================================

export type Lang = 'it' | 'en' | 'uk';

export const LANGS: { code: Lang; label: string; flag: string }[] = [
    { code: 'it', label: 'Italiano', flag: '🇮🇹' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'uk', label: 'Українська', flag: '🇺🇦' },
];

// Single dictionary shape — TypeScript guarantees every language has EXACTLY
// the same keys (autocomplete + zero typos).
type Dictionary = {
    brand: string;
    hero: {
        eyebrow: string;
        title: string;
        titleAccent: string;
        subtitle: string;
        ctaStart: string;
        ctaRoadmap: string;
    };
    status: {
        done: string;
        next: string;
        locked: string;
    };
    about: {
        title: string;
        body: string;
    };
    modules: {
        id: string;
        title: string;
        description: string;
        lessons: {
            slug: string;
            label: string;
            status: 'done' | 'next' | 'locked';
        }[];
    }[];
    footer: string;
};

// -----------------------------------------------------------------------------
// IT — Base
// -----------------------------------------------------------------------------
const it: Dictionary = {
    brand: 'Living Notebook',
    hero: {
        eyebrow: 'Quaderno interattivo · Next.js 16 + React 19',
        title: 'Impara Next.js',
        titleAccent: 'costruendolo.',
        subtitle:
            'Ogni rotta di questa app è una lezione viva: teoria architetturale, codice eseguibile e laboratori di debugging — tutto sul tuo Mac, in locale.',
        ctaStart: 'Inizia dalla prima lezione',
        ctaRoadmap: 'Vedi la roadmap',
    },
    status: {
        done: 'Completata',
        next: 'Prossima',
        locked: 'In arrivo',
    },
    about: {
        title: 'Come funziona',
        body: "Ogni modulo introduce un concetto chiave del moderno App Router. Le lezioni si costruiscono una sull'altra: prima l'architettura (Server vs Client), poi il fetching dati, lo stato, il full-stack, e infine performance e sicurezza.",
    },
    modules: [
        {
            id: 'M1',
            title: 'Architettura',
            description:
                "Le fondamenta dell'App Router: rendering, routing, layouts.",
            lessons: [
                {
                    slug: 'server-vs-client',
                    label: 'Server vs Client',
                    status: 'done',
                },
                {
                    slug: 'routing-basics',
                    label: 'Routing & Layouts',
                    status: 'done',
                },
                {
                    slug: 'dynamic-routes/[id]',
                    label: 'Rotte dinamiche',
                    status: 'locked',
                },
                {
                    slug: 'loading-and-errors',
                    label: 'Loading & Errors',
                    status: 'locked',
                },
            ],
        },
        {
            id: 'M2',
            title: 'Data Fetching & Cache',
            description:
                'Fetch lato server, caching, Server Actions, stato di mutazione.',
            lessons: [
                {
                    slug: 'server-fetching',
                    label: 'Server Fetching',
                    status: 'locked',
                },
                { slug: 'caching', label: 'Caching', status: 'locked' },
                {
                    slug: 'server-actions',
                    label: 'Server Actions',
                    status: 'locked',
                },
                {
                    slug: 'action-pending',
                    label: 'useFormStatus',
                    status: 'locked',
                },
            ],
        },
        {
            id: 'M3',
            title: 'Stato & Client',
            description: 'Gestione dello stato lato client a tutti i livelli.',
            lessons: [
                {
                    slug: 'context-provider',
                    label: 'Context Provider',
                    status: 'locked',
                },
                {
                    slug: 'zustand-store',
                    label: 'Zustand Store',
                    status: 'locked',
                },
                {
                    slug: 'tanstack-query',
                    label: 'TanStack Query',
                    status: 'locked',
                },
            ],
        },
        {
            id: 'M4',
            title: 'Full-Stack',
            description: 'API, database, autenticazione e middleware.',
            lessons: [
                { slug: 'api-routes', label: 'API Routes', status: 'locked' },
                {
                    slug: 'database-orm',
                    label: 'Database & ORM',
                    status: 'locked',
                },
                { slug: 'auth-setup', label: 'Auth.js', status: 'locked' },
                {
                    slug: 'middleware-logic',
                    label: 'Middleware',
                    status: 'locked',
                },
            ],
        },
        {
            id: 'M5',
            title: 'Performance & Sicurezza',
            description:
                'Ottimizzazione, SEO, sicurezza e deploy in produzione.',
            lessons: [
                {
                    slug: 'optimization-media',
                    label: 'Immagini & Font',
                    status: 'locked',
                },
                {
                    slug: 'seo-metadata',
                    label: 'SEO & Metadata',
                    status: 'locked',
                },
                {
                    slug: 'security-env',
                    label: 'Variabili & Sicurezza',
                    status: 'locked',
                },
                {
                    slug: 'advanced-routing',
                    label: 'Routing avanzato',
                    status: 'locked',
                },
                { slug: 'deploy-ready', label: 'Deploy', status: 'locked' },
            ],
        },
    ],
    footer: 'Quaderno personale · Costruito con Next.js 16, React 19 e Tailwind v4',
};

// -----------------------------------------------------------------------------
// EN — Translation
// -----------------------------------------------------------------------------
const en: Dictionary = {
    brand: 'Living Notebook',
    hero: {
        eyebrow: 'Interactive notebook · Next.js 16 + React 19',
        title: 'Learn Next.js',
        titleAccent: 'by building it.',
        subtitle:
            'Every route in this app is a live lesson: architectural theory, runnable code and debugging labs — all on your Mac, locally.',
        ctaStart: 'Start with lesson one',
        ctaRoadmap: 'View the roadmap',
    },
    status: {
        done: 'Completed',
        next: 'Up next',
        locked: 'Coming soon',
    },
    about: {
        title: 'How it works',
        body: 'Each module introduces a key concept of the modern App Router. Lessons build on each other: first architecture (Server vs Client), then data fetching, state, full-stack, and finally performance and security.',
    },
    modules: [
        {
            id: 'M1',
            title: 'Architecture',
            description:
                'Foundations of the App Router: rendering, routing, layouts.',
            lessons: [
                {
                    slug: 'server-vs-client',
                    label: 'Server vs Client',
                    status: 'done',
                },
                {
                    slug: 'routing-basics',
                    label: 'Routing & Layouts',
                    status: 'done',
                },
                {
                    slug: 'dynamic-routes/[id]',
                    label: 'Dynamic Routes',
                    status: 'locked',
                },
                {
                    slug: 'loading-and-errors',
                    label: 'Loading & Errors',
                    status: 'locked',
                },
            ],
        },
        {
            id: 'M2',
            title: 'Data Fetching & Cache',
            description:
                'Server fetching, caching, Server Actions, mutation state.',
            lessons: [
                {
                    slug: 'server-fetching',
                    label: 'Server Fetching',
                    status: 'locked',
                },
                { slug: 'caching', label: 'Caching', status: 'locked' },
                {
                    slug: 'server-actions',
                    label: 'Server Actions',
                    status: 'locked',
                },
                {
                    slug: 'action-pending',
                    label: 'useFormStatus',
                    status: 'locked',
                },
            ],
        },
        {
            id: 'M3',
            title: 'State & Client',
            description: 'Client-side state management at every level.',
            lessons: [
                {
                    slug: 'context-provider',
                    label: 'Context Provider',
                    status: 'locked',
                },
                {
                    slug: 'zustand-store',
                    label: 'Zustand Store',
                    status: 'locked',
                },
                {
                    slug: 'tanstack-query',
                    label: 'TanStack Query',
                    status: 'locked',
                },
            ],
        },
        {
            id: 'M4',
            title: 'Full-Stack',
            description: 'APIs, database, authentication and middleware.',
            lessons: [
                { slug: 'api-routes', label: 'API Routes', status: 'locked' },
                {
                    slug: 'database-orm',
                    label: 'Database & ORM',
                    status: 'locked',
                },
                { slug: 'auth-setup', label: 'Auth.js', status: 'locked' },
                {
                    slug: 'middleware-logic',
                    label: 'Middleware',
                    status: 'locked',
                },
            ],
        },
        {
            id: 'M5',
            title: 'Performance & Security',
            description: 'Optimization, SEO, security and production deploy.',
            lessons: [
                {
                    slug: 'optimization-media',
                    label: 'Images & Fonts',
                    status: 'locked',
                },
                {
                    slug: 'seo-metadata',
                    label: 'SEO & Metadata',
                    status: 'locked',
                },
                {
                    slug: 'security-env',
                    label: 'Env & Security',
                    status: 'locked',
                },
                {
                    slug: 'advanced-routing',
                    label: 'Advanced Routing',
                    status: 'locked',
                },
                { slug: 'deploy-ready', label: 'Deploy', status: 'locked' },
            ],
        },
    ],
    footer: 'Personal notebook · Built with Next.js 16, React 19 and Tailwind v4',
};

// -----------------------------------------------------------------------------
// UK — Translation
// -----------------------------------------------------------------------------
const uk: Dictionary = {
    brand: 'Living Notebook',
    hero: {
        eyebrow: 'Інтерактивний зошит · Next.js 16 + React 19',
        title: 'Вивчай Next.js',
        titleAccent: 'будуючи його.',
        subtitle:
            'Кожен маршрут цього додатка — це жива лекція: архітектурна теорія, робочий код і лабораторії з налагодження — все на твоєму Mac, локально.',
        ctaStart: 'Почати з першої лекції',
        ctaRoadmap: 'Переглянути дорожню карту',
    },
    status: {
        done: 'Завершено',
        next: 'Наступна',
        locked: 'Скоро',
    },
    about: {
        title: 'Як це працює',
        body: 'Кожен модуль вводить ключову концепцію сучасного App Router. Лекції будуються одна на одній: спочатку архітектура (Server vs Client), потім отримання даних, стан, full-stack, і нарешті продуктивність і безпека.',
    },
    modules: [
        {
            id: 'M1',
            title: 'Архітектура',
            description:
                'Основи App Router: рендеринг, маршрутизація, layouts.',
            lessons: [
                {
                    slug: 'server-vs-client',
                    label: 'Server vs Client',
                    status: 'done',
                },
                {
                    slug: 'routing-basics',
                    label: 'Routing & Layouts',
                    status: 'done',
                },
                {
                    slug: 'dynamic-routes/[id]',
                    label: 'Динамічні маршрути',
                    status: 'locked',
                },
                {
                    slug: 'loading-and-errors',
                    label: 'Loading & Errors',
                    status: 'locked',
                },
            ],
        },
        {
            id: 'M2',
            title: 'Отримання даних & Кеш',
            description:
                'Server fetching, кешування, Server Actions, стан мутацій.',
            lessons: [
                {
                    slug: 'server-fetching',
                    label: 'Server Fetching',
                    status: 'locked',
                },
                { slug: 'caching', label: 'Кешування', status: 'locked' },
                {
                    slug: 'server-actions',
                    label: 'Server Actions',
                    status: 'locked',
                },
                {
                    slug: 'action-pending',
                    label: 'useFormStatus',
                    status: 'locked',
                },
            ],
        },
        {
            id: 'M3',
            title: 'Стан & Клієнт',
            description: 'Управління клієнтським станом на всіх рівнях.',
            lessons: [
                {
                    slug: 'context-provider',
                    label: 'Context Provider',
                    status: 'locked',
                },
                {
                    slug: 'zustand-store',
                    label: 'Zustand Store',
                    status: 'locked',
                },
                {
                    slug: 'tanstack-query',
                    label: 'TanStack Query',
                    status: 'locked',
                },
            ],
        },
        {
            id: 'M4',
            title: 'Full-Stack',
            description: 'API, бази даних, автентифікація та middleware.',
            lessons: [
                { slug: 'api-routes', label: 'API Routes', status: 'locked' },
                {
                    slug: 'database-orm',
                    label: 'Database & ORM',
                    status: 'locked',
                },
                { slug: 'auth-setup', label: 'Auth.js', status: 'locked' },
                {
                    slug: 'middleware-logic',
                    label: 'Middleware',
                    status: 'locked',
                },
            ],
        },
        {
            id: 'M5',
            title: 'Продуктивність & Безпека',
            description: 'Оптимізація, SEO, безпека та production deploy.',
            lessons: [
                {
                    slug: 'optimization-media',
                    label: 'Зображення & Шрифти',
                    status: 'locked',
                },
                {
                    slug: 'seo-metadata',
                    label: 'SEO & Metadata',
                    status: 'locked',
                },
                {
                    slug: 'security-env',
                    label: 'Env & Безпека',
                    status: 'locked',
                },
                {
                    slug: 'advanced-routing',
                    label: 'Розширена маршрутизація',
                    status: 'locked',
                },
                { slug: 'deploy-ready', label: 'Deploy', status: 'locked' },
            ],
        },
    ],
    footer: 'Особистий зошит · Побудовано з Next.js 16, React 19 та Tailwind v4',
};

// Exported map — the single object the rest of the app will import.
export const dictionaries: Record<Lang, Dictionary> = { it, en, uk };

export type { Dictionary };
