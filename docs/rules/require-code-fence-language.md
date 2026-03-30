# require-code-fence-language

Require Markdown fenced code blocks inside TypeDoc comments to declare a language.

## Targeted pattern scope

This rule scans TypeDoc block comments for Markdown triple-backtick fences and checks opening fences.

## What this rule reports

This rule reports opening code fences that omit a language identifier (for example, ```` ``` ```` instead of ```` ```ts ````).

## Why this rule exists

Language-less fences reduce syntax highlighting quality and readability in generated docs. Explicit language tags produce more consistent docs output.

## ❌ Incorrect

```ts
/**
 * Render value.
 * @example
 * ```
 * renderValue(1);
 * ```
 */
export function renderValue(value: number): string {
    return String(value);
}
```

## ✅ Correct

```ts
/**
 * Render value.
 * @example
 * ```ts
 * renderValue(1);
 * ```
 */
export function renderValue(value: number): string {
    return String(value);
}
```

## Behavior and migration notes

Autofix adds `ts` as the default language to missing opening fences.

## ESLint flat config example

```ts
import typedocPlugin from "eslint-plugin-typedoc";

export default [
    {
        plugins: { typedoc: typedocPlugin },
        rules: {
            "typedoc/require-code-fence-language": "error",
        },
    },
];
```

## When not to use it

Disable when your comments intentionally use language-agnostic fences for non-code prose snippets.

## Package documentation

TypeDoc package documentation:

- [TypeDoc comments and Markdown support](https://typedoc.org/documents/Doc_Comments.html)

## Further reading

> **Rule catalog ID:** R014

- [TypeDoc comments and tags](https://typedoc.org/documents/Doc_Comments.html)

## Adoption resources

- Especially useful when teams embed multi-line examples directly in API comments.
