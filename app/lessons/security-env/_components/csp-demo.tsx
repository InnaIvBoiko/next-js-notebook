'use client';
// =============================================================================
// app/lessons/security-env/_components/csp-demo.tsx
// Two buttons that try to execute JS — one with the proxy's per-request nonce
// (allowed), one without (blocked by CSP in prod / logged in dev).
// -----------------------------------------------------------------------------
// 🧠 HOW THE TWO PATHS DIFFER
//   • "Allowed": a `<script nonce="…">` whose `nonce` matches the value the
//     proxy attached to this request. The CSP allows it. The script runs
//     `alert()` so the user gets a visible, undeniable proof of execution.
//   • "Blocked": a `<script>` with NO nonce. In prod the CSP refuses to
//     execute it. In dev we serve `Content-Security-Policy-Report-Only`
//     (so Turbopack HMR keeps working) — the script ACTUALLY runs but the
//     browser logs a violation. We attach a `securitypolicyviolation`
//     listener to detect that and show "⚠️ violation logged" in the UI,
//     so the user understands "dev = report-only, prod = hard block".
//
// 🧠 WHY APPEND TO document.body
// Browsers execute <script> tags only when they're attached to a document
// AND have not been executed before. Appending to body is the universal
// "run this once" pattern. We `.remove()` after so the demo can be retried.
//
// 🧠 WHY NO JSX <script>
// `<script>` in React JSX is rendered to the DOM but never executed by
// React's renderer — by design. We bypass that intentionally by creating
// the element via `document.createElement`, which is exactly the path
// real XSS attempts use. CSP is the brake we apply to that path.
// =============================================================================

import { useEffect, useRef, useState } from 'react';
import { useLang } from '../../_components/lang-provider';
import { content } from '../_lib/content';

type Props = {
    /** The per-request nonce from proxy.ts (read via `headers()` on the page). */
    nonce: string;
};

// 4-state outcome for the blocked button:
//   • null              — not run yet
//   • 'report-only'     — script ran AND a CSP violation was logged
//                         (dev mode with Content-Security-Policy-Report-Only)
//   • 'blocked'         — script did NOT run because CSP enforced (prod)
//   • 'ran-cleanly'     — script ran with no violation (CSP not configured —
//                         shouldn't happen in this notebook)
type BlockedOutcome =
    | null
    | 'report-only'
    | 'blocked'
    | 'ran-cleanly';

type Outcome = {
    allowed: boolean | null;
    blocked: BlockedOutcome;
};

declare global {
    interface Window {
        __cspDemoAllowed?: () => void;
        __cspDemoBlocked?: () => void;
    }
}

export default function CspDemo({ nonce }: Props) {
    const lang = useLang();
    const t = content[lang].labs.csp;
    const [outcome, setOutcome] = useState<Outcome>({
        allowed: null,
        blocked: null,
    });

    // Count CSP violations the browser logs. `securitypolicyviolation` fires
    // even in Report-Only mode — that's the SIGNAL we use to know "yep, the
    // CSP saw an inline script and would have blocked it in prod".
    const violationCountRef = useRef(0);
    useEffect(() => {
        const handler = () => {
            violationCountRef.current += 1;
        };
        document.addEventListener('securitypolicyviolation', handler);
        return () =>
            document.removeEventListener('securitypolicyviolation', handler);
    }, []);

    function runAllowed() {
        setOutcome((prev) => ({ ...prev, allowed: null }));
        window.__cspDemoAllowed = () => {
            setOutcome((prev) => ({ ...prev, allowed: true }));
            delete window.__cspDemoAllowed;
        };

        const script = document.createElement('script');
        // CSP `script-src 'self' 'nonce-XYZ'` lets THIS script run because
        // its `nonce` attribute matches. The alert is the user-visible proof.
        script.setAttribute('nonce', nonce);
        script.textContent =
            "alert('CSP allowed this script: it carries the per-request nonce.');" +
            'window.__cspDemoAllowed && window.__cspDemoAllowed();';
        document.body.appendChild(script);
        script.remove();

        // Defensive: if the script never fired (e.g. strict-CSP prod and our
        // nonce somehow didn't match), flip to failure.
        setTimeout(() => {
            setOutcome((prev) =>
                prev.allowed === null ? { ...prev, allowed: false } : prev,
            );
        }, 100);
    }

    function runBlocked() {
        setOutcome((prev) => ({ ...prev, blocked: null }));
        const violationsBefore = violationCountRef.current;

        let scriptRan = false;
        window.__cspDemoBlocked = () => {
            scriptRan = true;
            delete window.__cspDemoBlocked;
        };

        const script = document.createElement('script');
        // NO nonce attribute → CSP rejects (or logs in Report-Only). We do
        // NOT call alert() here on purpose — the user should learn to TRUST
        // the violation message, not a sneaky popup that happens to appear
        // in dev only.
        script.textContent =
            'window.__cspDemoBlocked && window.__cspDemoBlocked();';
        document.body.appendChild(script);
        script.remove();

        // Wait for the violation event to fire (it dispatches synchronously
        // when the browser sees the bad script, but state updates are
        // batched; a microtask is enough).
        setTimeout(() => {
            const violated =
                violationCountRef.current > violationsBefore;
            const result: BlockedOutcome = violated
                ? scriptRan
                    ? 'report-only' // dev: ran AND violation logged
                    : 'blocked' // prod: didn't run, violation enforced
                : scriptRan
                  ? 'ran-cleanly' // CSP misconfigured — shouldn't happen here
                  : 'blocked'; // didn't run, no violation event (unlikely)
            setOutcome((prev) => ({ ...prev, blocked: result }));
        }, 200);
    }

    return (
        <div className='grid gap-4 lg:grid-cols-2'>
            {/* ALLOWED -------------------------------------------------- */}
            <div className='space-y-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4'>
                <div className='flex items-center gap-2'>
                    <span className='inline-block rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-medium tracking-wide text-emerald-300 uppercase'>
                        nonce ✓
                    </span>
                    <h3 className='text-sm font-semibold text-slate-200'>
                        {t.allowedLabel}
                    </h3>
                </div>
                <p className='text-xs leading-relaxed text-slate-400'>
                    {t.allowedHint}
                </p>
                <button
                    type='button'
                    onClick={runAllowed}
                    className='rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-sm font-medium text-emerald-200 transition hover:bg-emerald-500/20'
                >
                    {t.triggerLabel}
                </button>
                {outcome.allowed !== null && (
                    <p
                        className={`text-xs ${
                            outcome.allowed ? 'text-emerald-300' : 'text-rose-300'
                        }`}
                    >
                        {outcome.allowed ? t.successLabel : t.failureLabel}
                    </p>
                )}
            </div>

            {/* BLOCKED -------------------------------------------------- */}
            <div className='space-y-3 rounded-lg border border-rose-500/30 bg-rose-500/5 p-4'>
                <div className='flex items-center gap-2'>
                    <span className='inline-block rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] font-medium tracking-wide text-rose-300 uppercase'>
                        nonce ✗
                    </span>
                    <h3 className='text-sm font-semibold text-slate-200'>
                        {t.blockedLabel}
                    </h3>
                </div>
                <p className='text-xs leading-relaxed text-slate-400'>
                    {t.blockedHint}
                </p>
                <button
                    type='button'
                    onClick={runBlocked}
                    className='rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-1.5 text-sm font-medium text-rose-200 transition hover:bg-rose-500/20'
                >
                    {t.triggerLabel}
                </button>
                {outcome.blocked !== null && (
                    <p
                        className={`text-xs leading-relaxed ${
                            outcome.blocked === 'report-only'
                                ? 'text-amber-300'
                                : outcome.blocked === 'blocked'
                                  ? 'text-emerald-300'
                                  : 'text-rose-300'
                        }`}
                    >
                        {outcome.blocked === 'report-only' &&
                            t.reportOnlyLabel}
                        {outcome.blocked === 'blocked' && t.blockedSuccessLabel}
                        {outcome.blocked === 'ran-cleanly' && t.failureLabel}
                    </p>
                )}
            </div>
        </div>
    );
}
