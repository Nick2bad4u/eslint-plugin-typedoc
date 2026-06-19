# require-type-param-tag-description

Require each `@typeParam` / `@template` tag to include a human-readable description.

## Targeted pattern scope

This rule checks generic TypeDoc comments on classes, interfaces, functions, methods, and type aliases.

## What this rule reports

This rule reports generic tags that include a type parameter name but no explanatory description.

## Why this rule exists

Generic APIs are difficult to use without clear type-parameter intent. This rule ensures every generic tag carries useful semantics.

## ❌ Incorrect

```ts
/**
 * Identity helper.
 *
 * @typeParam TValue
 *
 * @param value Input value.
 *
 * @returns Same value.
 */
export function identity<TValue>(value: TValue): TValue {
 return value;
}
```

## ✅ Correct

```ts
/**
 * Identity helper.
 *
 * @typeParam TValue Value type.
 *
 * @param value Input value.
 *
 * @returns Same value.
 */
export function identity<TValue>(value: TValue): TValue {
 return value;
}
```

## Behavior and migration notes

The rule reports missing generic prose without autofix, because meaningful descriptions are project-specific.

## ESLint flat config example

```ts
import typedocPlugin from "eslint-plugin-typedoc";

export default [
 {
  plugins: { typedoc: typedocPlugin },
  rules: {
   "typedoc/require-type-param-tag-description": "error",
  },
 },
];
```

## When not to use it

Disable if your team intentionally documents generic semantics elsewhere.

## Package documentation

TypeDoc package documentation:

- [TypeDoc `@typeParam` tag](https://typedoc.org/documents/Tags._typeParam.html)

## Further reading

> **Rule catalog ID:** R019

- [TypeDoc comments and tags](https://typedoc.org/documents/Doc_Comments.html)

## Adoption resources

- Pair with `require-type-param-tags` and `no-extra-type-param-tags` for robust generic documentation.
