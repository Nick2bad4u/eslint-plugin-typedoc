# no-extra-type-param-tags

Disallow stale generic tags (`@typeParam`/`@template`) that do not map to declared type parameters.

## Targeted pattern scope

This rule checks documented generic declarations:

- function declarations and declared functions,
- methods,
- classes,
- interfaces,
- type aliases.

## What this rule reports

This rule reports generic documentation tags whose names are not present in the declaration's generic type parameter list.

## Why this rule exists

Generic signatures change frequently. Stale generic tags are hard to spot manually and can mislead generated docs.

## ❌ Incorrect

```ts
/**
 * Build a pair.
 *
 * @typeParam TLeft Left type.
 * @typeParam TRight Right type.
 * @typeParam TExtra Stale generic.
 *
 * @param left Left value.
 * @param right Right value.
 *
 * @returns Pair tuple.
 */
export function pair<TLeft, TRight>(
 left: TLeft,
 right: TRight
): [TLeft, TRight] {
 return [left, right];
}
```

## ✅ Correct

```ts
/**
 * Build a pair.
 *
 * @typeParam TLeft Left type.
 * @typeParam TRight Right type.
 *
 * @param left Left value.
 * @param right Right value.
 *
 * @returns Pair tuple.
 */
export function pair<TLeft, TRight>(
 left: TLeft,
 right: TRight
): [TLeft, TRight] {
 return [left, right];
}
```

## Behavior and migration notes

This rule accepts both `@typeParam` and `@template` as generic tags, and only validates name mapping.

## ESLint flat config example

```ts
import typedocPlugin from "eslint-plugin-typedoc";

export default [
 {
  plugins: { typedoc: typedocPlugin },
  rules: {
   "typedoc/no-extra-type-param-tags": "error",
  },
 },
];
```

## When not to use it

Disable this rule during intermediate migrations where docs are intentionally ahead of code changes.

## Package documentation

TypeDoc package documentation:

- [TypeDoc `@typeParam` tag](https://typedoc.org/documents/Tags._typeParam.html)

## Further reading

> **Rule catalog ID:** R009

- [TypeDoc comments and tags](https://typedoc.org/documents/Doc_Comments.html)

## Adoption resources

- Combine with `require-type-param-tags` for complete and accurate generic docs.
