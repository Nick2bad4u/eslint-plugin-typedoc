# require-example-tag

Require `@example` tags on documented exported declarations.

## Targeted pattern scope

This rule checks exported declarations that already have a TypeDoc comment:

- classes,
- functions,
- enums,
- interfaces,
- type aliases,
- exported variables.

## What this rule reports

This rule reports documented exported declarations that are missing an `@example` tag.

## Why this rule exists

Type signatures explain shape, but examples explain usage. This rule drives practical API documentation quality in generated TypeDoc output.

## ❌ Incorrect

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

## ✅ Correct

```ts
/**
 * Add two numbers.
 * @param left Left value.
 * @param right Right value.
 * @returns Sum.
 * @example
 * add(1, 2);
 */
export function add(left: number, right: number): number {
    return left + right;
}
```

## Behavior and migration notes

Autofix appends a TODO `@example` block line. Replace placeholder text with a realistic snippet before publishing docs.

## ESLint flat config example

```ts
import typedocPlugin from "eslint-plugin-typedoc";

export default [
    {
        plugins: { typedoc: typedocPlugin },
        rules: {
            "typedoc/require-example-tag": "error",
        },
    },
];
```

## When not to use it

Disable when examples live in external docs and you intentionally keep TypeDoc comments compact.

## Package documentation

TypeDoc package documentation:

- [TypeDoc `@example` tag](https://typedoc.org/documents/Tags._example.html)

## Further reading

> **Rule catalog ID:** R012

- [TypeDoc comments and tags](https://typedoc.org/documents/Doc_Comments.html)

## Adoption resources

- Enable in strict mode after baseline documentation completeness rules are stable.
