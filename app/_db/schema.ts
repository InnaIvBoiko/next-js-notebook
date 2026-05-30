// =============================================================================
// app/_db/schema.ts
// Drizzle ORM schema for Module 4 · Lesson 2 (/database-orm).
// -----------------------------------------------------------------------------
// 🧠 Two tables, one 1-to-N relationship:
//
//   notes  (id PK, title, body, createdAt)
//     ↓ one
//   note_tags  (id PK, noteId FK → notes.id, label)
//
// 🧠 Why a separate `note_tags` table (and not a `text[]` column)
// Postgres CAN store arrays natively, but normalizing tags into a child table
// teaches the real-world pattern:
//   • each tag is a row → indexable, joinable, queryable individually
//   • CASCADE delete enforces referential integrity
//   • Drizzle's `relations()` API gives type-safe relational reads
//
// 🧠 `relations()` is OPT-IN: it's used by Drizzle's `db.query.notes.findMany({ with: { tags: true } })`
// helper for nested reads. Without it you can still JOIN manually using
// `db.select().from(notes).leftJoin(noteTags, ...)`.
//
// 📚 Doc: https://orm.drizzle.team/docs/rqb (Relational queries)
// =============================================================================

import { relations } from 'drizzle-orm';
import {
    integer,
    pgTable,
    serial,
    text,
    timestamp,
} from 'drizzle-orm/pg-core';

export const notes = pgTable('notes', {
    // `serial` = Postgres SERIAL = auto-increment integer PK. The student
    // could also use `uuid('id').primaryKey().defaultRandom()` for UUIDs —
    // we pick `serial` because integer IDs read better in the demo UI.
    id: serial('id').primaryKey(),
    title: text('title').notNull(),
    body: text('body').notNull().default(''),
    createdAt: timestamp('created_at', { withTimezone: true })
        .notNull()
        .defaultNow(),
});

export const noteTags = pgTable('note_tags', {
    id: serial('id').primaryKey(),
    // `references()` declares the FK; `onDelete: 'cascade'` means deleting
    // the parent note auto-removes its tags. Postgres ENFORCES this at the
    // engine level — no app-side cleanup needed.
    noteId: integer('note_id')
        .notNull()
        .references(() => notes.id, { onDelete: 'cascade' }),
    label: text('label').notNull(),
});

// -----------------------------------------------------------------------------
// Relations — wired ONCE, used by `db.query.notes.findMany({ with: { tags: true } })`
// -----------------------------------------------------------------------------

export const notesRelations = relations(notes, ({ many }) => ({
    tags: many(noteTags),
}));

export const noteTagsRelations = relations(noteTags, ({ one }) => ({
    note: one(notes, {
        fields: [noteTags.noteId],
        references: [notes.id],
    }),
}));

// Convenience types — inferred from the schema, used by the queries module.
// `$inferSelect` = shape returned by SELECT; `$inferInsert` = shape accepted
// by INSERT (e.g. autoincrement PKs and DEFAULT cols become optional).
export type Note = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;
export type NoteTag = typeof noteTags.$inferSelect;
export type NewNoteTag = typeof noteTags.$inferInsert;

// Composite shape returned by the relational query.
export type NoteWithTags = Note & { tags: NoteTag[] };
