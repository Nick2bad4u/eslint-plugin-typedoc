# no-extra-param-tags

Disallow stale `@param` tags that do not map to real function parameters.

## Targeted pattern scope

This rule checks documented function declarations, methods, and declared functions where parameter names can be resolved safely.

## What this rule reports

This rule reports `@param` tags whose names are not present in the current function signature.

## Why this rule exists

Refactors often remove or rename parameters without updating docs. Stale `@param` tags create misleading API docs and confusion for consumers.

## ❌ Incorrect

```ts
/**
 * Add two numbers.
 *
 * @param left Left value.
 * @param right Right value.
 * @param extra Stale parameter.
 *
 * @returns Sum.
 */
export function add(left: number, right: number): number {
 return left + right;
}
```

## ✅ Correct

```ts
/**
 * Add two numbers.
 *
 * @param left Left value.
 * @param right Right value.
 *
 * @returns Sum.
 */
export function add(left: number, right: number): number {
 return left + right;
}
```

## Behavior and migration notes

The rule intentionally skips ambiguous destructuring signatures where exact name mapping is not always reliable.

## ESLint flat config example

```ts
import typedocPlugin from "eslint-plugin-typedoc";

export default [
 {
  plugins: { typedoc: typedocPlugin },
  rules: {
   "typedoc/no-extra-param-tags": "error",
  },
 },
];
```

## When not to use it

Disable this rule temporarily during large refactors with intentionally stale docs checkpoints.

## Package documentation

TypeDoc package documentation:

- [TypeDoc `@param` tag](https://typedoc.org/documents/Tags._param.html)

## Further reading

> **Rule catalog ID:** R008

- [TypeDoc comments and tags](https://typedoc.org/documents/Doc_Comments.html)

## Adoption resources

- Pair with `require-param-tags` to enforce both completeness and correctness of parameter docs.
