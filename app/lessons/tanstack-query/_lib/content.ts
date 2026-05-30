// =============================================================================
// app/lessons/tanstack-query/_lib/content.ts
// Inline i18n dictionary for Module 3 · Lesson 3 (TanStack Query).
// =============================================================================

import type { Lang } from '../../../_lib/dictionaries';

type Dictionary = {
    badge: string;
    title: string;
    intro: string;
    sections: {
        whatIs: { heading: string; description: string; snippet: string };
        setup: { heading: string; description: string; snippet: string };
        useQuery: { heading: string; description: string; snippet: string };
        useMutation: { heading: string; description: string; snippet: string };
        hydration: { heading: string; description: string; snippet: string };
    };
    decisionTable: {
        heading: string;
        intro: string;
        rows: { scenario: string; choice: string }[];
    };
    labs: {
        heading: string;
        search: {
            badge: string;
            description: string;
            placeholder: string;
            statusFetching: string;
            statusFresh: string;
            statusEmpty: string;
        };
        polling: {
            badge: string;
            description: string;
            pollingLabel: string;
            pausedLabel: string;
        };
        mutation: {
            badge: string;
            description: string;
            errorLabel: string;
            favoritedLabel: string;
        };
        preloaded: {
            badge: string;
            description: string;
            prefetchedLabel: string;
            refetchingLabel: string;
            refetchLabel: string;
        };
    };
    debug: { heading: string; description: string; steps: string[] };
};

// -----------------------------------------------------------------------------
// IT
// -----------------------------------------------------------------------------
const it: Dictionary = {
    badge: 'Modulo 3 · Lezione 3',
    title: 'TanStack Query',
    intro: 'TanStack Query (ex React Query) è la libreria standard per gestire lo "server state" — dati remoti — lato client. Pairs CON i Server Components, non li sostituisce. La regola di scelta è semplice: SC per il primo fetch SSR (Modulo 2), Server Actions per le mutation form-driven (Modulo 2), TanStack Query per tutto ciò che è client-driven (search live, polling, infinite scroll, mutation con optimistic UI). Quattro demo: search debounced, polling del server time, mutation con optimistic rollback, e lista pre-caricata via HydrationBoundary.',
    sections: {
        whatIs: {
            heading: '§1 Cos\'è TanStack Query (e quando NON usarla)',
            description: 'È una cache reattiva di "server state" sul client. Ogni `useQuery` ha un `queryKey` che identifica la entry in cache; ogni `set` di parametri produce una entry distinta. La cache si auto-aggiorna su focus, riconnessione di rete, mount remoti e su `invalidateQueries`. Devi vederla come un livello DAVANTI al tuo backend: il backend è la verità, TanStack Query è la copia ottimizzata che lo studente di Module 2 ricorderà come "il client-side equivalente del Data Cache di Next".\n\nQuando NON usarla:\n• fetch one-shot a tempo di build → Server Component con `fetch` cached (Modulo 2)\n• mutation form-driven con redirect → Server Action + `revalidatePath` (Modulo 2)\n• stato puramente client (tema, lingua, todos in memoria) → Zustand o Context (Modulo 3)',
            snippet: `// Il pattern di base
const { data, isLoading, error } = useQuery({
  queryKey: ['items', searchTerm],   // identità in cache
  queryFn: () => fetchItems(searchTerm), // come ottenere i dati
  staleTime: 60_000,                  // "fresco" per 60s
});

// Mutation con sync automatico via invalidate
const { mutate } = useMutation({
  mutationFn: (id) => toggleFavorite(id),
  onSettled: () => qc.invalidateQueries({ queryKey: ['items'] }),
});`,
        },
        setup: {
            heading: '§2 Setup: factory + provider (di nuovo)',
            description: 'Stesso pattern di Zustand factory: una nuova `QueryClient` per ogni request server, una sola per sessione client. Il problema è identico — un singolo QueryClient module-scoped condividerebbe la cache tra tutte le request concorrenti sul server.\n\nL\'API ufficiale di TanStack include `isServer` esattamente per questo. La funzione `getQueryClient()` ritorna:\n• server → nuovo client per richiesta\n• browser → singleton riusato tra re-render e HMR\n\nIl `<QueryClientProvider>` va in un componente `\'use client\'` montato nel layout della lezione.',
            snippet: `'use client';
import { QueryClient, QueryClientProvider, isServer } from '@tanstack/react-query';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { staleTime: 60_000, retry: 1 } },
  });
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (isServer) return makeQueryClient();      // 🆕 ogni request
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();    // ♻️ singleton client
  }
  return browserQueryClient;
}

export function QueryProvider({ children }) {
  return (
    <QueryClientProvider client={getQueryClient()}>
      {children}
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}`,
        },
        useQuery: {
            heading: '§3 useQuery + queryKey + staleTime',
            description: 'Il `queryKey` è una tupla che identifica univocamente la query. È sia "chiave di cache" sia "trigger di refetch": cambia un elemento → nuova query, vecchia query rimane in cache.\n\n**Composizione gerarchica**: `["items"]` è il root; `["items", "list", q]` è una sotto-chiave. `invalidateQueries({ queryKey: ["items"] })` invalida TUTTE le sotto-chiavi. Centralizzare le chiavi in un `queryKeys` factory evita typo e collisioni.\n\n**`staleTime`** = quanto a lungo la data è "fresca" (no refetch automatico). Default 0 → refetch ad ogni mount/focus. Per fetch costosi alza a 30-60s. **`gcTime`** (ex `cacheTime`) = quanto tempo la entry sopravvive in cache DOPO che nessuno la usa più (default 5 min).\n\n**`placeholderData: keepPreviousData`** = durante un refetch in-flight, mostra i dati precedenti invece di "loading". Critico per search-as-you-type — evita il flicker della lista vuota ad ogni keystroke.',
            snippet: `// Factory di queryKey gerarchici (pattern tkdodo)
export const queryKeys = {
  items: {
    all: ['items'] as const,
    list: (query: string) => ['items', 'list', query] as const,
  },
} as const;

// Search debounced con keepPreviousData
const [debounced, setDebounced] = useState('');
useEffect(() => {
  const t = setTimeout(() => setDebounced(raw), 300);
  return () => clearTimeout(t);
}, [raw]);

const { data, isFetching } = useQuery({
  queryKey: queryKeys.items.list(debounced),
  queryFn: () => fetchItems(debounced),
  placeholderData: keepPreviousData,
  staleTime: 60_000,
});`,
        },
        useMutation: {
            heading: '§4 useMutation con optimistic update',
            description: 'Le mutation non si auto-cacheano (sono one-shot). Il loro valore è il ciclo `onMutate → mutationFn → onSuccess|onError → onSettled` che ti permette di implementare pattern complessi senza spaghettare il componente.\n\n**Optimistic update pattern**:\n1. `onMutate`: cancella refetch in-flight (`cancelQueries`), snapshotti la cache, patchi la cache con il valore ottimistico, ritorni lo snapshot.\n2. `mutationFn` lavora.\n3. Se fallisce → `onError` riceve lo snapshot da step 1 → ripristina la cache.\n4. `onSettled` (sempre): `invalidateQueries` per syncare lo stato reale dal server.\n\nÈ molto codice ma è il pattern standard. La UI sembra istantanea (la stella si accende prima che il server risponda), e se il server rifiuta vediamo la stella tornare indietro.',
            snippet: `const toggle = useMutation({
  mutationFn: (id) => toggleFavoriteRequest(id),

  // 1️⃣ Patch ottimistico
  onMutate: async (id) => {
    await qc.cancelQueries({ queryKey: ['items'] });
    const snapshot = qc.getQueriesData({ queryKey: ['items'] });
    qc.setQueriesData({ queryKey: ['items'] }, (old) =>
      old?.map(it => it.id === id ? { ...it, favorite: !it.favorite } : it),
    );
    return { snapshot };
  },

  // 2️⃣ Rollback su errore
  onError: (_err, _id, ctx) => {
    ctx?.snapshot.forEach(([key, data]) => qc.setQueryData(key, data));
  },

  // 3️⃣ Sync finale col server
  onSettled: () => qc.invalidateQueries({ queryKey: ['items'] }),
});`,
        },
        hydration: {
            heading: '§5 HydrationBoundary: prefetch sul server',
            description: 'Il problema: una pagina che inizia con un `useQuery` mostra un loading state al primo render, anche se i dati sono prefetchabili sul server. La soluzione: in una pagina Server Component, crei un QueryClient effimero, fai `prefetchQuery`, lo serializzi via `dehydrate()`, e lo "trapianti" nel client via `<HydrationBoundary>`. Quando il `useQuery` corrispondente monta sul client, trova la entry già in cache: niente loading, niente network.\n\nÈ il pattern che combina il meglio dei due mondi: HTML server-rendered con dati reali + cache TanStack Query attiva per le interazioni successive. Note importanti: il `queryFn` lato server può chiamare DIRETTAMENTE la data layer (skip dell\'HTTP), perché siamo già sul server.',
            snippet: `// Server Component — page.tsx
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getItems } from '@/app/api/_db/mock-items';

export default async function Page() {
  const queryClient = new QueryClient();

  // Prefetch chiama getItems DIRETTAMENTE (no HTTP)
  await queryClient.prefetchQuery({
    queryKey: ['items', 'preloaded'],
    queryFn: () => getItems(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <IndexView />
    </HydrationBoundary>
  );
}

// Client Component — preloaded-list.tsx
'use client';
const { data, isFetchedAfterMount } = useQuery({
  queryKey: ['items', 'preloaded'],
  queryFn: () => fetchItems(''), // refetch usa HTTP normale
});
// isFetchedAfterMount === false → la prima render usa la cache idratata`,
        },
    },
    decisionTable: {
        heading: '🧭 Quando usare cosa',
        intro: 'La domanda chiave dei progetti App Router: Server Components, Server Actions, o TanStack Query? Regola in tabella:',
        rows: [
            {
                scenario: 'Primo render della pagina con dati da DB',
                choice: '✅ Server Component con fetch (Modulo 2)',
            },
            {
                scenario: 'Form submit con redirect',
                choice: '✅ Server Action + revalidatePath (Modulo 2)',
            },
            {
                scenario: 'Search-as-you-type / filtri client-driven',
                choice: '✅ TanStack Query useQuery + queryKey reattivo',
            },
            {
                scenario: 'Polling, refetch on focus, refetch on reconnect',
                choice: '✅ TanStack Query useQuery + refetchInterval',
            },
            {
                scenario: 'Optimistic update con rollback su errore',
                choice: '✅ TanStack Query useMutation + onMutate/onError',
            },
            {
                scenario: 'Lista infinita / pagination',
                choice: '✅ TanStack Query useInfiniteQuery',
            },
            {
                scenario: 'Voglio SSR + interazione client successiva',
                choice: '✅ HydrationBoundary (Server prefetch + Client useQuery)',
            },
            {
                scenario: 'Stato puramente client (tema, modal aperto, draft form)',
                choice: '✅ Zustand o useState (Modulo 3)',
            },
        ],
    },
    labs: {
        heading: '🧪 Laboratori',
        search: {
            badge: 'Lab 1 — Search con debounce e keepPreviousData',
            description: 'Digita, cancella, ridigita. Ogni queryKey distinta è una entry in cache: torna su un termine già cercato → istantaneo, niente network. Apri il Network tab dei DevTools per vedere le request /api/items?q=...',
            placeholder: 'Cerca un item (prova "react", "backend"...)',
            statusFetching: 'fetching…',
            statusFresh: 'fresh',
            statusEmpty: 'nessun risultato',
        },
        polling: {
            badge: 'Lab 2 — Polling ogni 3s con refetchInterval',
            description: 'L\'orario del server si aggiorna automaticamente. Cambia tab, aspetta 5 secondi, torna sulla pagina: refetch immediato (refetchOnWindowFocus). Il polling si mette in PAUSA quando la tab è nascosta — non occupi banda inutilmente.',
            pollingLabel: 'polling',
            pausedLabel: 'idle',
        },
        mutation: {
            badge: 'Lab 3 — useMutation con optimistic + rollback',
            description: 'Clicca le stelle: il toggle è istantaneo (optimistic patch). L\'API simula errori nel 25% dei casi — quando capita, vedi la stella snap-back al valore precedente. Apri Network per vedere il POST e il 500.',
            errorLabel: '⚠ rollback',
            favoritedLabel: 'toggle favorite',
        },
        preloaded: {
            badge: 'Lab 4 — HydrationBoundary (no loading)',
            description: 'Questa lista NON ha loading state al primo render: i dati arrivano dal prefetch del Server Component in page.tsx. Refresh duro (Cmd+Shift+R) → vedi la lista già piena. Clicca "Refresh" → HTTP reale, vedi il loading.',
            prefetchedLabel: '✓ prefetched',
            refetchingLabel: 'refetching…',
            refetchLabel: '🔄 Refetch lista',
        },
    },
    debug: {
        heading: '🛠 Debug Lab',
        description: 'Apri i DevTools del browser e segui:',
        steps: [
            'Cerca il pulsante "TanStack" in basso a destra della pagina (lo monta `<ReactQueryDevtools>`). Aprendolo vedi tutte le query attive con stato (fresh / stale / fetching / inactive), `queryKey` deserializzato, `dataUpdatedAt`, e i dati raw.',
            'Network tab → filtra "fetch". Mentre cerchi nel Lab 1 vedi una request /api/items?q=X per ogni queryKey nuovo. Torna su un termine già cercato → nessuna nuova request (cache hit). Aspetta 60 secondi e ricerca lo stesso → refetch (staleTime scaduto).',
            'Nel Lab 2 (polling): nel TanStack DevTools la query `["server-time"]` cycla tra "fetching" e "fresh" ogni 3 secondi. Cambia tab → la query passa a "stale" (la finestra non ha focus) e il polling si ferma. Torna sulla tab → refetch immediato.',
            'Nel Lab 3 (mutation): clicca una stella e osserva il TanStack DevTools. La query `["items", ...]` ha lo stato "mutating", poi torna a "fresh" o (rollback) ti accorgi che il valore "scatta indietro" in UI. La console mostra l\'errore "Simulated server failure" nel 25% dei casi.',
            'Refresh la pagina (⌘R): il Lab 4 NON mostra loading — la lista appare già piena perché HydrationBoundary l\'ha riempita prima dell\'idratazione client. Apri Sources e cerca "dehydratedState" nell\'HTML iniziale: vedi i dati serializzati direttamente nel markup.',
            'Time travel: nel TanStack DevTools puoi forzare una query a "stale" o "invalid" e vedere il refetch partire. Puoi anche resettare l\'intera cache (`Clear cache`) → tutte le query si ri-fetch al prossimo render.',
        ],
    },
};

// -----------------------------------------------------------------------------
// EN
// -----------------------------------------------------------------------------
const en: Dictionary = {
    badge: 'Module 3 · Lesson 3',
    title: 'TanStack Query',
    intro: 'TanStack Query (formerly React Query) is the standard library for managing "server state" — remote data — on the client. It pairs WITH Server Components, it does not replace them. The decision rule is simple: SC for the first SSR fetch (Module 2), Server Actions for form-driven mutations (Module 2), TanStack Query for anything client-driven (live search, polling, infinite scroll, mutations with optimistic UI). Four demos: debounced search, server-time polling, mutation with optimistic rollback, and a pre-loaded list via HydrationBoundary.',
    sections: {
        whatIs: {
            heading: '§1 What TanStack Query is (and when NOT to use it)',
            description: 'It is a reactive "server state" cache on the client. Every `useQuery` has a `queryKey` that identifies its cache entry; each distinct set of parameters yields a distinct entry. The cache auto-updates on focus, network reconnect, remote mounts and on `invalidateQueries`. Think of it as a layer IN FRONT of your backend: the backend is the truth, TanStack Query is the optimized copy — the client-side equivalent of Next\'s Data Cache.\n\nWhen NOT to use it:\n• one-shot fetch at build time → Server Component with cached `fetch` (Module 2)\n• form-driven mutation with redirect → Server Action + `revalidatePath` (Module 2)\n• purely client state (theme, language, in-memory todos) → Zustand or Context (Module 3)',
            snippet: `// The basic pattern
const { data, isLoading, error } = useQuery({
  queryKey: ['items', searchTerm],   // cache identity
  queryFn: () => fetchItems(searchTerm), // how to fetch
  staleTime: 60_000,                  // "fresh" for 60s
});

// Mutation with automatic sync via invalidate
const { mutate } = useMutation({
  mutationFn: (id) => toggleFavorite(id),
  onSettled: () => qc.invalidateQueries({ queryKey: ['items'] }),
});`,
        },
        setup: {
            heading: '§2 Setup: factory + provider (again)',
            description: 'Same pattern as the Zustand factory: a fresh `QueryClient` per server request, a singleton per client session. The issue is identical — a single module-scoped QueryClient would share the cache across all concurrent server requests.\n\nTanStack\'s official API includes `isServer` exactly for this. `getQueryClient()` returns:\n• server → new client per request\n• browser → singleton reused across re-renders and HMR\n\nThe `<QueryClientProvider>` lives in a `\'use client\'` module mounted in the lesson layout.',
            snippet: `'use client';
import { QueryClient, QueryClientProvider, isServer } from '@tanstack/react-query';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { staleTime: 60_000, retry: 1 } },
  });
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (isServer) return makeQueryClient();      // 🆕 per request
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();    // ♻️ singleton client
  }
  return browserQueryClient;
}

export function QueryProvider({ children }) {
  return (
    <QueryClientProvider client={getQueryClient()}>
      {children}
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}`,
        },
        useQuery: {
            heading: '§3 useQuery + queryKey + staleTime',
            description: 'The `queryKey` is a tuple that uniquely identifies the query. It\'s both "cache key" and "refetch trigger": change an element → new query, old query stays in cache.\n\n**Hierarchical composition**: `["items"]` is the root; `["items", "list", q]` is a sub-key. `invalidateQueries({ queryKey: ["items"] })` invalidates ALL sub-keys. Centralizing keys in a `queryKeys` factory avoids typos and collisions.\n\n**`staleTime`** = how long the data is "fresh" (no automatic refetch). Default 0 → refetch on every mount/focus. For expensive fetches raise to 30-60s. **`gcTime`** (formerly `cacheTime`) = how long the entry survives in cache AFTER nobody uses it (default 5 min).\n\n**`placeholderData: keepPreviousData`** = during an in-flight refetch, show the previous data instead of "loading". Critical for search-as-you-type — avoids the empty-list flicker on every keystroke.',
            snippet: `// Hierarchical queryKey factory (tkdodo pattern)
export const queryKeys = {
  items: {
    all: ['items'] as const,
    list: (query: string) => ['items', 'list', query] as const,
  },
} as const;

// Debounced search with keepPreviousData
const [debounced, setDebounced] = useState('');
useEffect(() => {
  const t = setTimeout(() => setDebounced(raw), 300);
  return () => clearTimeout(t);
}, [raw]);

const { data, isFetching } = useQuery({
  queryKey: queryKeys.items.list(debounced),
  queryFn: () => fetchItems(debounced),
  placeholderData: keepPreviousData,
  staleTime: 60_000,
});`,
        },
        useMutation: {
            heading: '§4 useMutation with optimistic update',
            description: 'Mutations do not auto-cache (they\'re one-shot). Their value is the `onMutate → mutationFn → onSuccess|onError → onSettled` lifecycle, which lets you implement complex patterns without tangling the component.\n\n**Optimistic update pattern**:\n1. `onMutate`: cancel in-flight refetches (`cancelQueries`), snapshot the cache, patch the cache with the optimistic value, return the snapshot.\n2. `mutationFn` runs.\n3. On failure → `onError` receives the snapshot from step 1 → restores the cache.\n4. `onSettled` (always): `invalidateQueries` to sync the real state from the server.\n\nIt\'s a lot of code but it\'s the standard pattern. The UI feels instant (the star turns on before the server responds), and if the server rejects we see the star snap back.',
            snippet: `const toggle = useMutation({
  mutationFn: (id) => toggleFavoriteRequest(id),

  // 1️⃣ Optimistic patch
  onMutate: async (id) => {
    await qc.cancelQueries({ queryKey: ['items'] });
    const snapshot = qc.getQueriesData({ queryKey: ['items'] });
    qc.setQueriesData({ queryKey: ['items'] }, (old) =>
      old?.map(it => it.id === id ? { ...it, favorite: !it.favorite } : it),
    );
    return { snapshot };
  },

  // 2️⃣ Roll back on failure
  onError: (_err, _id, ctx) => {
    ctx?.snapshot.forEach(([key, data]) => qc.setQueryData(key, data));
  },

  // 3️⃣ Final sync with the server
  onSettled: () => qc.invalidateQueries({ queryKey: ['items'] }),
});`,
        },
        hydration: {
            heading: '§5 HydrationBoundary: server-side prefetch',
            description: 'The problem: a page that starts with a `useQuery` shows a loading state on first render, even if the data could be prefetched on the server. The solution: in a Server Component page, create an ephemeral QueryClient, `prefetchQuery`, serialize it via `dehydrate()`, and "transplant" it into the client via `<HydrationBoundary>`. When the matching `useQuery` mounts on the client, it finds the entry already in cache: no loading, no network.\n\nIt\'s the pattern that combines the best of both worlds: server-rendered HTML with real data + active TanStack Query cache for subsequent interactions. Important note: the server-side `queryFn` can call the data layer DIRECTLY (skip HTTP), since we\'re already on the server.',
            snippet: `// Server Component — page.tsx
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getItems } from '@/app/api/_db/mock-items';

export default async function Page() {
  const queryClient = new QueryClient();

  // Prefetch calls getItems DIRECTLY (no HTTP)
  await queryClient.prefetchQuery({
    queryKey: ['items', 'preloaded'],
    queryFn: () => getItems(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <IndexView />
    </HydrationBoundary>
  );
}

// Client Component — preloaded-list.tsx
'use client';
const { data, isFetchedAfterMount } = useQuery({
  queryKey: ['items', 'preloaded'],
  queryFn: () => fetchItems(''), // refetch uses normal HTTP
});
// isFetchedAfterMount === false → the first render uses hydrated cache`,
        },
    },
    decisionTable: {
        heading: '🧭 When to use what',
        intro: 'The key question of App Router projects: Server Components, Server Actions, or TanStack Query? Rule in table form:',
        rows: [
            {
                scenario: 'First page render with DB data',
                choice: '✅ Server Component with fetch (Module 2)',
            },
            {
                scenario: 'Form submit with redirect',
                choice: '✅ Server Action + revalidatePath (Module 2)',
            },
            {
                scenario: 'Search-as-you-type / client-driven filters',
                choice: '✅ TanStack Query useQuery + reactive queryKey',
            },
            {
                scenario: 'Polling, refetch on focus, refetch on reconnect',
                choice: '✅ TanStack Query useQuery + refetchInterval',
            },
            {
                scenario: 'Optimistic update with rollback on error',
                choice: '✅ TanStack Query useMutation + onMutate/onError',
            },
            {
                scenario: 'Infinite list / pagination',
                choice: '✅ TanStack Query useInfiniteQuery',
            },
            {
                scenario: 'SSR + subsequent client interactions',
                choice: '✅ HydrationBoundary (Server prefetch + Client useQuery)',
            },
            {
                scenario: 'Pure client state (theme, open modal, form draft)',
                choice: '✅ Zustand or useState (Module 3)',
            },
        ],
    },
    labs: {
        heading: '🧪 Labs',
        search: {
            badge: 'Lab 1 — Debounced search with keepPreviousData',
            description: 'Type, delete, retype. Every distinct queryKey is a cache entry: revisit a previously searched term → instant, no network. Open the Network tab to see /api/items?q=... requests.',
            placeholder: 'Search an item (try "react", "backend"...)',
            statusFetching: 'fetching…',
            statusFresh: 'fresh',
            statusEmpty: 'no results',
        },
        polling: {
            badge: 'Lab 2 — 3s polling with refetchInterval',
            description: 'Server time auto-updates. Switch tabs, wait 5 seconds, come back: instant refetch (refetchOnWindowFocus). Polling PAUSES when the tab is hidden — no wasted bandwidth.',
            pollingLabel: 'polling',
            pausedLabel: 'idle',
        },
        mutation: {
            badge: 'Lab 3 — useMutation with optimistic + rollback',
            description: 'Click the stars: toggle is instant (optimistic patch). The API simulates errors in 25% of cases — when it happens, you see the star snap back. Open Network to see the POST and the 500.',
            errorLabel: '⚠ rollback',
            favoritedLabel: 'toggle favorite',
        },
        preloaded: {
            badge: 'Lab 4 — HydrationBoundary (no loading)',
            description: 'This list has NO loading state on first render: data comes from the Server Component prefetch in page.tsx. Hard refresh (Cmd+Shift+R) → list appears already populated. Click "Refresh" → real HTTP, see the loading.',
            prefetchedLabel: '✓ prefetched',
            refetchingLabel: 'refetching…',
            refetchLabel: '🔄 Refetch list',
        },
    },
    debug: {
        heading: '🛠 Debug Lab',
        description: 'Open the browser DevTools and follow:',
        steps: [
            'Find the "TanStack" button bottom-right of the page (mounted by `<ReactQueryDevtools>`). Open it: see all active queries with status (fresh / stale / fetching / inactive), deserialized `queryKey`, `dataUpdatedAt`, and raw data.',
            'Network tab → filter "fetch". As you search in Lab 1 you see one /api/items?q=X request per new queryKey. Revisit a previous term → no new request (cache hit). Wait 60 seconds and re-search → refetch (staleTime expired).',
            'In Lab 2 (polling): in TanStack DevTools the `["server-time"]` query cycles between "fetching" and "fresh" every 3 seconds. Switch tabs → query becomes "stale" (no window focus) and polling stops. Switch back → instant refetch.',
            'In Lab 3 (mutation): click a star and watch the TanStack DevTools. The `["items", ...]` query has the "mutating" state, then back to "fresh" or (rollback) you notice the value snaps back in the UI. Console shows "Simulated server failure" in 25% of cases.',
            'Refresh the page (⌘R): Lab 4 does NOT show loading — the list appears already populated because HydrationBoundary filled it before client hydration. Open Sources and search "dehydratedState" in the initial HTML: see the serialized data directly in the markup.',
            'Time travel: in TanStack DevTools you can force a query to "stale" or "invalid" and see the refetch fire. You can also reset the entire cache (`Clear cache`) → all queries refetch on next render.',
        ],
    },
};

// -----------------------------------------------------------------------------
// UK
// -----------------------------------------------------------------------------
const uk: Dictionary = {
    badge: 'Модуль 3 · Лекція 3',
    title: 'TanStack Query',
    intro: 'TanStack Query (раніше React Query) — це стандартна бібліотека для управління "server state" — віддалених даних — на клієнті. Працює З Server Components, не замінює їх. Правило вибору просте: SC для першого SSR-fetch (Модуль 2), Server Actions для form-driven мутацій (Модуль 2), TanStack Query для всього клієнт-driven (live search, polling, infinite scroll, мутації з optimistic UI). Чотири демо: debounced search, polling server-time, мутація з optimistic rollback, і попередньо завантажений список через HydrationBoundary.',
    sections: {
        whatIs: {
            heading: '§1 Що таке TanStack Query (і коли НЕ використовувати)',
            description: 'Це реактивний кеш "server state" на клієнті. Кожен `useQuery` має `queryKey`, який ідентифікує запис у кеші; кожен набір параметрів дає окремий запис. Кеш авто-оновлюється на focus, переконнект мережі, віддалені mount і на `invalidateQueries`. Думай про нього як про шар ПЕРЕД backend: backend — це правда, TanStack Query — оптимізована копія — клієнтський еквівалент Data Cache Next.\n\nКоли НЕ використовувати:\n• one-shot fetch на build time → Server Component з cached `fetch` (Модуль 2)\n• form-driven мутація з redirect → Server Action + `revalidatePath` (Модуль 2)\n• чисто клієнтський стан (тема, мова, in-memory todos) → Zustand або Context (Модуль 3)',
            snippet: `// Базовий патерн
const { data, isLoading, error } = useQuery({
  queryKey: ['items', searchTerm],   // ідентичність кешу
  queryFn: () => fetchItems(searchTerm), // як отримати
  staleTime: 60_000,                  // "свіжий" 60с
});

// Мутація з автосинком через invalidate
const { mutate } = useMutation({
  mutationFn: (id) => toggleFavorite(id),
  onSettled: () => qc.invalidateQueries({ queryKey: ['items'] }),
});`,
        },
        setup: {
            heading: '§2 Setup: factory + provider (знову)',
            description: 'Той же патерн, що Zustand factory: свіжий `QueryClient` на кожен server request, singleton на client session. Проблема ідентична — один module-scoped QueryClient розділяв би кеш між всіма конкурентними server requests.\n\nОфіційний API TanStack включає `isServer` саме для цього. `getQueryClient()` повертає:\n• server → новий client на request\n• browser → singleton, перевикористаний між re-render і HMR\n\n`<QueryClientProvider>` живе в `\'use client\'` модулі, змонтованому в layout лекції.',
            snippet: `'use client';
import { QueryClient, QueryClientProvider, isServer } from '@tanstack/react-query';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { staleTime: 60_000, retry: 1 } },
  });
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (isServer) return makeQueryClient();      // 🆕 на request
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();    // ♻️ singleton client
  }
  return browserQueryClient;
}

export function QueryProvider({ children }) {
  return (
    <QueryClientProvider client={getQueryClient()}>
      {children}
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}`,
        },
        useQuery: {
            heading: '§3 useQuery + queryKey + staleTime',
            description: '`queryKey` — це tuple, що унікально ідентифікує query. Це і "кеш-ключ", і "refetch trigger": зміни елемент → новий query, старий залишається в кеші.\n\n**Ієрархічна композиція**: `["items"]` — root; `["items", "list", q]` — sub-key. `invalidateQueries({ queryKey: ["items"] })` інвалідує ВСІ sub-key. Централізувати ключі в `queryKeys` factory уникає typo і колізій.\n\n**`staleTime`** = скільки дані "свіжі" (без автоматичного refetch). Default 0 → refetch при кожному mount/focus. Для дорогих fetch підніми до 30-60с. **`gcTime`** (раніше `cacheTime`) = скільки запис живе в кеші ПІСЛЯ того, як ніхто не використовує (default 5 хв).\n\n**`placeholderData: keepPreviousData`** = під час in-flight refetch показуй попередні дані замість "loading". Критично для search-as-you-type — уникає flicker порожнього списку при кожному keystroke.',
            snippet: `// Factory ієрархічних queryKey (патерн tkdodo)
export const queryKeys = {
  items: {
    all: ['items'] as const,
    list: (query: string) => ['items', 'list', query] as const,
  },
} as const;

// Debounced search з keepPreviousData
const [debounced, setDebounced] = useState('');
useEffect(() => {
  const t = setTimeout(() => setDebounced(raw), 300);
  return () => clearTimeout(t);
}, [raw]);

const { data, isFetching } = useQuery({
  queryKey: queryKeys.items.list(debounced),
  queryFn: () => fetchItems(debounced),
  placeholderData: keepPreviousData,
  staleTime: 60_000,
});`,
        },
        useMutation: {
            heading: '§4 useMutation з optimistic update',
            description: 'Мутації не авто-кешуються (вони one-shot). Їх цінність — цикл `onMutate → mutationFn → onSuccess|onError → onSettled`, який дозволяє реалізовувати складні патерни без заплутування компонента.\n\n**Optimistic update патерн**:\n1. `onMutate`: скасуй in-flight refetch (`cancelQueries`), зніми snapshot кешу, патч кеш оптимістичним значенням, поверни snapshot.\n2. `mutationFn` працює.\n3. При помилці → `onError` отримує snapshot з step 1 → відновлює кеш.\n4. `onSettled` (завжди): `invalidateQueries` щоб синхронізувати реальний стан з сервера.\n\nЦе багато коду, але це стандартний патерн. UI відчувається миттєвим (зірка засвічується до відповіді сервера), а якщо сервер відмовляє, бачимо, як зірка повертається назад.',
            snippet: `const toggle = useMutation({
  mutationFn: (id) => toggleFavoriteRequest(id),

  // 1️⃣ Оптимістичний патч
  onMutate: async (id) => {
    await qc.cancelQueries({ queryKey: ['items'] });
    const snapshot = qc.getQueriesData({ queryKey: ['items'] });
    qc.setQueriesData({ queryKey: ['items'] }, (old) =>
      old?.map(it => it.id === id ? { ...it, favorite: !it.favorite } : it),
    );
    return { snapshot };
  },

  // 2️⃣ Rollback при помилці
  onError: (_err, _id, ctx) => {
    ctx?.snapshot.forEach(([key, data]) => qc.setQueryData(key, data));
  },

  // 3️⃣ Фінальна синхронізація з сервером
  onSettled: () => qc.invalidateQueries({ queryKey: ['items'] }),
});`,
        },
        hydration: {
            heading: '§5 HydrationBoundary: prefetch на сервері',
            description: 'Проблема: сторінка, яка починається з `useQuery`, показує loading state при першому render, навіть якщо дані можна prefetch на сервері. Рішення: у Server Component page створи ефемерний QueryClient, `prefetchQuery`, серіалізуй через `dehydrate()` і "пересади" в клієнт через `<HydrationBoundary>`. Коли відповідний `useQuery` mount на клієнті, він знаходить запис уже в кеші: ні loading, ні мережі.\n\nЦе патерн, що поєднує найкраще з обох світів: server-rendered HTML з реальними даними + активний TanStack Query кеш для подальших взаємодій. Важлива примітка: server-side `queryFn` може викликати data layer БЕЗПОСЕРЕДНЬО (skip HTTP), оскільки ми вже на сервері.',
            snippet: `// Server Component — page.tsx
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getItems } from '@/app/api/_db/mock-items';

export default async function Page() {
  const queryClient = new QueryClient();

  // Prefetch викликає getItems БЕЗПОСЕРЕДНЬО (без HTTP)
  await queryClient.prefetchQuery({
    queryKey: ['items', 'preloaded'],
    queryFn: () => getItems(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <IndexView />
    </HydrationBoundary>
  );
}

// Client Component — preloaded-list.tsx
'use client';
const { data, isFetchedAfterMount } = useQuery({
  queryKey: ['items', 'preloaded'],
  queryFn: () => fetchItems(''), // refetch використовує звичайний HTTP
});
// isFetchedAfterMount === false → перший render використовує гідратований кеш`,
        },
    },
    decisionTable: {
        heading: '🧭 Коли що використовувати',
        intro: 'Ключове питання App Router проектів: Server Components, Server Actions, чи TanStack Query? Правило в таблиці:',
        rows: [
            {
                scenario: 'Перший render сторінки з DB-даними',
                choice: '✅ Server Component з fetch (Модуль 2)',
            },
            {
                scenario: 'Form submit з redirect',
                choice: '✅ Server Action + revalidatePath (Модуль 2)',
            },
            {
                scenario: 'Search-as-you-type / клієнт-driven фільтри',
                choice: '✅ TanStack Query useQuery + реактивний queryKey',
            },
            {
                scenario: 'Polling, refetch on focus, refetch on reconnect',
                choice: '✅ TanStack Query useQuery + refetchInterval',
            },
            {
                scenario: 'Optimistic update з rollback при помилці',
                choice: '✅ TanStack Query useMutation + onMutate/onError',
            },
            {
                scenario: 'Безкінечний список / pagination',
                choice: '✅ TanStack Query useInfiniteQuery',
            },
            {
                scenario: 'SSR + подальші клієнтські взаємодії',
                choice: '✅ HydrationBoundary (Server prefetch + Client useQuery)',
            },
            {
                scenario: 'Чисто клієнтський стан (тема, modal, draft form)',
                choice: '✅ Zustand або useState (Модуль 3)',
            },
        ],
    },
    labs: {
        heading: '🧪 Лабораторії',
        search: {
            badge: 'Лаб 1 — Debounced search з keepPreviousData',
            description: 'Друкуй, видаляй, передруковуй. Кожен унікальний queryKey — це запис кешу: повернися на раніше шуканий термін → миттєво, без мережі. Відкрий Network tab, щоб бачити /api/items?q=... запити.',
            placeholder: 'Шукай item (спробуй "react", "backend"...)',
            statusFetching: 'fetching…',
            statusFresh: 'fresh',
            statusEmpty: 'немає результатів',
        },
        polling: {
            badge: 'Лаб 2 — Polling кожні 3с з refetchInterval',
            description: 'Server time авто-оновлюється. Переключи вкладку, почекай 5 секунд, повернися: миттєвий refetch (refetchOnWindowFocus). Polling ПРИЗУПИНЯЄТЬСЯ, коли вкладка прихована — без витрати трафіку.',
            pollingLabel: 'polling',
            pausedLabel: 'idle',
        },
        mutation: {
            badge: 'Лаб 3 — useMutation з optimistic + rollback',
            description: 'Натискай зірки: toggle миттєвий (optimistic patch). API симулює помилки в 25% випадків — коли це трапляється, зірка повертається назад. Відкрий Network, щоб бачити POST і 500.',
            errorLabel: '⚠ rollback',
            favoritedLabel: 'toggle favorite',
        },
        preloaded: {
            badge: 'Лаб 4 — HydrationBoundary (без loading)',
            description: 'Цей список НЕ має loading state при першому render: дані з prefetch Server Component у page.tsx. Hard refresh (Cmd+Shift+R) → список з\'являється вже заповнений. Натисни "Refresh" → реальний HTTP, бачиш loading.',
            prefetchedLabel: '✓ prefetched',
            refetchingLabel: 'refetching…',
            refetchLabel: '🔄 Refetch список',
        },
    },
    debug: {
        heading: '🛠 Debug Lab',
        description: 'Відкрий DevTools браузера і слідуй:',
        steps: [
            'Знайди кнопку "TanStack" внизу справа сторінки (монтує `<ReactQueryDevtools>`). Відкрий: бачиш усі активні query зі статусом (fresh / stale / fetching / inactive), десеріалізованим `queryKey`, `dataUpdatedAt` і raw даними.',
            'Network tab → фільтр "fetch". Поки шукаєш у Лаб 1, бачиш /api/items?q=X запит на кожен новий queryKey. Повернися на попередній термін → жодного нового запиту (cache hit). Почекай 60 секунд і пошукай той самий → refetch (staleTime минув).',
            'У Лаб 2 (polling): у TanStack DevTools query `["server-time"]` cycle між "fetching" і "fresh" кожні 3 секунди. Переключи вкладку → query стає "stale" (немає focus вікна) і polling зупиняється. Повернися → миттєвий refetch.',
            'У Лаб 3 (mutation): натискай зірку і дивись TanStack DevTools. Query `["items", ...]` має статус "mutating", потім назад "fresh" або (rollback) помічаєш, як значення повертається в UI. Console показує "Simulated server failure" в 25% випадків.',
            'Refresh сторінку (⌘R): Лаб 4 НЕ показує loading — список з\'являється заповнений, бо HydrationBoundary заповнив його до клієнтського hydration. Відкрий Sources і шукай "dehydratedState" в початковому HTML: бачиш серіалізовані дані прямо в markup.',
            'Time travel: у TanStack DevTools можеш примусово зробити query "stale" або "invalid" і бачити, як refetch стартує. Можеш також скинути весь кеш (`Clear cache`) → всі query refetch при наступному render.',
        ],
    },
};

export const content: Record<Lang, Dictionary> = { it, en, uk };
