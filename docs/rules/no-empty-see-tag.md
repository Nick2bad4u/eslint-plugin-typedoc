# no-empty-see-tag

Disallow empty `@see` tags in TypeDoc comments.

## Targeted pattern scope

This rule checks TypeDoc comments containing `@see` block tags.

## What this rule reports

This rule reports `@see` tags that do not contain any meaningful reference — no URL, no symbol, and no `{@link}` expression. Empty fenced code blocks are also treated as empty content.

## Why this rule exists

`@see` tags exist to guide readers toward related documentation, external resources, or related API symbols. An empty `@see` tag is a dangling pointer: it tells the reader to look somewhere, but provides no destination.

Empty or accidental `@see` entries often arise from incomplete edits or copy-paste issues. This rule flags them early so developers fill in the reference before shipping documentation.

## ❌ Incorrect

```ts
/**
 * Normalize user-provided input.
 *
 * @see
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
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/trim
 */
export function normalize(input: string): string {
 return input.trim();
}
```

```ts
/**
 * Widget component.
 *
 * @see {@link WidgetFactory} for the preferred construction pattern.
 */
export class Widget {}
```

## Behavior and migration notes

- This rule checks only `@see` tags. It does not require you to use `@see`.
- Empty fenced code blocks inside `@see` are treated as empty content.
- This rule does not autofix because references must be authored intentionally.
- To additionally enforce that `@see` content must be a URL or `{@link}` reference (not plain prose), pair this rule with `typedoc/require-see-tag-link`.

## ESLint flat config example

```ts
import typedocPlugin from "eslint-plugin-typedoc";

export default [
 {
  plugins: { typedoc: typedocPlugin },
  rules: {
   "typedoc/no-empty-see-tag": "error",
  },
 },
];
```

## When not to use it

Disable this rule only if your team explicitly uses empty `@see` tags as intentional placeholders during an active documentation workflow, removing them before publishing.

## Package documentation

TypeDoc package documentation:

- [TypeDoc `@see` tag](https://typedoc.org/documents/Tags._see.html)

## Further reading

> **Rule catalog ID:** R029

- [TypeDoc tags overview](https://typedoc.org/documents/Tags.html)
- [TSDoc `@see` tag](https://tsdoc.org/pages/tags/see/)
- [JSDoc `@see` tag](https://jsdoc.app/tags-see)

## Adoption resources

- Pair with `typedoc/require-see-tag-link` to enforce that `@see` tags contain an actual URL or `{@link}` reference, not just descriptive prose.
