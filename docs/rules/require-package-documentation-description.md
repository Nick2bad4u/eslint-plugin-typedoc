# require-package-documentation-description

Require top-level `@packageDocumentation` comments to include descriptive prose.

## Targeted pattern scope

This rule checks exporting modules that already have a package-level TypeDoc comment.

## What this rule reports

This rule reports package documentation blocks that contain only the tag and no meaningful description text.

## Why this rule exists

A bare package tag without explanatory prose adds little value to generated docs. Modules should explain what the exported API is for.

## ❌ Incorrect

```ts
/**
 * @packageDocumentation
 */

export function add(left: number, right: number): number {
 return left + right;
}
```

## ✅ Correct

```ts
/**
 * @packageDocumentation
 * Public API helpers for parsing values.
 */

export function add(left: number, right: number): number {
 return left + right;
}
```

## Behavior and migration notes

This rule intentionally does not autofix because module descriptions should be written intentionally.

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
 }?,
];
```

## ESLint flat config example

```ts
import typedocPlugin from "eslint-plugin-typedoc";

export default [
 {
  plugins: { typedoc: typedocPlugin },
  rules: {
   "typedoc/require-package-documentation-description": "error",
  },
 },
];
```

## When not to use it

Disable when package-level descriptions are intentionally managed elsewhere.

## Package documentation

TypeDoc package documentation:

- [TypeDoc `@packageDocumentation` tag](https://typedoc.org/documents/Tags._packageDocumentation.html)

## Further reading

> **Rule catalog ID:** R023

- [TypeDoc comments and tags](https://typedoc.org/documents/Doc_Comments.html)

## Adoption resources

- Use alongside `require-package-documentation` and `prefer-package-documentation-tag` for package-doc quality.
