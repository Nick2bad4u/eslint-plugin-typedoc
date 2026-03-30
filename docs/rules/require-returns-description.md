# require-returns-description

Require `@returns` tags to include a human-readable description.

## Targeted pattern scope

This rule checks TypeDoc comments on function-like declarations and methods that include a `@returns` (or `@return`) tag.

## What this rule reports

This rule reports return tags that have no prose description (for example only a type annotation).

## Why this rule exists

Type annotations alone do not explain semantics. This rule ensures return docs communicate meaning, not just shape.

## ❌ Incorrect

```ts
/**
 * Add values.
 * @param left Left value.
 * @param right Right value.
 * @returns {number}
 */
export function add(left: number, right: number): number {
    return left + right;
}
```

## ✅ Correct

```ts
/**
 * Add values.
 * @param left Left value.
 * @param right Right value.
 * @returns {number} Sum result.
 */
export function add(left: number, right: number): number {
    return left + right;
}
```

## Behavior and migration notes

No autofix is provided, because semantic return descriptions cannot be generated safely.

## ESLint flat config example

```ts
import typedocPlugin from "eslint-plugin-typedoc";

export default [
    {
        plugins: { typedoc: typedocPlugin },
        rules: {
            "typedoc/require-returns-description": "error",
        },
    },
];
```

## When not to use it

Disable when return semantics are documented externally and TypeDoc comments are intentionally concise.

## Package documentation

TypeDoc package documentation:

- [TypeDoc `@returns` tag](https://typedoc.org/documents/Tags._returns.html)

## Further reading

> **Rule catalog ID:** R020

- [TypeDoc comments and tags](https://typedoc.org/documents/Doc_Comments.html)

## Adoption resources

- Pair with `require-returns-tag` for complete return-tag presence and quality checks.
