# require-package-documentation

Require a top-level `@packageDocumentation` comment in modules that export API.

## Targeted pattern scope

This rule checks source files containing module exports (`export ...`, `export default`, `export *`, TypeScript export assignments).

## What this rule reports

This rule reports modules that export API but do not include a top-level TypeDoc package/module documentation comment.

## Why this rule exists

Without package-level docs, generated TypeDoc module pages often lack context about API purpose, usage boundaries, or design intent.

## ❌ Incorrect

```ts
export function parseValue(value: string): number {
    return Number.parseInt(value, 10);
}
```

## ✅ Correct

```ts
/**
 * @packageDocumentation
 */

export function parseValue(value: string): number {
    return Number.parseInt(value, 10);
}
```

## Behavior and migration notes

This rule does **not** apply changes during `--fix`.

It provides an editor suggestion that inserts a minimal `@packageDocumentation` block, so teams can review and refine module-level docs intentionally.

By default, this rule ignores non-production paths:

- `test/**`, `tests/**`
- `benchmark/**`, `benchmarks/**`
- `fixture/**`, `fixtures/**`
- `temp/**`, `coverage/**`, `dist/**`, `build/**`, `generated/**`

Use `ignorePatterns` to override the defaults, and `ignoreDeclarationFiles: true` when declaration outputs should be skipped.

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
            "typedoc/require-package-documentation": "error",
        },
    },
];
```

## When not to use it

Disable this rule for private/internal code where module-level docs are intentionally omitted.

## Package documentation

TypeDoc package documentation:

- [TypeDoc `@packageDocumentation` tag](https://typedoc.org/documents/Tags._packageDocumentation.html)

## Further reading

> **Rule catalog ID:** R013

- [TypeDoc comments and tags](https://typedoc.org/documents/Doc_Comments.html)

## Adoption resources

- Pair with `require-exported-doc-comment` for complete module + symbol coverage.
