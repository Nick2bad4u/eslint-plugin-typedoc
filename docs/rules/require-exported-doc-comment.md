# require-exported-doc-comment

Require exported declarations to include a leading TypeDoc comment block.

## Targeted pattern scope

This rule targets exported declarations that TypeDoc commonly documents, including:

- exported functions and classes
- exported interfaces, type aliases, enums, and namespaces
- exported variable declarations

## What this rule reports

This rule reports exported declarations that do not have an adjacent leading TypeDoc block comment.

## Why this rule exists

Public exports define your documented API surface. Missing comments on exports produce gaps in generated docs and make API intent harder to understand.

## ❌ Incorrect

```ts
export function createClient(): void {}
```

## ✅ Correct

```ts
/**
 * Create the primary API client.
 */
export function createClient(): void {}
```

## Behavior and migration notes

This rule does **not** apply changes during `--fix`.

It provides an editor suggestion that inserts a minimal documentation stub (for example: `buildClient API documentation.`) so authors can replace it with real API intent.

By default, this rule ignores non-production paths:

- `test/**`, `tests/**`
- `benchmark/**`, `benchmarks/**`
- `fixture/**`, `fixtures/**`
- `temp/**`, `coverage/**`, `dist/**`, `build/**`, `generated/**`

Use `ignorePatterns` to override those defaults, and `ignoreDeclarationFiles: true` when declaration outputs should be skipped.

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
            "typedoc/require-exported-doc-comment": "error",
        },
    },
];
```

## When not to use it

Disable this rule when a package intentionally has no generated API documentation and treats exports as internal-only implementation details.

## Package documentation

TypeDoc package documentation:

- [TypeDoc comments](https://typedoc.org/documents/Doc_Comments.html)

## Further reading

> **Rule catalog ID:** R003

- [TypeScript handbook: declaration files introduction](https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html)

## Adoption resources

- Start with `typedoc.configs.recommended` and apply suggestions during docs review, not blanket `--fix` runs.
