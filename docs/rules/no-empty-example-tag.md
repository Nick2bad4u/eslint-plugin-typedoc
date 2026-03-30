# no-empty-example-tag

Disallow empty `@example` tags in TypeDoc comments.

## Targeted pattern scope

This rule checks TypeDoc comments containing `@example` block tags.

## What this rule reports

This rule reports `@example` tags that contain no meaningful example content, including empty fenced code blocks.

## Why this rule exists

An empty example section creates noise in generated docs and suggests incomplete API guidance.

## ❌ Incorrect

```ts
/**
 * Add two values.
 * @example
 */
export function add(left: number, right: number): number {
    return left + right;
}
```

## ✅ Correct

```ts
/**
 * Add two values.
 * @example
 * add(1, 2);
 */
export function add(left: number, right: number): number {
    return left + right;
}
```

## Behavior and migration notes

This rule does not autofix because meaningful examples are contextual and must be authored.

## ESLint flat config example

```ts
import typedocPlugin from "eslint-plugin-typedoc";

export default [
    {
        plugins: { typedoc: typedocPlugin },
        rules: {
            "typedoc/no-empty-example-tag": "error",
        },
    },
];
```

## When not to use it

Disable only if your team intentionally leaves placeholder example tags during staged documentation rollouts.

## Package documentation

TypeDoc package documentation:

- [TypeDoc `@example` tag](https://typedoc.org/documents/Tags._example.html)

## Further reading

> **Rule catalog ID:** R022

- [TypeDoc comments and tags](https://typedoc.org/documents/Doc_Comments.html)

## Adoption resources

- Pair with `require-example-tag` and `require-code-fence-language` for stronger example quality.
