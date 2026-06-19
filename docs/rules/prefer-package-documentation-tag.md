# prefer-package-documentation-tag

Prefer `@packageDocumentation` over `@module` in package-level TypeDoc comments.

## Targeted pattern scope

This rule checks TypeDoc block comments and rewrites `@module` tags to the canonical `@packageDocumentation` form.

## What this rule reports

This rule reports `@module` tags and provides an autofix to replace them with `@packageDocumentation`.

## Why this rule exists

TypeDoc supports both forms, but canonicalizing package-level tags improves consistency across repos and generated docs.

## ❌ Incorrect

```ts
/**
 * @module
 */
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

Autofix is safe and textual: only the tag identifier is changed.

## ESLint flat config example

```ts
import typedocPlugin from "eslint-plugin-typedoc";

export default [
 {
  plugins: { typedoc: typedocPlugin },
  rules: {
   "typedoc/prefer-package-documentation-tag": "error",
  },
 },
];
```

## When not to use it

Disable if your team intentionally standardizes on `@module` tags.

## Package documentation

TypeDoc package documentation:

- [TypeDoc `@packageDocumentation` tag](https://typedoc.org/documents/Tags._packageDocumentation.html)

## Further reading

> **Rule catalog ID:** R017

- [TypeDoc comments and tags](https://typedoc.org/documents/Doc_Comments.html)

## Adoption resources

- Use with `require-package-documentation` for complete and canonical package docs.
