# require-returns-tag

Require `@returns` tags for documented declarations with non-void return types.

## Targeted pattern scope

This rule checks documented function declarations, declared functions, and methods that have explicit non-void return types.

## What this rule reports

This rule reports documented declarations with non-void return types when their TypeDoc block does not include `@returns` (or `@return`).

## Why this rule exists

Return value documentation is part of API usability. Missing `@returns` tags make generated docs incomplete and increase onboarding friction for API consumers.

## ❌ Incorrect

```ts
/**
 * Build a cache key for a user id.
 */
export function toCacheKey(userId: string): string {
    return `user:${userId}`;
}
```

## ✅ Correct

```ts
/**
 * Build a cache key for a user id.
 * @returns Stable cache key for storage lookups.
 */
export function toCacheKey(userId: string): string {
    return `user:${userId}`;
}
```

## Behavior and migration notes

Autofix inserts a TODO `@returns` line into the existing doc block so teams can capture missing return semantics incrementally.

## ESLint flat config example

```ts
import typedocPlugin from "eslint-plugin-typedoc";

export default [
    {
        plugins: { typedoc: typedocPlugin },
        rules: {
            "typedoc/require-returns-tag": "error",
        },
    },
];
```

## When not to use it

Disable this rule for internal codebases where return semantics are intentionally inferred from types alone and generated docs are not consumed.

## Package documentation

TypeDoc package documentation:

- [TypeDoc `@returns` tag](https://typedoc.org/documents/Tags._returns.html)

## Further reading

> **Rule catalog ID:** R005

- [TypeDoc comments and tags](https://typedoc.org/documents/Doc_Comments.html)

## Adoption resources

- Enable this rule after `require-param-tags` when your team is ready for stricter API completeness.
