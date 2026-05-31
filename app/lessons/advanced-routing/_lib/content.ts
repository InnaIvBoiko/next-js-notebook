// =============================================================================
// app/lessons/advanced-routing/_lib/content.ts
// Inline i18n dictionary for Module 5 · Lesson 4 (Advanced Routing).
// =============================================================================

import type { Lang } from '../../../_lib/dictionaries';

type Section = { heading: string; description: string; snippet: string };

type Dictionary = {
    badge: string;
    title: string;
    intro: string;
    sections: {
        routeGroups: Section;
        privateFolders: Section;
        parallelRoutes: Section;
        defaultJs: Section;
        interceptingRoutes: Section;
        catchAll: Section;
        useSegment: Section;
    };
    decisionTable: {
        heading: string;
        intro: string;
        rows: { scenario: string; choice: string }[];
    };
    labs: {
        heading: string;
        dashboard: {
            badge: string;
            description: string;
            openLabel: string;
        };
        gallery: {
            badge: string;
            description: string;
            openLabel: string;
            modalCloseLabel: string;
            backLabel: string;
        };
        crumbs: {
            badge: string;
            description: string;
            tryLabel: string;
            example1: string;
            example2: string;
            example3: string;
        };
    };
    debug: { heading: string; description: string; steps: string[] };
    // Strings used by the LAB sub-routes (Server Components — picked via the
    // `nb-lang` cookie because useLang() is a Client-only Context hook).
    subroutes: {
        backToLesson: string;
        dashboard: {
            badge: string;
            title: string;
            description: string;
            analyticsSlot: string;
            teamSlot: string;
            delayedSuffix: string;
            thisWeek: string;
            currentlyActive: string;
            roles: {
                lead: string;
                designer: string;
                pm: string;
                sre: string;
            };
            statuses: {
                reviewing: string;
                tokens: string;
                planning: string;
                onCall: string;
            };
        };
        gallery: {
            badge: string;
            title: string;
            description: string;
            fullPageBadge: string;
            backToGallery: string;
            modalFootnote: string;
        };
        crumbs: {
            badge: string;
            title: string;
            description: string;
            serverBadge: string;
            clientBadge: string;
            serverFrom: string;
            clientFrom: string;
            emptyState: string;
        };
    };
};

// -----------------------------------------------------------------------------
// IT — base
// -----------------------------------------------------------------------------
const it: Dictionary = {
    badge: 'Modulo 5 · Lezione 4',
    title: 'Routing avanzato',
    intro: "Le prime tre lezioni hanno coperto il routing \"base\" (Server Components, dynamic `[id]`, layouts, loading/error). Questa lezione tira fuori i 5 trucchi che separano Next dagli altri framework: **route groups** `(group)` per organizzare senza che cambi l'URL, **parallel routes** `@slot` per renderizzare DUE pagine nello stesso layout (dashboard con @analytics e @team che streamano in parallelo), **intercepting routes** `(..)folder` per la signature feature \"click → modal, paste URL → page intera\", **default.tsx** come fallback obbligatorio dei slot non match-ati, e **`useSelectedLayoutSegment`** per gli active link. Sotto, tre lab vivi: un dashboard parallel, una gallery con modal-from-link, breadcrumbs catch-all.",
    sections: {
        routeGroups: {
            heading: '§1 Route Groups — cartelle che non appaiono nell\'URL',
            description: "Una cartella che inizia con `(parentesi)` viene **ignorata nell'URL** ma resta un livello di routing. Serve a due cose: (1) organizzare il codice in sezioni (es. `(marketing)`, `(app)`) senza che l'URL diventi `/marketing/about`, (2) avere DUE root layouts diversi nello stesso codebase — un `(marketing)/layout.tsx` con header + footer per la landing, e un `(app)/layout.tsx` con sidebar per la dashboard. Le due viste hanno UX completamente diverse ma URL puliti.",
            snippet: `// Cartelle:
app/
  (marketing)/
    layout.tsx        ← header marketing + footer
    page.tsx          ← URL = '/'
    about/page.tsx    ← URL = '/about'
  (app)/
    layout.tsx        ← sidebar + topbar dashboard
    dashboard/page.tsx ← URL = '/dashboard'
    settings/page.tsx ← URL = '/settings'

// L'URL NON contiene '(marketing)' o '(app)'.
// I due layout si applicano in modo MUTUAMENTE ESCLUSIVO.`,
        },
        privateFolders: {
            heading: "§2 Private Folders — l'_underscore",
            description: "Una cartella con `_underscore` (es. `_components`, `_lib`) è **fuori dal sistema di routing**. Nessun `page.tsx` al suo interno diventa una route. Le usi per: componenti, utility, hook, server actions co-locati con la lezione. È quello che ho usato in TUTTE le lezioni del notebook (`_components/`, `_lib/`). Cosa differisce dai route groups `(parens)`: i private folders **non possono contenere `page.tsx`** che diventi una rotta; i route groups sì, semplicemente non aggiungono livelli all'URL.",
            snippet: `app/lessons/advanced-routing/
  _components/        ← privato, niente routing
    photo-grid.tsx
    modal.tsx
  _lib/               ← privato
    photos.ts
    content.ts
  page.tsx            ← URL = '/lessons/advanced-routing'
  dashboard/          ← regolare
    page.tsx          ← URL = '/lessons/advanced-routing/dashboard'`,
        },
        parallelRoutes: {
            heading: '§3 Parallel Routes — N pagine nello stesso layout',
            description: "Crei cartelle `@nome` (esempio `@analytics`, `@team`) a fianco di `page.tsx`. Diventano **slot nominati** che il `layout.tsx` riceve come props. Il `layout.tsx` può renderizzare `children`, `@analytics`, `@team` IN PARALLELO. Ogni slot ha la sua `loading.tsx` indipendente → streaming separato (vedi gli skeleton arrivare uno alla volta). Pattern produzione: il dashboard di Vercel, Linear, Stripe sono tutti costruiti così. Nota chiave: TUTTI gli slot dello stesso livello devono avere la stessa modalità di rendering — non puoi mischiare uno statico e uno dinamico.",
            snippet: `// app/lessons/advanced-routing/dashboard/layout.tsx
export default function DashboardLayout({
  children,
  analytics,
  team,
}: {
  children: React.ReactNode;
  analytics: React.ReactNode;
  team: React.ReactNode;
}) {
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="col-span-2">{children}</div>
      <section>{analytics}</section>
      <section>{team}</section>
    </div>
  );
}

// Cartelle:
dashboard/
  layout.tsx
  page.tsx              ← \`children\`
  @analytics/page.tsx   ← prop \`analytics\`
  @team/page.tsx        ← prop \`team\``,
        },
        defaultJs: {
            heading: '§4 default.tsx — il fallback obbligatorio',
            description: "Bug #1 con i parallel routes: navighi a `/dashboard/settings` e il browser fa **hard refresh** → 404. Perché? Lo slot `@analytics` non ha una corrispondenza per `/settings`, Next non sa cosa renderizzare lì. Soluzione: `default.tsx` in OGNI slot. Su soft-nav Next mantiene l'ultimo stato attivo dello slot; su hard-nav usa il `default.tsx`. Senza, → 404. Anche `children` ha un suo `default.tsx` implicito (la sua `page.tsx`), ma se hai un parallel route a fianco devi essere esplicito.",
            snippet: `// app/lessons/advanced-routing/dashboard/@analytics/default.tsx
// Renderizzato quando lo slot non ha match (hard nav, refresh).
export default function AnalyticsDefault() {
  return (
    <div className="text-slate-500 italic">
      No analytics view selected.
    </div>
  );
}

// Stessa cosa per @team/default.tsx.
// SENZA questi file: refresh = 404.`,
        },
        interceptingRoutes: {
            heading: "§5 Intercepting Routes — la signature feature di Next",
            description: "Il pattern che NON esiste in altri framework. Crei una cartella `(..)photos/[id]` dentro `@modal/` e Next intercetta la navigazione verso `/gallery/photos/[id]` SOLO se viene da un `<Link>` interno → mostra il modal. Se l'utente fa paste della URL in una nuova tab, o ricarica con F5 → niente intercetto, vede la page full. Stesso URL, due UX. Risolve quattro problemi di colpo: modal shareable via URL, contesto preservato al refresh, chiusura su back-button, riapertura su forward.\n\nIl matcher `(..)` si legge come `../` relativo, ma in SEGMENT-space: `@modal` è un slot e non conta come segmento. Quindi `@modal/(..)photos/` punta a `photos/` un livello sopra dove vive @modal.",
            snippet: `gallery/
  layout.tsx           ← renderizza {children} + {modal}
  page.tsx             ← griglia thumbnails
  default.tsx          ← fallback children
  photos/[id]/page.tsx ← PAGE INTERA (URL diretto)
  @modal/
    default.tsx        ← \`return null\` quando no match
    (..)photos/[id]/page.tsx  ← MODAL (intercept)

// gallery/layout.tsx
export default function GalleryLayout({ children, modal }: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <>
      {children}
      {modal}        {/* renderizza il modal SE c'è un match */}
    </>
  );
}`,
        },
        catchAll: {
            heading: '§6 Catch-all & Optional Catch-all',
            description: "`[...slug]` matcha **uno o più** segmenti — `params.slug` arriva come array. `[[...slug]]` matcha **zero o più** segmenti (slug può essere `undefined`). Usi tipici: breadcrumb (un solo file matcha qualsiasi profondità), CMS routes (`pages/[...path]` per qualsiasi URL del CMS), redirect handlers.\n\nSotto Next 16 `params` è una `Promise` come negli altri dynamic routes — devi `await`.",
            snippet: `// app/.../crumbs/[[...path]]/page.tsx
type Props = {
  params: Promise<{ path?: string[] }>;
};

export default async function CrumbsPage({ params }: Props) {
  const { path = [] } = await params;
  // /crumbs               → path = []
  // /crumbs/a             → path = ['a']
  // /crumbs/a/b/c         → path = ['a', 'b', 'c']

  return <Breadcrumbs segments={path} />;
}`,
        },
        useSegment: {
            heading: '§7 useSelectedLayoutSegment — active link senza casino',
            description: "Hook client-side che ritorna il **segmento attualmente attivo sotto questo layout**. Usato per stilare un tab attivo, un link nella sidebar, un breadcrumb. Alternativa stupida sarebbe leggere `usePathname()` e fare `pathname.startsWith(href)` — ma fallisce con dynamic segments e route groups.\n\nC'è anche `useSelectedLayoutSegments()` (plurale) che ritorna l'array completo dei segmenti — utile per breadcrumb full.",
            snippet: `'use client';
import { useSelectedLayoutSegment } from 'next/navigation';

export function TabBar() {
  const active = useSelectedLayoutSegment();
  // Su /dashboard → active = null (siamo nella page del layout)
  // Su /dashboard/profile → active = 'profile'
  // Su /dashboard/settings → active = 'settings'

  return (
    <nav>
      <Link href="/dashboard"
        className={active === null ? 'font-bold' : ''}>
        Home
      </Link>
      <Link href="/dashboard/profile"
        className={active === 'profile' ? 'font-bold' : ''}>
        Profile
      </Link>
    </nav>
  );
}`,
        },
    },
    decisionTable: {
        heading: '§8 Quando usare quale primitivo?',
        intro: 'Mapping scenario → API.',
        rows: [
            {
                scenario: 'Organizzare cartelle senza cambiare URL',
                choice: '(group)/ — Route Groups',
            },
            {
                scenario: 'Due layouts diversi nella stessa app',
                choice: '(marketing)/layout.tsx + (app)/layout.tsx',
            },
            {
                scenario: 'Co-locare components/lib accanto a una lezione',
                choice: '_underscore/ — Private Folders',
            },
            {
                scenario: 'Dashboard con N panel che streamano in parallelo',
                choice: '@slot1, @slot2, @slot3 — Parallel Routes',
            },
            {
                scenario: 'Modal-from-link condivisibile via URL',
                choice: '@modal/(..)foo/[id] — Intercepting + Parallel',
            },
            {
                scenario: 'Breadcrumb / route CMS con profondità arbitraria',
                choice: '[...slug] o [[...slug]] — Catch-all',
            },
            {
                scenario: 'Active state su tab/link in un layout',
                choice: 'useSelectedLayoutSegment(s)',
            },
            {
                scenario: 'Fallback quando un slot parallel non ha match',
                choice: 'default.tsx — obbligatorio',
            },
        ],
    },
    labs: {
        heading: '🧪 Lab interattivi',
        dashboard: {
            badge: 'Lab 1',
            description: "Dashboard con due slot in parallelo (@analytics + @team). Ogni slot ha il suo `loading.tsx` — apri DevTools → Network → throttle Slow 3G → ricarica: vedi gli skeleton dei due slot apparire indipendentemente. Pattern Vercel/Linear/Stripe.",
            openLabel: 'Apri il dashboard →',
        },
        gallery: {
            badge: 'Lab 2',
            description: "La signature feature. Click su una thumbnail → vedi il modal con la foto, l'URL diventa `/lessons/advanced-routing/gallery/photos/3`. Premi Cmd+L per copiarla, aprila in una nuova tab → vedi la PAGE INTERA, non il modal. Stesso URL, due UX a seconda dell'origine.",
            openLabel: 'Apri la gallery →',
            modalCloseLabel: 'Chiudi',
            backLabel: '← Torna alla gallery',
        },
        crumbs: {
            badge: 'Lab 3',
            description: "Catch-all `[[...path]]` + `useSelectedLayoutSegments`. Click sugli esempi → vedi i segmenti del path renderizzati come breadcrumb, e nel layout il primo segmento highlight-ato come tab attivo.",
            tryLabel: 'Prova →',
            example1: '/crumbs',
            example2: '/crumbs/dashboards/analytics',
            example3: '/crumbs/products/electronics/laptops/macbook',
        },
    },
    debug: {
        heading: '🔬 Debugging Lab',
        description: 'Sei controlli che fai ogni volta che ti tocca toccare i parallel/intercepting routes.',
        steps: [
            '**Il modal non si apre su click**: probabilmente hai sbagliato il matcher (..) → la cartella deve essere `@modal/(..)photos`, NON `(.)photos` (lo so perché l\'ho sbagliato anch\'io). Verifica anche che il layout del parent renderizzi `{modal}`.',
            "**404 al refresh del modal**: non hai `@modal/default.tsx`. Aggiungilo con `export default function() { return null; }`. Stessa cosa per `default.tsx` di `children` se hai parallel routes a fianco.",
            "**Slot diventa stale dopo soft nav**: l'`active state` di Next ricorda l'ultimo render dello slot, anche se l'URL è cambiato. Soluzione: rinfresca con `router.refresh()` o aggiungi una `key` al children che cambia con l'URL.",
            "**Conflitto static/dynamic**: \"Some slots are static, some are dynamic\" → tutti gli slot dello stesso livello devono avere lo stesso rendering mode. Aggiungi un `await connection()` o un `cookies()` ai dynamic per allinearli.",
            "**Active link non si aggiorna**: stai usando `usePathname` invece di `useSelectedLayoutSegment`? Il primo è fragile con dynamic segments. Switch al secondo.",
            "**Modal renderizzato due volte**: il layout sta probabilmente renderizzando `{children}` E `{modal}` come SIBLING, ma `children` include già la photo full page. Tipica trappola del refresh: `{modal}` rende il modal, e `{children}` rende il photo. Soluzione: in `(..)photos/[id]/page.tsx` puoi `redirect()` se vuoi solo il modal, oppure accettare la sovrapposizione come feature (sotto il modal c'è la galleria, che è quello che vuoi).",
        ],
    },
    subroutes: {
        backToLesson: '← Torna alla lezione',
        dashboard: {
            badge: 'Demo parallel routes',
            title: 'Dashboard con @analytics + @team',
            description:
                'Ogni pannello sotto è uno slot parallelo separato. Condividono questo layout ma ognuno ha la sua `page.tsx`, `loading.tsx` (con un ritardo artificiale di 1.2s per vedere lo streaming) e `default.tsx`. Throttla la rete in DevTools → ricarica e guarda i due skeleton arrivare indipendentemente.',
            analyticsSlot: 'slot @analytics',
            teamSlot: 'slot @team',
            delayedSuffix: 'ritardo',
            thisWeek: 'Questa settimana',
            currentlyActive: 'Attualmente attivi',
            roles: {
                lead: 'Lead engineer',
                designer: 'Designer',
                pm: 'PM',
                sre: 'SRE',
            },
            statuses: {
                reviewing: 'review PR #482',
                tokens: 'aggiorna i tokens',
                planning: 'sprint planning',
                onCall: 'on-call · tutto verde',
            },
        },
        gallery: {
            badge: 'Demo intercepting routes',
            title: 'Gallery',
            description:
                'Click su una thumbnail → si apre il modal, URL diventa `/lessons/advanced-routing/gallery/photos/<id>`. Copia quella URL, paste in una nuova tab → page intera, niente modal.',
            fullPageBadge: 'page intera (URL diretto)',
            backToGallery: '← Torna alla gallery',
            modalFootnote:
                'Intercettato via `@modal/(..)photos/[id]/page.tsx`. Paste questa URL in una nuova tab per vedere la page intera.',
        },
        crumbs: {
            badge: 'Demo catch-all',
            title: 'Breadcrumb da un singolo file',
            description:
                "Un solo `[[...path]]/page.tsx` renderizza tutte queste URL. Lato server `params.path` e lato client `useSelectedLayoutSegments()` concordano su come è fatto il path.",
            serverBadge: 'server',
            clientBadge: 'client',
            serverFrom: 'da `params.path`',
            clientFrom: 'da `useSelectedLayoutSegments()`',
            emptyState: '(nessun segmento — sei su `/crumbs`)',
        },
    },
};

// -----------------------------------------------------------------------------
// EN
// -----------------------------------------------------------------------------
const en: Dictionary = {
    badge: 'Module 5 · Lesson 4',
    title: 'Advanced Routing',
    intro: 'The first three lessons covered "basic" routing (Server Components, dynamic `[id]`, layouts, loading/error). This lesson pulls out the 5 tricks that set Next apart from other frameworks: **route groups** `(group)` to organise without affecting the URL, **parallel routes** `@slot` to render TWO pages in the same layout (dashboard with @analytics and @team streaming in parallel), **intercepting routes** `(..)folder` for the signature "click → modal, paste URL → full page" feature, **default.tsx** as the mandatory fallback for unmatched slots, and **`useSelectedLayoutSegment`** for active links. Below: three live labs — parallel dashboard, modal-from-link gallery, catch-all breadcrumbs.',
    sections: {
        routeGroups: {
            heading: "§1 Route Groups — folders that don't show up in the URL",
            description: "A folder that starts with `(parens)` is **ignored in the URL** but still acts as a routing level. Two uses: (1) organising code into sections (e.g. `(marketing)`, `(app)`) without the URL becoming `/marketing/about`, (2) having TWO different root layouts in the same codebase — a `(marketing)/layout.tsx` with header + footer for the landing, and an `(app)/layout.tsx` with sidebar for the dashboard. Two completely different UXs, clean URLs.",
            snippet: `// Folders:
app/
  (marketing)/
    layout.tsx        ← marketing header + footer
    page.tsx          ← URL = '/'
    about/page.tsx    ← URL = '/about'
  (app)/
    layout.tsx        ← dashboard sidebar + topbar
    dashboard/page.tsx ← URL = '/dashboard'
    settings/page.tsx ← URL = '/settings'

// The URL does NOT contain '(marketing)' or '(app)'.
// The two layouts apply MUTUALLY EXCLUSIVELY.`,
        },
        privateFolders: {
            heading: "§2 Private Folders — the _underscore",
            description: "A folder with `_underscore` (e.g. `_components`, `_lib`) is **outside the routing system**. No `page.tsx` inside it becomes a route. Use them for components, utilities, hooks, server actions co-located with the lesson. It's what I used in EVERY lesson in the notebook (`_components/`, `_lib/`). Difference vs route groups `(parens)`: private folders **cannot contain a `page.tsx`** that becomes a route; route groups can — they just don't add URL levels.",
            snippet: `app/lessons/advanced-routing/
  _components/        ← private, no routing
    photo-grid.tsx
    modal.tsx
  _lib/               ← private
    photos.ts
    content.ts
  page.tsx            ← URL = '/lessons/advanced-routing'
  dashboard/          ← regular
    page.tsx          ← URL = '/lessons/advanced-routing/dashboard'`,
        },
        parallelRoutes: {
            heading: '§3 Parallel Routes — N pages in the same layout',
            description: 'You create `@name` folders (e.g. `@analytics`, `@team`) next to `page.tsx`. They become **named slots** that the `layout.tsx` receives as props. The `layout.tsx` can render `children`, `@analytics`, `@team` IN PARALLEL. Each slot has its own `loading.tsx` → independent streaming (you see skeletons land one at a time). Production pattern: Vercel, Linear, Stripe dashboards are all built this way. Key gotcha: ALL slots at the same level must share the same rendering mode — you cannot mix one static and one dynamic.',
            snippet: `// app/lessons/advanced-routing/dashboard/layout.tsx
export default function DashboardLayout({
  children,
  analytics,
  team,
}: {
  children: React.ReactNode;
  analytics: React.ReactNode;
  team: React.ReactNode;
}) {
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="col-span-2">{children}</div>
      <section>{analytics}</section>
      <section>{team}</section>
    </div>
  );
}

// Folders:
dashboard/
  layout.tsx
  page.tsx              ← \`children\`
  @analytics/page.tsx   ← \`analytics\` prop
  @team/page.tsx        ← \`team\` prop`,
        },
        defaultJs: {
            heading: '§4 default.tsx — the mandatory fallback',
            description: "Bug #1 with parallel routes: you navigate to `/dashboard/settings` and the browser **hard refreshes** → 404. Why? The `@analytics` slot has no match for `/settings`, Next doesn't know what to render there. Fix: `default.tsx` in EVERY slot. On soft-nav Next keeps the slot's last active state; on hard-nav it falls back to `default.tsx`. Without one → 404. `children` has an implicit `default.tsx` (its `page.tsx`), but if you have a parallel route next to it you must be explicit.",
            snippet: `// app/lessons/advanced-routing/dashboard/@analytics/default.tsx
// Rendered when the slot has no match (hard nav, refresh).
export default function AnalyticsDefault() {
  return (
    <div className="text-slate-500 italic">
      No analytics view selected.
    </div>
  );
}

// Same for @team/default.tsx.
// WITHOUT these: refresh = 404.`,
        },
        interceptingRoutes: {
            heading: "§5 Intercepting Routes — Next's signature feature",
            description: "A pattern that does NOT exist in other frameworks. You create a `(..)photos/[id]` folder inside `@modal/`, and Next intercepts navigation to `/gallery/photos/[id]` ONLY when it comes from an internal `<Link>` → shows the modal. If the user pastes the URL into a new tab, or hits F5 → no interception, they see the full page. Same URL, two UXs. It solves four problems at once: URL-shareable modals, context preserved on refresh, close on back-button, reopen on forward.\n\nThe `(..)` matcher reads like `../` relative, but in SEGMENT space: `@modal` is a slot, not a segment. So `@modal/(..)photos/` points to a `photos/` one level above where @modal lives.",
            snippet: `gallery/
  layout.tsx           ← renders {children} + {modal}
  page.tsx             ← thumbnail grid
  default.tsx          ← children fallback
  photos/[id]/page.tsx ← FULL PAGE (direct URL)
  @modal/
    default.tsx        ← \`return null\` when no match
    (..)photos/[id]/page.tsx  ← MODAL (intercept)

// gallery/layout.tsx
export default function GalleryLayout({ children, modal }: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <>
      {children}
      {modal}        {/* renders the modal IF there is a match */}
    </>
  );
}`,
        },
        catchAll: {
            heading: '§6 Catch-all & Optional Catch-all',
            description: '`[...slug]` matches **one or more** segments — `params.slug` arrives as an array. `[[...slug]]` matches **zero or more** segments (slug can be `undefined`). Typical uses: breadcrumbs (one file matches any depth), CMS routes (`pages/[...path]` for any CMS URL), redirect handlers.\n\nUnder Next 16 `params` is a `Promise` like in other dynamic routes — you must `await`.',
            snippet: `// app/.../crumbs/[[...path]]/page.tsx
type Props = {
  params: Promise<{ path?: string[] }>;
};

export default async function CrumbsPage({ params }: Props) {
  const { path = [] } = await params;
  // /crumbs               → path = []
  // /crumbs/a             → path = ['a']
  // /crumbs/a/b/c         → path = ['a', 'b', 'c']

  return <Breadcrumbs segments={path} />;
}`,
        },
        useSegment: {
            heading: '§7 useSelectedLayoutSegment — active link without the mess',
            description: "Client-side hook that returns the **segment currently active under this layout**. Used to style an active tab, sidebar link, breadcrumb. Naive alternative: read `usePathname()` and do `pathname.startsWith(href)` — but it falls apart with dynamic segments and route groups.\n\nThere's also `useSelectedLayoutSegments()` (plural) that returns the full segments array — useful for full breadcrumbs.",
            snippet: `'use client';
import { useSelectedLayoutSegment } from 'next/navigation';

export function TabBar() {
  const active = useSelectedLayoutSegment();
  // On /dashboard → active = null (we are on the layout's page)
  // On /dashboard/profile → active = 'profile'
  // On /dashboard/settings → active = 'settings'

  return (
    <nav>
      <Link href="/dashboard"
        className={active === null ? 'font-bold' : ''}>
        Home
      </Link>
      <Link href="/dashboard/profile"
        className={active === 'profile' ? 'font-bold' : ''}>
        Profile
      </Link>
    </nav>
  );
}`,
        },
    },
    decisionTable: {
        heading: '§8 When to use which primitive?',
        intro: 'Scenario → API mapping.',
        rows: [
            {
                scenario: 'Organise folders without changing URL',
                choice: '(group)/ — Route Groups',
            },
            {
                scenario: 'Two different layouts in the same app',
                choice: '(marketing)/layout.tsx + (app)/layout.tsx',
            },
            {
                scenario: 'Co-locate components/lib next to a lesson',
                choice: '_underscore/ — Private Folders',
            },
            {
                scenario: 'Dashboard with N panels streaming in parallel',
                choice: '@slot1, @slot2, @slot3 — Parallel Routes',
            },
            {
                scenario: 'URL-shareable modal-from-link',
                choice: '@modal/(..)foo/[id] — Intercepting + Parallel',
            },
            {
                scenario: 'Breadcrumb / CMS route with arbitrary depth',
                choice: '[...slug] or [[...slug]] — Catch-all',
            },
            {
                scenario: 'Active state on tab/link in a layout',
                choice: 'useSelectedLayoutSegment(s)',
            },
            {
                scenario: 'Fallback when a parallel slot has no match',
                choice: 'default.tsx — mandatory',
            },
        ],
    },
    labs: {
        heading: '🧪 Interactive labs',
        dashboard: {
            badge: 'Lab 1',
            description: "Dashboard with two parallel slots (@analytics + @team). Each slot has its own `loading.tsx` — open DevTools → Network → throttle Slow 3G → reload: you'll see the two slot skeletons appear independently. Vercel/Linear/Stripe pattern.",
            openLabel: 'Open dashboard →',
        },
        gallery: {
            badge: 'Lab 2',
            description: "The signature feature. Click a thumbnail → you see the modal with the photo, the URL becomes `/lessons/advanced-routing/gallery/photos/3`. Press Cmd+L to copy it, open in a new tab → you see the FULL PAGE, not the modal. Same URL, two UXs depending on the origin.",
            openLabel: 'Open gallery →',
            modalCloseLabel: 'Close',
            backLabel: '← Back to gallery',
        },
        crumbs: {
            badge: 'Lab 3',
            description: "Catch-all `[[...path]]` + `useSelectedLayoutSegments`. Click an example → you see the path segments rendered as breadcrumbs, and in the layout the first segment highlighted as the active tab.",
            tryLabel: 'Try →',
            example1: '/crumbs',
            example2: '/crumbs/dashboards/analytics',
            example3: '/crumbs/products/electronics/laptops/macbook',
        },
    },
    debug: {
        heading: '🔬 Debugging Lab',
        description: 'Six checks you do every time you touch parallel/intercepting routes.',
        steps: [
            "**Modal doesn't open on click**: you probably got the matcher wrong → the folder must be `@modal/(..)photos`, NOT `(.)photos` (I know because I got it wrong too). Also check the parent layout renders `{modal}`.",
            "**404 on modal refresh**: you're missing `@modal/default.tsx`. Add `export default function() { return null; }`. Same for `children`'s `default.tsx` if you have parallel routes next to it.",
            "**Slot becomes stale after soft nav**: Next remembers the slot's last render even when the URL changes. Fix: `router.refresh()` or add a `key` to children that changes with the URL.",
            "**Static/dynamic conflict**: \"Some slots are static, some are dynamic\" → all slots at the same level must share the rendering mode. Add an `await connection()` or a `cookies()` to the dynamic ones to align.",
            "**Active link doesn't update**: are you using `usePathname` instead of `useSelectedLayoutSegment`? The former breaks with dynamic segments. Switch to the latter.",
            "**Modal rendered twice**: the layout is rendering `{children}` AND `{modal}` as SIBLINGS, but `children` already includes the photo full page. The refresh trap: `{modal}` renders the modal, `{children}` renders the photo. Fix: in `(..)photos/[id]/page.tsx` you can `redirect()` if you only want the modal, or accept the stacking as a feature (the gallery sits behind the modal — usually what you want).",
        ],
    },
    subroutes: {
        backToLesson: '← Back to lesson',
        dashboard: {
            badge: 'Parallel routes demo',
            title: 'Dashboard with @analytics + @team',
            description:
                'Each panel below is a separate parallel slot. They share this layout but each has its own `page.tsx`, `loading.tsx` (with a 1.2s artificial delay so you can see streaming), and `default.tsx`. Throttle the network in DevTools → reload and watch the two skeletons land independently.',
            analyticsSlot: '@analytics slot',
            teamSlot: '@team slot',
            delayedSuffix: 'delayed',
            thisWeek: 'This week',
            currentlyActive: 'Currently active',
            roles: {
                lead: 'Lead engineer',
                designer: 'Designer',
                pm: 'PM',
                sre: 'SRE',
            },
            statuses: {
                reviewing: 'reviewing PR #482',
                tokens: 'updating tokens',
                planning: 'sprint planning',
                onCall: 'on-call · all green',
            },
        },
        gallery: {
            badge: 'Intercepting routes demo',
            title: 'Gallery',
            description:
                'Click a thumbnail → modal opens, URL becomes `/lessons/advanced-routing/gallery/photos/<id>`. Copy that URL, paste it in a new tab → full page, not modal.',
            fullPageBadge: 'full page (direct URL)',
            backToGallery: '← Back to gallery',
            modalFootnote:
                'Intercepted via `@modal/(..)photos/[id]/page.tsx`. Paste this URL in a new tab to see the full page instead.',
        },
        crumbs: {
            badge: 'Catch-all demo',
            title: 'Breadcrumbs from a single file',
            description:
                'One `[[...path]]/page.tsx` renders all of these URLs. Server-side `params.path` and client-side `useSelectedLayoutSegments()` agree on what the path looks like.',
            serverBadge: 'server',
            clientBadge: 'client',
            serverFrom: 'from `params.path`',
            clientFrom: 'from `useSelectedLayoutSegments()`',
            emptyState: '(no segments — you are at `/crumbs`)',
        },
    },
};

// -----------------------------------------------------------------------------
// UK
// -----------------------------------------------------------------------------
const uk: Dictionary = {
    badge: 'Модуль 5 · Лекція 4',
    title: 'Просунутий routing',
    intro: "Перші три лекції покрили \"базовий\" routing (Server Components, dynamic `[id]`, layouts, loading/error). Ця лекція дістає 5 трюків, що відрізняють Next від інших фреймворків: **route groups** `(group)` для організації без зміни URL, **parallel routes** `@slot` для рендеру ДВОХ сторінок в одному layout (dashboard з @analytics і @team, що стрімлять паралельно), **intercepting routes** `(..)folder` для signature-фічі \"click → modal, paste URL → ціла сторінка\", **default.tsx** як обов'язковий fallback для unmatched слотів, і **`useSelectedLayoutSegment`** для active links. Нижче: три живі лабораторії — паралельний dashboard, modal-from-link gallery, catch-all breadcrumbs.",
    sections: {
        routeGroups: {
            heading: '§1 Route Groups — папки, що не показуються в URL',
            description: 'Папка, що починається з `(дужок)`, **ігнорується в URL**, але залишається routing-рівнем. Два використання: (1) організація коду по секціях (наприклад `(marketing)`, `(app)`), щоб URL не ставав `/marketing/about`, (2) ДВА різні root layouts в одній codebase — `(marketing)/layout.tsx` з header + footer для landing, `(app)/layout.tsx` зі sidebar для dashboard. Дві абсолютно різні UX, чисті URL.',
            snippet: `// Папки:
app/
  (marketing)/
    layout.tsx        ← marketing header + footer
    page.tsx          ← URL = '/'
    about/page.tsx    ← URL = '/about'
  (app)/
    layout.tsx        ← dashboard sidebar + topbar
    dashboard/page.tsx ← URL = '/dashboard'
    settings/page.tsx ← URL = '/settings'

// URL НЕ містить '(marketing)' або '(app)'.
// Два layouts застосовуються ВЗАЄМОВИКЛЮЧНО.`,
        },
        privateFolders: {
            heading: '§2 Private Folders — _underscore',
            description: "Папка з `_underscore` (наприклад `_components`, `_lib`) — **поза системою routing**. Жоден `page.tsx` всередині не стає route. Використовуй для: компонентів, утиліт, хуків, server actions, co-located з лекцією. Це те, що я використовував у КОЖНІЙ лекції notebook (`_components/`, `_lib/`). Відмінність від route groups `(parens)`: private folders **не можуть містити `page.tsx`**, що стає маршрутом; route groups можуть — вони просто не додають рівнів до URL.",
            snippet: `app/lessons/advanced-routing/
  _components/        ← private, no routing
    photo-grid.tsx
    modal.tsx
  _lib/               ← private
    photos.ts
    content.ts
  page.tsx            ← URL = '/lessons/advanced-routing'
  dashboard/          ← regular
    page.tsx          ← URL = '/lessons/advanced-routing/dashboard'`,
        },
        parallelRoutes: {
            heading: '§3 Parallel Routes — N сторінок в одному layout',
            description: "Створюєш папки `@name` (наприклад `@analytics`, `@team`) поруч із `page.tsx`. Вони стають **named slots**, які `layout.tsx` отримує як props. `layout.tsx` може рендерити `children`, `@analytics`, `@team` ПАРАЛЕЛЬНО. Кожен слот має свій `loading.tsx` → незалежний стрімінг (бачиш, як skeletons з'являються один за одним). Production-патерн: dashboard Vercel, Linear, Stripe — усі побудовані так. Ключове gotcha: УСІ слоти на одному рівні повинні мати однаковий rendering mode — не змішуй static і dynamic.",
            snippet: `// app/lessons/advanced-routing/dashboard/layout.tsx
export default function DashboardLayout({
  children,
  analytics,
  team,
}: {
  children: React.ReactNode;
  analytics: React.ReactNode;
  team: React.ReactNode;
}) {
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="col-span-2">{children}</div>
      <section>{analytics}</section>
      <section>{team}</section>
    </div>
  );
}

// Папки:
dashboard/
  layout.tsx
  page.tsx              ← \`children\`
  @analytics/page.tsx   ← prop \`analytics\`
  @team/page.tsx        ← prop \`team\``,
        },
        defaultJs: {
            heading: "§4 default.tsx — обов'язковий fallback",
            description: "Bug #1 з parallel routes: переходиш на `/dashboard/settings`, браузер робить **hard refresh** → 404. Чому? Слот `@analytics` не має відповідності для `/settings`, Next не знає, що рендерити там. Виправлення: `default.tsx` у КОЖНОМУ слоті. На soft-nav Next зберігає останній active state слота; на hard-nav використовує `default.tsx`. Без нього → 404. `children` має implicit `default.tsx` (його `page.tsx`), але з parallel route поруч треба бути явним.",
            snippet: `// app/lessons/advanced-routing/dashboard/@analytics/default.tsx
// Рендериться, коли слот не має match (hard nav, refresh).
export default function AnalyticsDefault() {
  return (
    <div className="text-slate-500 italic">
      No analytics view selected.
    </div>
  );
}

// Те саме для @team/default.tsx.
// БЕЗ цих файлів: refresh = 404.`,
        },
        interceptingRoutes: {
            heading: '§5 Intercepting Routes — signature-фіча Next',
            description: "Патерн, якого НЕМАЄ в інших фреймворках. Створюєш папку `(..)photos/[id]` всередині `@modal/`, і Next перехоплює навігацію до `/gallery/photos/[id]` ЛИШЕ якщо вона приходить від внутрішнього `<Link>` → показує modal. Якщо користувач вставить URL у нову tab чи натисне F5 → жодного перехоплення, він бачить full page. Той самий URL, дві UX. Розв'язує чотири проблеми одразу: URL-shareable modals, контекст збережено при refresh, закриття на back-button, reopen на forward.\n\nМатчер `(..)` читається як `../` relative, але в SEGMENT-space: `@modal` — slot, не сегмент. Тому `@modal/(..)photos/` вказує на `photos/` на рівень вище, де живе @modal.",
            snippet: `gallery/
  layout.tsx           ← renders {children} + {modal}
  page.tsx             ← thumbnail grid
  default.tsx          ← children fallback
  photos/[id]/page.tsx ← ПОВНА СТОРІНКА (direct URL)
  @modal/
    default.tsx        ← \`return null\` коли no match
    (..)photos/[id]/page.tsx  ← MODAL (intercept)

// gallery/layout.tsx
export default function GalleryLayout({ children, modal }: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <>
      {children}
      {modal}        {/* рендерить modal ЯКЩО є match */}
    </>
  );
}`,
        },
        catchAll: {
            heading: '§6 Catch-all & Optional Catch-all',
            description: '`[...slug]` матчить **один або більше** сегментів — `params.slug` приходить як array. `[[...slug]]` матчить **нуль або більше** сегментів (slug може бути `undefined`). Типове використання: breadcrumbs (один файл матчить будь-яку глибину), CMS routes (`pages/[...path]` для будь-якого CMS URL), redirect handlers.\n\nУ Next 16 `params` — `Promise`, як і в інших dynamic routes — треба `await`.',
            snippet: `// app/.../crumbs/[[...path]]/page.tsx
type Props = {
  params: Promise<{ path?: string[] }>;
};

export default async function CrumbsPage({ params }: Props) {
  const { path = [] } = await params;
  // /crumbs               → path = []
  // /crumbs/a             → path = ['a']
  // /crumbs/a/b/c         → path = ['a', 'b', 'c']

  return <Breadcrumbs segments={path} />;
}`,
        },
        useSegment: {
            heading: '§7 useSelectedLayoutSegment — active link без бардаку',
            description: "Client-side hook, що повертає **сегмент, який зараз активний під цим layout**. Використовується для стилізації активної таби, sidebar link, breadcrumb. Наївна альтернатива: `usePathname()` + `pathname.startsWith(href)` — ламається з dynamic segments та route groups.\n\nЄ також `useSelectedLayoutSegments()` (множина) — повертає повний масив сегментів — корисно для повних breadcrumbs.",
            snippet: `'use client';
import { useSelectedLayoutSegment } from 'next/navigation';

export function TabBar() {
  const active = useSelectedLayoutSegment();
  // На /dashboard → active = null
  // На /dashboard/profile → active = 'profile'
  // На /dashboard/settings → active = 'settings'

  return (
    <nav>
      <Link href="/dashboard"
        className={active === null ? 'font-bold' : ''}>
        Home
      </Link>
      <Link href="/dashboard/profile"
        className={active === 'profile' ? 'font-bold' : ''}>
        Profile
      </Link>
    </nav>
  );
}`,
        },
    },
    decisionTable: {
        heading: '§8 Коли який primitive?',
        intro: 'Сценарій → API.',
        rows: [
            {
                scenario: 'Організація папок без зміни URL',
                choice: '(group)/ — Route Groups',
            },
            {
                scenario: 'Два різні layouts в одній app',
                choice: '(marketing)/layout.tsx + (app)/layout.tsx',
            },
            {
                scenario: 'Co-locate components/lib поруч з лекцією',
                choice: '_underscore/ — Private Folders',
            },
            {
                scenario: 'Dashboard з N panels, стрімінг паралельно',
                choice: '@slot1, @slot2, @slot3 — Parallel Routes',
            },
            {
                scenario: 'URL-shareable modal-from-link',
                choice: '@modal/(..)foo/[id] — Intercepting + Parallel',
            },
            {
                scenario: 'Breadcrumb / CMS route з довільною глибиною',
                choice: '[...slug] або [[...slug]] — Catch-all',
            },
            {
                scenario: 'Active state на tab/link у layout',
                choice: 'useSelectedLayoutSegment(s)',
            },
            {
                scenario: "Fallback коли parallel slot не має match",
                choice: "default.tsx — обов'язковий",
            },
        ],
    },
    labs: {
        heading: '🧪 Інтерактивні лабораторії',
        dashboard: {
            badge: 'Лаб 1',
            description: 'Dashboard з двома паралельними слотами (@analytics + @team). Кожен має свій `loading.tsx` — DevTools → Network → Slow 3G → reload: бачиш, як skeletons двох слотів зʼявляються незалежно. Vercel/Linear/Stripe pattern.',
            openLabel: 'Відкрити dashboard →',
        },
        gallery: {
            badge: 'Лаб 2',
            description: 'Signature-фіча. Click на thumbnail → бачиш modal з фото, URL стає `/lessons/advanced-routing/gallery/photos/3`. Cmd+L скопіювати, відкрити в новій tab → ПОВНА СТОРІНКА, не modal. Той самий URL, дві UX залежно від походження.',
            openLabel: 'Відкрити gallery →',
            modalCloseLabel: 'Закрити',
            backLabel: '← Назад до gallery',
        },
        crumbs: {
            badge: 'Лаб 3',
            description: 'Catch-all `[[...path]]` + `useSelectedLayoutSegments`. Click на приклад → бачиш сегменти path, рендерені як breadcrumbs, а в layout перший сегмент підсвічений як активна tab.',
            tryLabel: 'Спробувати →',
            example1: '/crumbs',
            example2: '/crumbs/dashboards/analytics',
            example3: '/crumbs/products/electronics/laptops/macbook',
        },
    },
    debug: {
        heading: '🔬 Debugging Lab',
        description: 'Шість перевірок, які робиш кожного разу, коли торкаєшся parallel/intercepting routes.',
        steps: [
            '**Modal не відкривається на click**: ймовірно неправильний matcher (..) → папка має бути `@modal/(..)photos`, НЕ `(.)photos` (знаю, бо сам помилився). Також перевір, що parent layout рендерить `{modal}`.',
            "**404 на refresh modal**: немає `@modal/default.tsx`. Додай `export default function() { return null; }`. Те саме для `default.tsx` `children`, якщо є parallel routes поруч.",
            "**Slot стає stale після soft nav**: Next памʼятає останній render слота навіть коли URL змінився. Виправ: `router.refresh()` або `key` на children, що змінюється з URL.",
            '**Static/dynamic conflict**: "Some slots are static, some are dynamic" → усі слоти одного рівня мають мати однаковий rendering mode. Додай `await connection()` чи `cookies()` до dynamic.',
            '**Active link не оновлюється**: використовуєш `usePathname` замість `useSelectedLayoutSegment`? Перший ламається з dynamic segments. Перемикайся на другий.',
            '**Modal рендериться двічі**: layout рендерить `{children}` І `{modal}` як SIBLING, але `children` уже містить full page фото. Трюк refresh: `{modal}` рендерить modal, `{children}` рендерить фото. Виправ: у `(..)photos/[id]/page.tsx` можеш `redirect()` якщо хочеш лише modal, або прийми накладання як feature.',
        ],
    },
    subroutes: {
        backToLesson: '← Назад до лекції',
        dashboard: {
            badge: 'Демо parallel routes',
            title: 'Dashboard з @analytics + @team',
            description:
                'Кожна панель нижче — окремий parallel slot. Вони ділять цей layout, але кожна має власні `page.tsx`, `loading.tsx` (з 1.2s штучною затримкою, щоб бачити стрімінг) і `default.tsx`. Throttle мережі в DevTools → reload і дивись, як два skeletons зʼявляються незалежно.',
            analyticsSlot: 'slot @analytics',
            teamSlot: 'slot @team',
            delayedSuffix: 'затримка',
            thisWeek: 'Цей тиждень',
            currentlyActive: 'Зараз активні',
            roles: {
                lead: 'Lead engineer',
                designer: 'Дизайнер',
                pm: 'PM',
                sre: 'SRE',
            },
            statuses: {
                reviewing: 'ревʼю PR #482',
                tokens: 'оновлення tokens',
                planning: 'sprint planning',
                onCall: 'on-call · усе зелене',
            },
        },
        gallery: {
            badge: 'Демо intercepting routes',
            title: 'Gallery',
            description:
                'Click на thumbnail → відкривається modal, URL стає `/lessons/advanced-routing/gallery/photos/<id>`. Скопіюй URL, встав у нову tab → повна сторінка, не modal.',
            fullPageBadge: 'повна сторінка (прямий URL)',
            backToGallery: '← Назад до gallery',
            modalFootnote:
                'Перехоплено через `@modal/(..)photos/[id]/page.tsx`. Встав URL у нову tab, щоб побачити повну сторінку.',
        },
        crumbs: {
            badge: 'Демо catch-all',
            title: 'Breadcrumbs з одного файлу',
            description:
                'Один `[[...path]]/page.tsx` рендерить усі ці URL. Server-side `params.path` і client-side `useSelectedLayoutSegments()` погоджуються щодо того, як виглядає path.',
            serverBadge: 'server',
            clientBadge: 'client',
            serverFrom: 'з `params.path`',
            clientFrom: 'з `useSelectedLayoutSegments()`',
            emptyState: '(немає сегментів — ти на `/crumbs`)',
        },
    },
};

export const content: Record<Lang, Dictionary> = { it, en, uk };
