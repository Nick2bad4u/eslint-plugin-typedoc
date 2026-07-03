# no-empty-private-remarks-tag

Disallow empty `@privateRemarks` tags in TypeDoc comments.

## Targeted pattern scope

This rule checks TypeDoc comments containing `@privateRemarks` block tags.

## What this rule reports

This rule reports `@privateRemarks` tags that do not contain meaningful internal notes, including empty fenced code blocks with no content inside them.

## Why this rule exists

`@privateRemarks` sections are used to record implementation notes, known issues, and other internal context that is intentionally kept out of the public generated documentation.

An empty `@privateRemarks` tag is misleading: it implies there are internal notes to communicate while providing nothing of value. It also adds noise on future reads and makes documentation reviews harder.

## ❌ Incorrect

```ts
/**
 * Normalize user-provided input.
 */
export function normalize(input: string): string {
 return input.trim();
}
```

```ts
/**
 * Normalize user-provided input.
 */
export function normalize(input: string): string {
 return input.trim();
}
```

## ✅ Correct

```ts
/**
 * Normalize user-provided input.
 *
 * @privateRemarks
 *   Internal-only: do not expose in generated docs.
 */
export function normalize(input: string): string {
 return input.trim();
}
```

```ts
/**
 * Normalize user-provided input.
 *
 * @privateRemarks
 *   This function has a known edge case when input contains only non-breaking
 *   spaces — tracked in issue #42.
 */
export function normalize(input: string): string {
 return input.trim();
}
```

## Behavior and migration notes

- This rule checks only `@privateRemarks` tags. It does not require you to use `@privateRemarks`.
- Empty fenced code blocks inside `@privateRemarks` are treated as empty content.
- This rule does not autofix because meaningful private remarks must be authored intentionally.

## ESLint flat config example

```ts
import typedocPlugin from "eslint-plugin-typedoc";

export default [
 {
  plugins: { typedoc: typedocPlugin },
  rules: {
   "typedoc/no-empty-private-remarks-tag": "error",
  },
 },
];
```

## When not to use it

Disable this rule only if your team uses `@privateRemarks` as a placeholder tag and removes empty instances before publishing documentation.

## Package documentation

TypeDoc package documentation:

- [TypeDoc `@privateRemarks` tag](https://typedoc.org/documents/Tags._privateRemarks.html)

## Further reading

> **Rule catalog ID:** R028

- [TypeDoc tags overview](https://typedoc.org/documents/Tags.html)
- [TypeDoc comment options](https://typedoc.org/documents/Options.Comments.html)
