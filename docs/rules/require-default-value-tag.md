# require-default-value-tag

Require documented exported constants with simple literal defaults to include `@defaultValue` tags.

## Targeted pattern scope

This rule checks documented exported `const` declarations with a single declarator and a simple initializer such as:

- string/number/boolean/null literals,
- array literals,
- object literals,
- template literals without expressions.

## What this rule reports

This rule reports documented exported constants that have a simple default value but no `@defaultValue` (or `@default`) tag.

## Why this rule exists

Default values are especially useful in generated docs for exported configuration constants and public defaults. This rule keeps those defaults visible and explicit.

## ❌ Incorrect

```ts
/**
 * Default theme color used by the docs site.
 */
export const themeColor = "#2B134E";
```

## ✅ Correct

```ts
/**
 * Default theme color used by the docs site.
 * @defaultValue `"#2B134E"`
 */
export const themeColor = "#2B134E";
```

## Behavior and migration notes

Autofix inserts a canonical `@defaultValue` tag containing the initializer source text.

## ESLint flat config example

```ts
import typedocPlugin from "eslint-plugin-typedoc";

export default [
    {
        plugins: { typedoc: typedocPlugin },
        rules: {
            "typedoc/require-default-value-tag": "error",
        },
    },
];
```

## When not to use it

Disable when exported constants are documented elsewhere and inline default-value prose is intentionally omitted.

## Package documentation

TypeDoc package documentation:

- [TypeDoc `@defaultValue` tag](https://typedoc.org/documents/Tags._defaultValue.html)

## Further reading

> **Rule catalog ID:** R024

- [TypeDoc comments and tags](https://typedoc.org/documents/Doc_Comments.html)

## Adoption resources

- Useful for public constants, configuration defaults, and exported theme tokens.
