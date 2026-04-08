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

This rule does **not** apply changes during `--fix`.

It provides an editor suggestion that inserts a minimal `@returns` tag, so authors can add a meaningful return description deliberately.

By default, this rule ignores non-production paths:

- `test/**`, `tests/**`
- `benchmark/**`, `benchmarks/**`
- `fixture/**`, `fixtures/**`
- `temp/**`, `coverage/**`, `dist/**`, `build/**`, `generated/**`

Use `ignorePatterns` to override those defaults, and `ignoreDeclarationFiles: true` to skip declaration files such as `.d.ts` / `.d.mts`.

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
