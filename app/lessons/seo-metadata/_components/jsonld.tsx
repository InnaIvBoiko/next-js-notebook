// =============================================================================
// app/lessons/seo-metadata/_components/jsonld.tsx
// Tiny Server Component that emits a JSON-LD <script> for Schema.org data.
// -----------------------------------------------------------------------------
// 🧠 WHY `dangerouslySetInnerHTML` IS SAFE HERE
// React escapes children when you do `<script>{json}</script>`, which would
// turn `<`, `>`, `&` into HTML entities — that breaks JSON-LD parsing.
// `dangerouslySetInnerHTML` skips escaping, BUT we're injecting a value WE
// produced with `JSON.stringify`. `JSON.stringify` already escapes `<`, `>`,
// and other unsafe sequences inside strings, so there's no XSS surface even
// if the schema contains user-controlled content.
//
// 🧠 WHY SERVER-ONLY
// This component runs at render time on the server and the `<script>` lands
// in the initial HTML. Crawlers (Googlebot, Bingbot) don't run JavaScript
// reliably, so client-injected JSON-LD is invisible to them — defeating the
// whole point. Always render JSON-LD on the server.
//
// 📚 Doc: https://json-ld.org/spec/latest/json-ld/
// 📚 Schema.org Course: https://schema.org/Course
// =============================================================================

type Props = {
    /** Any Schema.org object. Top-level should include `@context` and `@type`. */
    schema: Record<string, unknown>;
};

export function JsonLd({ schema }: Props) {
    return (
        <script
            type='application/ld+json'
            // Belt-and-braces: replace `</` to neutralise the rare case where
            // a string in the schema contains "</script>", which would
            // prematurely close the script tag in the HTML.
            dangerouslySetInnerHTML={{
                __html: JSON.stringify(schema).replace(/</g, '\\u003c'),
            }}
        />
    );
}
