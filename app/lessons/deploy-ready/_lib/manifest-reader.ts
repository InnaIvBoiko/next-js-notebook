// =============================================================================
// app/lessons/deploy-ready/_lib/manifest-reader.ts
// SERVER-ONLY: reads .next/prerender-manifest.json from the filesystem.
// -----------------------------------------------------------------------------
// 🧠 ARCHITECTURE
// `import 'server-only'` is a tripwire (Module 5 · Lesson 3): if any Client
// island reaches this module by accident, Turbopack throws at build time.
//
// 🧠 WHY READ THE MANIFEST AT REQUEST TIME
// We could read it at build time and bake the result in, but that would
// require a build-step plugin. Reading at request time is cheap (one fs.read
// of a small JSON, OS page-cached after the first hit) and lets the page
// always show fresh data after a rebuild without redeploying the lesson.
//
// 🧠 PRODUCTION SAFETY
// On Vercel the manifest IS bundled into the function — the cwd at runtime
// resolves to where the build artifacts live. If the file doesn't exist
// (e.g. user is in dev mode), we return null and the UI shows the "run
// npm run build first" panel.
// =============================================================================

import 'server-only';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

// Shape we actually consume from the manifest. Next's full schema has more
// keys, but we narrow to what the UI renders — pluggable to schema changes.
type ManifestRoute = {
    initialRevalidate: number | false;
    srcRoute: string | null;
    dataRoute: string | null;
};

// `routes` is the catalog of statically prerendered routes (○ and ISR).
// `dynamicRoutes` is the catalog of routes with dynamic segments where
// the SHAPE is known at build time but specific values resolve at request.
type PrerenderManifest = {
    version: number;
    routes: Record<string, ManifestRoute>;
    dynamicRoutes: Record<string, unknown>;
    preview?: { previewModeId?: string };
};

export type BuildSnapshot = {
    found: true;
    buildId: string;
    generatedAtIso: string;
    routes: {
        path: string;
        kind: 'static' | 'isr';
        revalidateSeconds: number | null;
    }[];
    totalStatic: number;
    totalIsr: number;
    totalDynamic: number;
};

export type NoBuildSnapshot = { found: false };

export async function readBuildSnapshot(): Promise<BuildSnapshot | NoBuildSnapshot> {
    // Resolve relative to the CWD — that's the repo root in dev (`next dev`)
    // AND the project root on Vercel (the function bundle preserves layout).
    const nextDir = path.join(process.cwd(), '.next');
    const manifestPath = path.join(nextDir, 'prerender-manifest.json');
    const buildIdPath = path.join(nextDir, 'BUILD_ID');

    try {
        const [manifestRaw, buildIdRaw, manifestStat] = await Promise.all([
            readFile(manifestPath, 'utf-8'),
            readFile(buildIdPath, 'utf-8').catch(() => 'unknown'),
            stat(manifestPath),
        ]);

        const manifest = JSON.parse(manifestRaw) as PrerenderManifest;

        const routes = Object.entries(manifest.routes).map(([routePath, info]) => {
            const isIsr =
                typeof info.initialRevalidate === 'number' &&
                info.initialRevalidate > 0;
            return {
                path: routePath,
                kind: isIsr ? ('isr' as const) : ('static' as const),
                revalidateSeconds: isIsr ? (info.initialRevalidate as number) : null,
            };
        });

        // Sort: ISR first (more interesting to inspect), then alphabetical.
        routes.sort((a, b) => {
            if (a.kind !== b.kind) return a.kind === 'isr' ? -1 : 1;
            return a.path.localeCompare(b.path);
        });

        return {
            found: true,
            buildId: buildIdRaw.trim(),
            generatedAtIso: manifestStat.mtime.toISOString(),
            routes,
            totalStatic: routes.filter((r) => r.kind === 'static').length,
            totalIsr: routes.filter((r) => r.kind === 'isr').length,
            totalDynamic: Object.keys(manifest.dynamicRoutes).length,
        };
    } catch {
        // ENOENT, JSON.parse error, perms — all collapse to "no build".
        // The UI tells the user how to fix it.
        return { found: false };
    }
}
