// =============================================================================
// items.test.ts — dynamic-routes data source contract.
// -----------------------------------------------------------------------------
// `findItem` is the function the [id] page calls to decide between rendering
// and `notFound()`. If it ever returned the wrong record or threw on a missing
// id, every dynamic detail page would break. These tests lock its contract,
// plus the i18n completeness each item promises (it/en/uk, no empty fields).
// =============================================================================

import { describe, it, expect } from 'vitest';
import { items, findItem } from './items';
import { LANGS } from '../../../_lib/dictionaries';

describe('findItem', () => {
    it('returns the matching item for a known id', () => {
        const found = findItem('1');
        expect(found).toBeDefined();
        expect(found?.id).toBe('1');
    });

    it('returns undefined for an unknown id (drives notFound())', () => {
        expect(findItem('does-not-exist')).toBeUndefined();
        expect(findItem('')).toBeUndefined();
    });

    it('does not coerce numeric-looking ids past the string match', () => {
        // params arrive as strings; '01' must NOT match '1'.
        expect(findItem('01')).toBeUndefined();
    });
});

describe('items dataset integrity', () => {
    it('has unique ids', () => {
        const ids = items.map(i => i.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it('carries a complete, non-empty translation for every language', () => {
        for (const item of items) {
            for (const { code } of LANGS) {
                const t = item.i18n[code];
                expect(t, `item ${item.id} missing "${code}"`).toBeDefined();
                expect(t.title.trim().length).toBeGreaterThan(0);
                expect(t.synopsis.trim().length).toBeGreaterThan(0);
                expect(t.body.trim().length).toBeGreaterThan(0);
            }
        }
    });
});
