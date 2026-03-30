# require-param-tag-description

Require each `@param` tag to include a human-readable description.

## Targeted pattern scope

This rule checks TypeDoc comments attached to function-like declarations and methods.

## What this rule reports

This rule reports `@param` tags that include a parameter name but no description text.

## Why this rule exists

A parameter list without explanations is not useful API documentation. This rule ensures each documented parameter has actionable prose.

## ❌ Incorrect

```ts
/**
 * Add two values.
 * @param left
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
 * Add two values.
 * @param left - Left value.
 * @param right Right value.
 * @returns Sum.
 */
export function add(left: number, right: number): number {
    return left + right;
}
```

## Behavior and migration notes

This rule intentionally does not autofix because generating high-quality prose descriptions is semantic.

## ESLint flat config example

```ts
import typedocPlugin from "eslint-plugin-typedoc";

export default [
    {
        plugins: { typedoc: typedocPlugin },
        rules: {
            "typedoc/require-param-tag-description": "error",
        },
    },
];
```

## When not to use it

Disable when parameter explanations are intentionally omitted in favor of external docs.

## Package documentation

TypeDoc package documentation:

- [TypeDoc `@param` tag](https://typedoc.org/documents/Tags._param.html)

## Further reading

> **Rule catalog ID:** R018

- [TypeDoc comments and tags](https://typedoc.org/documents/Doc_Comments.html)

## Adoption resources

- Use with `require-param-tags` and `no-extra-param-tags` for complete parameter-doc hygiene.
