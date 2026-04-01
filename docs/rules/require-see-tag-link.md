# require-see-tag-link

Require `@see` tags to contain a URL or a `{@link}` reference.

## Targeted pattern scope

This rule checks TypeDoc comments containing `@see` block tags that have non-empty content.

## What this rule reports

This rule reports `@see` tags whose content does not contain a URL (a scheme followed by `://`, such as `https://`) or a `{@link}` inline-tag expression. Plain descriptive prose without an actual link target is flagged.

Empty `@see` tags are handled separately by `typedoc/no-empty-see-tag` and are not flagged by this rule.

## Why this rule exists

`@see` tags are navigation aids. Their purpose is to point readers at a specific destination — an external URL or a TypeScript symbol via `{@link}`. When a `@see` tag contains only prose like `@see the related utilities`, it fails at its core purpose: readers have no actionable link to follow.

Enforcing that `@see` contains a URL or `{@link}` expression keeps generated documentation clean and navigable, and nudges authors to express cross-references with explicit links rather than ambiguous descriptions.

## ❌ Incorrect

```ts
/**
 * Normalize user-provided input.
 * @see String trimming documentation
 */
export function normalize(input: string): string {
    return input.trim();
}
```

```ts
/**
 * Widget component.
 * @see
 * Related widget factory.
 */
export class Widget {}
```

## ✅ Correct

```ts
/**
 * Normalize user-provided input.
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/trim
 */
export function normalize(input: string): string {
    return input.trim();
}
```

```ts
/**
 * Widget component.
 * @see {@link WidgetFactory} for the preferred construction pattern.
 */
export class Widget {}
```

## Behavior and migration notes

- This rule checks only `@see` tags that already have content. Empty `@see` tags are out of scope (use `typedoc/no-empty-see-tag` for that).
- A URL is detected by the presence of a recognised URI scheme followed by `://`. The rule detects common schemes: `file`, `ftp`, `ftps`, `git`, `http`, `https`, `mailto`, `ssh`, and `svn`.
- A link is detected by the presence of a `{@link` expression anywhere in the tag body.
- Bare symbol names (e.g., `@see MyClass`) are **not** considered links by this rule. Use `{@link MyClass}` to make the reference explicit and tooling-friendly.
- This rule does not autofix because the correct link target must be determined by the author.

## ESLint flat config example

```ts
import typedocPlugin from "eslint-plugin-typedoc";

export default [
    {
        plugins: { typedoc: typedocPlugin },
        rules: {
            "typedoc/require-see-tag-link": "warn",
        },
    },
];
```

## When not to use it

Disable this rule if your project uses `@see` for cross-references that are resolved outside of the TypeDoc `{@link}` mechanism, such as bare symbol names that a custom renderer handles, or if your documentation workflow intentionally allows descriptive `@see` text.

## Package documentation

TypeDoc package documentation:

- [TypeDoc `@see` tag](https://typedoc.org/documents/Tags._see.html)

## Further reading

> **Rule catalog ID:** R031

- [TypeDoc tags overview](https://typedoc.org/documents/Tags.html)
- [TSDoc `@see` tag](https://tsdoc.org/pages/tags/see/)
- [JSDoc `@see` tag](https://jsdoc.app/tags-see)

## Adoption resources

- Pair with `typedoc/no-empty-see-tag` to cover both the empty case and the prose-only case together:
  - `no-empty-see-tag` flags `@see` with no content.
  - `require-see-tag-link` flags `@see` with content that isn't a URL or `{@link}`.
- Both rules are enabled in `typedoc.configs.strict` and `typedoc.configs.all`.
