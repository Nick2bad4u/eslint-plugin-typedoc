/**
 * Type declarations for the runtime TypeDoc plugin helper module.
 *
 * @remarks
 * This file exists so TypeScript consumers (tests/tooling) can import the
 * `.mjs` module without TS7016.
 */

/**
 * Prefixes bare intra-doc Markdown file links with `./`.
 *
 * @param input - Markdown source to normalize for relative link resolution.
 *
 * @returns Markdown with unresolved bare file links prefixed by `./`.
 */
export declare function prefixBareMarkdownFileLinksInMarkdown(
    input: string
): string;
