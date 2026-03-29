# enforce-typedoc-tags

Ensure exported function TypeDoc blocks include required `@param` and `@returns` tags.

## Targeted pattern scope

This rule targets exported function declarations (including exported function-valued variables) that already have a TypeDoc block.

## What this rule reports

- Missing `@param` tags for simple named parameters.
- Missing `@returns` for explicitly non-void return signatures (when enabled).

## Why this rule exists

Incomplete tags lead to weaker generated API docs and inconsistent review quality. Running this in ESLint keeps docs quality checks in the same pipeline as code-quality checks.

## ❌ Incorrect

```ts
/**
 * Compute a score.
 */
export function score(input: string): number {
    return input.length;
}
```

## ✅ Correct

```ts
/**
 * Compute a score.
 * @param input The source text.
 * @returns Numeric score.
 */
export function score(input: string): number {
    return input.length;
}
```

## Behavior and migration notes

Default options:

```ts
{
    requireReturnsTag: true;
}
```

The autofix inserts only missing tags and keeps existing comments intact.

## ESLint flat config example

```ts
import typedoc from "eslint-plugin-typedoc";

export default [
    {
        plugins: { typedoc },
        rules: {
            "typedoc/enforce-typedoc-tags": "error",
        },
    },
];
```

## When not to use it

Disable this rule if your team intentionally keeps comment summaries without detailed tag blocks.

## Package documentation

- [TypeDoc tags reference](https://typedoc.org/documents/Tags.html)

> **Rule catalog ID:** R001

## Further reading

- [TypeDoc documentation](https://typedoc.org/)
- [TSDoc spec](https://tsdoc.org/)
