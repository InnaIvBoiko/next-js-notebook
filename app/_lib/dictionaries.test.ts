// =============================================================================
// dictionaries.test.ts — i18n integrity guard.
// -----------------------------------------------------------------------------
// The single most valuable thing to test in a multilingual app is *translation
// drift*: a key that exists in `it` but was forgotten in `uk`, or a module that
// lists 4 lessons in English and 3 in Italian. TypeScript catches a MISSING
// top-level key, but it cannot catch structural mismatches inside the dynamic
// `modules[]` array (same slugs? same order? same statuses?). These tests do.
// =============================================================================

import { describe, it, expect } from 'vitest';
import { dictionaries, LANGS, type Lang } from './dictionaries';

const LANG_CODES = LANGS.map(l => l.code);

// Recursively collect the "shape" of an object: every nested key path, ignoring
// the leaf string values. Two dictionaries with the same shape are structurally
// in sync even if the translated strings differ.
function shapeOf(value: unknown, prefix = ''): string[] {
    if (Array.isArray(value)) {
        return value.flatMap((v, i) => shapeOf(v, `${prefix}[${i}]`));
    }
    if (value && typeof value === 'object') {
        return Object.keys(value)
            .sort()
            .flatMap(k =>
                shapeOf(
                    (value as Record<string, unknown>)[k],
                    prefix ? `${prefix}.${k}` : k
                )
            );
    }
    return [prefix]; // leaf
}

// Collect every leaf path whose string value is empty/whitespace-only.
function emptyLeafPaths(value: unknown, prefix = ''): string[] {
    if (Array.isArray(value)) {
        return value.flatMap((v, i) => emptyLeafPaths(v, `${prefix}[${i}]`));
    }
    if (value && typeof value === 'object') {
        return Object.entries(value).flatMap(([k, v]) =>
            emptyLeafPaths(v, prefix ? `${prefix}.${k}` : k)
        );
    }
    return typeof value === 'string' && value.trim() === '' ? [prefix] : [];
}

describe('i18n dictionaries', () => {
    it('exposes exactly the languages declared in LANGS', () => {
        expect(Object.keys(dictionaries).sort()).toEqual(
            [...LANG_CODES].sort()
        );
    });

    it('has an identical structural shape across every language', () => {
        const base = shapeOf(dictionaries.it);
        for (const code of LANG_CODES) {
            expect(
                shapeOf(dictionaries[code]),
                `mismatch in "${code}"`
            ).toEqual(base);
        }
    });

    it('keeps the same module ids and lesson slugs in every language', () => {
        const fingerprint = (lang: Lang) =>
            dictionaries[lang].modules.map(m => ({
                id: m.id,
                slugs: m.lessons.map(l => l.slug),
                statuses: m.lessons.map(l => l.status),
            }));

        const base = JSON.stringify(fingerprint('it'));
        for (const code of LANG_CODES) {
            expect(
                JSON.stringify(fingerprint(code)),
                `drift in "${code}"`
            ).toBe(base);
        }
    });

    it('contains no empty string leaves in any language', () => {
        for (const code of LANG_CODES) {
            expect(
                emptyLeafPaths(dictionaries[code]),
                `empty translations in "${code}"`
            ).toEqual([]);
        }
    });
});
