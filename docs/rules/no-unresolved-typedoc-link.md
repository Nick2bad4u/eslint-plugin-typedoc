# no-unresolved-typedoc-link

Report unresolved inline TypeDoc links such as `{@link MissingSymbol}`.

## Targeted pattern scope

This rule targets inline `{@link ...}` tags inside TypeDoc block comments.

## What this rule reports

- Link targets that cannot be resolved to declared/imported module symbols.
- It ignores external URLs and local hash/path links.

## Why this rule exists

Broken inline links reduce doc quality and break editor navigation in generated API docs. Catching them in ESLint is faster than waiting for documentation build validation.

## ❌ Incorrect

```ts
/**
 * Uses {@link MissingType}.
 */
export function run(): void {}
```

## ✅ Correct

```ts
interface KnownType {}

/**
 * Uses {@link KnownType}.
 */
export function run(): void {}
```

## Behavior and migration notes

The rule provides suggestions to convert unresolved link markup into plain text when you intentionally want non-link text.

## ESLint flat config example

```ts
import typedoc from "eslint-plugin-typedoc";

export default [
    {
        plugins: { typedoc },
        rules: {
            "typedoc/no-unresolved-typedoc-link": "error",
        },
    },
];
```

## When not to use it

Disable this rule for codebases that intentionally keep unresolved placeholder links during draft API design.

## Package documentation

- [TypeDoc link tags](https://typedoc.org/documents/Tags._link_.html)

> **Rule catalog ID:** R003

## Further reading

- [TSDoc declaration references](https://tsdoc.org/pages/tags/link/)
