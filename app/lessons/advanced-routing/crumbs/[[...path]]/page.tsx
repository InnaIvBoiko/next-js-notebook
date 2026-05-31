// =============================================================================
// app/lessons/advanced-routing/crumbs/[[...path]]/page.tsx
// OPTIONAL catch-all: matches /crumbs (empty path) AND /crumbs/a/b/c/...
// -----------------------------------------------------------------------------
// 🧠 [[...path]] vs [...path]
//   • [...path]   — required, matches /crumbs/a, /crumbs/a/b — but NOT /crumbs
//   • [[...path]] — optional, ALSO matches /crumbs (path = undefined)
// We want the index URL to render the empty state, so we use the optional form.
//
// 🧠 params IS A PROMISE (Next 16)
// You MUST await before destructuring. The undefined branch comes from the
// optional form when no segments are present.
//
// 🧠 useSelectedLayoutSegments
// We render a small client island (<ActiveTab>) that calls
// `useSelectedLayoutSegments()` to read the array of segments under the
// nearest layout — the same array that `params.path` carries server-side,
// but read through the client routing context. Useful to show the same
// data via two routes (server params vs client hook).
// =============================================================================

import { BreadcrumbView } from './breadcrumb-view';

type Props = { params: Promise<{ path?: string[] }> };

export default async function CrumbsPage({ params }: Props) {
    const { path = [] } = await params;
    return <BreadcrumbView serverPath={path} />;
}
