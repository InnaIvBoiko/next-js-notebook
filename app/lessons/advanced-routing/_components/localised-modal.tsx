'use client';
// =============================================================================
// app/lessons/advanced-routing/_components/localised-modal.tsx
// Thin Client wrapper around <Modal> that reads the localised close label
// from the lesson dictionary. Used by the intercepted modal route so the
// SERVER outer tree can stay server-only for the async photo lookup.
// =============================================================================

import type { ReactNode } from 'react';
import { useLang } from '../../_components/lang-provider';
import { content } from '../_lib/content';
import Modal from './modal';

type Props = {
    title: string;
    children: ReactNode;
};

export default function LocalisedModal({ title, children }: Props) {
    const lang = useLang();
    const t = content[lang].labs.gallery;
    return (
        <Modal title={title} closeLabel={t.modalCloseLabel}>
            {children}
        </Modal>
    );
}
