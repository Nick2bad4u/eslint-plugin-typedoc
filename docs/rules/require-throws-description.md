# require-throws-description

Require `@throws` tags to include a human-readable description.

## Targeted pattern scope

This rule checks TypeDoc comments on function-like declarations and methods that include a `@throws` (or `@throw`) tag.

## What this rule reports

This rule reports throws tags that contain no prose description (for example only `{TypeError}`).

## Why this rule exists

Error type names alone are not enough for consumers. API docs should explain when/why errors occur.

## ❌ Incorrect

```ts
/**
 * Parse value.
 *
 * @param input Input value.
 *
 * @throws {TypeError}
 */
export function parseValue(input: string): number {
 if (input.length === 0) {
  throw new TypeError("Input must not be empty.");
 }

 return Number.parseInt(input, 10);
}
```

## ✅ Correct

```ts
/**
 * Parse value.
 *
 * @param input Input value.
 *
 * @throws {TypeError} When input is empty.
 */
export function parseValue(input: string): number {
 if (input.length === 0) {
  throw new TypeError("Input must not be empty.");
 }

 return Number.parseInt(input, 10);
}
```

## Behavior and migration notes

No autofix is provided because generated throw descriptions would be guesswork.

## ESLint flat config example

```ts
import typedocPlugin from "eslint-plugin-typedoc";

export default [
 {
  plugins: { typedoc: typedocPlugin },
  rules: {
   "typedoc/require-throws-description": "error",
  },
 },
];
```

## When not to use it

Disable if your team documents error semantics in separate docs and keeps tags minimal.

## Package documentation

TypeDoc package documentation:

- [TypeDoc `@throws` tag](https://typedoc.org/documents/Tags._throws.html)

## Further reading

> **Rule catalog ID:** R021

- [TypeDoc comments and tags](https://typedoc.org/documents/Doc_Comments.html)

## Adoption resources

- Pair with `require-throws-tag` to enforce both throw-tag presence and quality.
