# no-duplicate-param-tags

Disallow duplicate `@param` tags for the same parameter name.

## Targeted pattern scope

This rule checks TypeDoc comments on function-like declarations and methods.

## What this rule reports

This rule reports when the same parameter name appears in multiple `@param` tags within one comment block.

## Why this rule exists

Duplicate parameter docs create ambiguity in rendered docs and usually indicate stale or copy-pasted comments.

## ❌ Incorrect

```ts
/**
 * Add two numbers.
 * @param left Left value.
 * @param left Duplicate doc.
 * @param right Right value.
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
 * @param left Left value.
 * @param right Right value.
 * @returns Sum.
 */
export function add(left: number, right: number): number {
    return left + right;
}
```

## Behavior and migration notes

This rule reports duplicates but does not autofix because deciding which duplicate text to keep is semantic.

## ESLint flat config example

```ts
import typedocPlugin from "eslint-plugin-typedoc";

export default [
    {
        plugins: { typedoc: typedocPlugin },
        rules: {
            "typedoc/no-duplicate-param-tags": "error",
        },
    },
];
```

## When not to use it

Disable only if your docs style intentionally duplicates parameter entries (rare and usually undesirable).

## Package documentation

TypeDoc package documentation:

- [TypeDoc `@param` tag](https://typedoc.org/documents/Tags._param.html)

## Further reading

> **Rule catalog ID:** R015

- [TypeDoc comments and tags](https://typedoc.org/documents/Doc_Comments.html)

## Adoption resources

- Pair with `no-extra-param-tags` and `require-param-tags` for full parameter-doc hygiene.
