# require-exported-doc-comment-description

Require documented exported declarations to start with a meaningful summary paragraph before TypeDoc block tags.

## Targeted pattern scope

This rule checks exported declarations that already have a leading TypeDoc block comment.

It focuses on the summary paragraph that appears before block tags such as `@param`, `@returns`, `@remarks`, or `@example`.

## What this rule reports

This rule reports exported declarations whose TypeDoc block contains tags only, or otherwise skips a meaningful lead summary paragraph.

## Why this rule exists

TypeDoc uses the leading prose paragraph as the primary summary in generated documentation.

When a comment starts immediately with tags, generated docs often lose the one-sentence explanation that makes API lists, search results, and markdown-rendered pages readable at a glance.

This matters even more when using markdown-oriented output, because summaries are often surfaced directly in tables of contents, index pages, and per-symbol pages.

## ❌ Incorrect

```ts
/**
 * @param input Parsed input value.
 * @returns Normalized output value.
 */
export function normalize(input: string): string {
    return input.trim();
}
```

## ✅ Correct

```ts
/**
 * Normalize user-provided input before rendering output.
 * @param input Parsed input value.
 * @returns Normalized output value.
 */
export function normalize(input: string): string {
    return input.trim();
}
```

## Behavior and migration notes

- This rule intentionally ignores exports that do not have a TypeDoc comment yet. Use it together with `require-exported-doc-comment` when you want full exported-API documentation coverage.
- A `@remarks` section does not replace the lead summary paragraph. The summary should still come first.
- This rule does not autofix because summaries should be written intentionally, not generated mechanically.
- By default, this rule ignores non-production paths: `test/**`, `tests/**`, `benchmark/**`, `benchmarks/**`, `fixture/**`, `fixtures/**`, `temp/**`, `coverage/**`, `dist/**`, `build/**`, and `generated/**`.
- Use `ignorePatterns` to override those defaults, and `ignoreDeclarationFiles: true` to skip declaration files such as `.d.ts` / `.d.mts`.

Rule options:

```ts
type RuleOptions = [
    {
        ignoreDeclarationFiles?: boolean;
        ignorePatterns?: string[];
    }?
];
```

## ESLint flat config example

```ts
import typedocPlugin from "eslint-plugin-typedoc";

export default [
    {
        plugins: { typedoc: typedocPlugin },
        rules: {
            "typedoc/require-exported-doc-comment-description": "error",
        },
    },
];
```

## When not to use it

Disable this rule if your project intentionally relies on tag-only comments and does not treat summary prose as part of its documentation quality bar.

## Package documentation

TypeDoc package documentation:

- [TypeDoc comments](https://typedoc.org/documents/Doc_Comments.html)

## Further reading

> **Rule catalog ID:** R025

- [TypeDoc comment options](https://typedoc.org/documents/Options.Comments.html)
- [typedoc-plugin-markdown](https://www.npmjs.com/package/typedoc-plugin-markdown)

## Adoption resources

- Use alongside `require-exported-doc-comment` when you want every exported API declaration to have both coverage and readable summary prose.
- Include this rule in markdown-heavy documentation workflows so generated symbol pages do not begin with tag noise.
