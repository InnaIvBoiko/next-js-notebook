// =============================================================================
// lang.test.ts — server-side language negotiation from the `nb-lang` cookie.
// -----------------------------------------------------------------------------
// `getLessonLang` is the contract between the Client `<LangProvider>` (which
// WRITES the cookie) and every Server Component sub-route (which READS it).
// The rule: trust `en`/`uk` if present, otherwise fall back to the base `it`.
// We mock `next/headers` so the pure negotiation logic can be unit-tested
// without a running server.
// =============================================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';

// One mutable handle the mock reads from, so each test can stage a cookie value.
let cookieValue: string | undefined;

vi.mock('next/headers', () => ({
    cookies: async () => ({
        get: (name: string) =>
            name === 'nb-lang' && cookieValue !== undefined
                ? { name, value: cookieValue }
                : undefined,
    }),
}));

import { getLessonLang } from './lang';

beforeEach(() => {
    cookieValue = undefined;
});

describe('getLessonLang', () => {
    it('returns "en" when the cookie says en', async () => {
        cookieValue = 'en';
        expect(await getLessonLang()).toBe('en');
    });

    it('returns "uk" when the cookie says uk', async () => {
        cookieValue = 'uk';
        expect(await getLessonLang()).toBe('uk');
    });

    it('falls back to "it" when the cookie is absent', async () => {
        cookieValue = undefined;
        expect(await getLessonLang()).toBe('it');
    });

    it('falls back to "it" for an unsupported / tampered value', async () => {
        cookieValue = 'fr'; // not a supported Lang
        expect(await getLessonLang()).toBe('it');
    });
});
