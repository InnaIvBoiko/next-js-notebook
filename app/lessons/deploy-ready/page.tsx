// =============================================================================
// app/lessons/deploy-ready/page.tsx
// SERVER entry for /lessons/deploy-ready — Module 5 · Lesson 5.
// -----------------------------------------------------------------------------
// 🧠 WHAT THIS PAGE READS SERVER-SIDE BEFORE RENDERING
//   • The .next/prerender-manifest.json snapshot (Lab 1)
//   • The local runtime probe values from process.* (Lab 2 left pane)
//   • File-existence checks for the 10 preflight items (Lab 3)
// All three are passed as pre-rendered slots into the Client orchestrator.
//
// 🧠 SUSPENSE WRAP — required by Cache Components
// Reading the filesystem + process.uptime() is request-time/uncached, which
// under Cache Components must live inside <Suspense>. Same pattern as
// security-env/page.tsx and the other request-time lessons.
//
// 📚 Doc: node_modules/next/dist/docs/01-app/01-getting-started/08-caching.md
// =============================================================================

import { Suspense } from 'react';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { stat } from 'node:fs/promises';
import path from 'node:path';
import IndexView from './_components/index-view';
import BuildMarkerViewer from './_components/build-marker-viewer';
import RuntimeProbeCard, {
    type ProbeData,
} from './_components/runtime-probe-card';
import PreflightChecklist, {
    type PreflightResult,
} from './_components/preflight-checklist';
import { readBuildSnapshot } from './_lib/manifest-reader';
import { content } from './_lib/content';
import type { Lang } from '../../_lib/dictionaries';

const LIVE_ORIGIN = 'https://next-js-notebook.vercel.app';

export const metadata: Metadata = {
    title: 'Deploy-Ready · Living Notebook',
    description:
        'Module 5 · Lesson 5: anatomy of `next build`, Node vs Edge runtime, output modes (default/standalone/export), CI/CD pipeline, pre-flight checklist. Labs: build-marker viewer (reads .next/prerender-manifest.json), runtime probe (local vs live Vercel), auto-verified pre-flight checklist.',
};

export default function DeployReadyPage() {
    return (
        <Suspense fallback={<LessonSkeleton />}>
            <PageContent />
        </Suspense>
    );
}

async function PageContent() {
    // Pick the right dictionary for slot labels. Slots are Server Components,
    // so they can't reach useLang() — same pattern as the other lessons.
    const cookieStore = await cookies();
    const rawLang = cookieStore.get('nb-lang')?.value;
    const lang: Lang =
        rawLang === 'en' || rawLang === 'uk' ? rawLang : 'it';
    const t = content[lang];

    // Run the three server-side data sources in parallel.
    const [snapshot, results] = await Promise.all([
        readBuildSnapshot(),
        computePreflightResults(t.labs.preflight.items),
    ]);

    const localProbe: ProbeData = {
        runtime: 'nodejs',
        nodeVersion: process.versions?.node ?? null,
        timestamp: new Date().toISOString(),
        uptimeSeconds:
            typeof process.uptime === 'function' ? process.uptime() : null,
        nodeEnv: process.env.NODE_ENV ?? null,
        vercel: {
            env: process.env.VERCEL_ENV ?? null,
            region: process.env.VERCEL_REGION ?? null,
            url: process.env.VERCEL_URL ?? null,
            sha: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
            sha7: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
            branch: process.env.VERCEL_GIT_COMMIT_REF ?? null,
        },
    };

    return (
        <IndexView
            buildViewer={
                <BuildMarkerViewer
                    key='build-viewer'
                    snapshot={snapshot}
                    labels={{
                        badge: t.labs.buildViewer.badge,
                        title: t.labs.buildViewer.title,
                        description: t.labs.buildViewer.description,
                        noBuildHeading: t.labs.buildViewer.noBuildHeading,
                        noBuildHint: t.labs.buildViewer.noBuildHint,
                        buildIdLabel: t.labs.buildViewer.buildIdLabel,
                        generatedAtLabel: t.labs.buildViewer.generatedAtLabel,
                        routesHeading: t.labs.buildViewer.routesHeading,
                        staticLabel: t.labs.buildViewer.staticLabel,
                        isrLabel: t.labs.buildViewer.isrLabel,
                        countLabel: t.labs.buildViewer.countLabel,
                    }}
                />
            }
            runtimeProbe={
                <RuntimeProbeCard
                    key='runtime-probe'
                    localProbe={localProbe}
                    liveOrigin={LIVE_ORIGIN}
                    labels={t.labs.runtime}
                />
            }
            preflight={
                <PreflightChecklist
                    key='preflight'
                    badge={t.labs.preflight.badge}
                    title={t.labs.preflight.title}
                    description={t.labs.preflight.description}
                    okLabel={t.labs.preflight.okLabel}
                    missingLabel={t.labs.preflight.missingLabel}
                    scoreLabel={t.labs.preflight.scoreLabel}
                    results={results}
                />
            }
        />
    );
}

// -----------------------------------------------------------------------------
// computePreflightResults — checks file existence for each checklist item.
// -----------------------------------------------------------------------------
// The order MUST match the items array in content.ts, because we render the
// label/hint from the dictionary and the `present` flag from here. We pair
// them by index. A tuple shape would be safer but the dictionary lives in
// content.ts to keep i18n centralized.
const PATHS_TO_CHECK = [
    'app/lessons/security-env/_lib/env.ts',
    'app/lessons/security-env/_lib/server-only-secret.ts',
    'proxy.ts',
    'next.config.ts',
    'next.config.ts', // images.remotePatterns — file existence is the gate; content check is overkill here
    'app/sitemap.ts',
    'app/opengraph-image.tsx',
    'next.config.ts', // cacheComponents: true lives in the same file
    'auth.ts',
    'README.md',
];

async function computePreflightResults(
    items: { label: string; hint: string }[],
): Promise<PreflightResult[]> {
    const cwd = process.cwd();

    const checks = await Promise.all(
        PATHS_TO_CHECK.map(async (relPath) => {
            try {
                await stat(path.join(cwd, relPath));
                return true;
            } catch {
                return false;
            }
        }),
    );

    return items.map((item, idx) => ({
        label: item.label,
        hint: item.hint,
        present: checks[idx] ?? false,
    }));
}

function LessonSkeleton() {
    return (
        <div className='space-y-4'>
            <div className='h-7 w-32 animate-pulse rounded-full bg-slate-800/60' />
            <div className='h-10 w-2/3 animate-pulse rounded bg-slate-800/60' />
            <div className='h-4 w-full animate-pulse rounded bg-slate-800/40' />
        </div>
    );
}
