# no-empty-remarks-tag

Disallow empty `@remarks` tags in TypeDoc comments.

## Targeted pattern scope

This rule checks TypeDoc comments containing `@remarks` block tags.

## What this rule reports

This rule reports `@remarks` tags that do not contain meaningful content, including empty fenced code blocks with no prose or code inside them.

## Why this rule exists

`@remarks` sections are often used for operational caveats, lifecycle notes, migration details, and longer-form API guidance.

An empty remarks section adds visible noise to generated documentation and usually signals that the author intended to add important context but never finished it.

## ❌ Incorrect

```ts
/**
 * Normalize user-provided input.
 * @remarks
 */
export function normalize(input: string): string {
    return input.trim();
}
```

## ✅ Correct

```ts
/**
 * Normalize user-provided input.
 * @remarks Trims leading and trailing whitespace before returning the value.
 */
export function normalize(input: string): string {
    return input.trim();
}
```

## Behavior and migration notes

- This rule checks only `@remarks` tags. It does not require you to use `@remarks`.
- Empty fenced code blocks inside `@remarks` are treated as empty content.
- This rule does not autofix because meaningful remarks must be authored intentionally.

## ESLint flat config example

```ts
import typedocPlugin from "eslint-plugin-typedoc";

export default [
    {
        plugins: { typedoc: typedocPlugin },
        rules: {
            "typedoc/no-empty-remarks-tag": "error",
        },
    },
];
```

## When not to use it

Disable this rule only if your team intentionally leaves placeholder `@remarks` tags in source during a staged documentation workflow.

## Package documentation

TypeDoc package documentation:

- [TypeDoc tags overview](https://typedoc.org/documents/Tags.html)

## Further reading

> **Rule catalog ID:** R026

- [TypeDoc comments](https://typedoc.org/documents/Doc_Comments.html)
- [TypeDoc comment options](https://typedoc.org/documents/Options.Comments.html)

## Adoption resources

- Pair with `require-exported-doc-comment-description` when you want exported APIs to include both a strong summary and meaningful long-form follow-up context.
- Pair with `typedoc.configs.markdown` when your rendered markdown docs should avoid placeholder secondary sections.
