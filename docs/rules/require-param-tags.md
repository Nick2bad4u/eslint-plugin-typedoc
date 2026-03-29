# require-param-tags

Require `@param` tags for every parameter in documented declarations.

## Targeted pattern scope

This rule inspects documented declarations with parameters, including function declarations, declared functions, and class methods.

## What this rule reports

This rule reports documented declarations when one or more parameters are missing corresponding `@param` tags.

## Why this rule exists

Parameter names without matching docs create incomplete API documentation and force readers to infer intent from implementation details.

## ❌ Incorrect

```ts
/**
 * Build a user profile.
 */
export function buildProfile(name: string, isActive: boolean): string {
    return `${name}:${isActive ? "active" : "inactive"}`;
}
```

## ✅ Correct

```ts
/**
 * Build a user profile.
 * @param name User display name.
 * @param isActive Whether the user is active.
 */
export function buildProfile(name: string, isActive: boolean): string {
    return `${name}:${isActive ? "active" : "inactive"}`;
}
```

## Behavior and migration notes

Autofix appends missing `@param` tags with TODO descriptions immediately before the closing `*/` of the existing comment block.

## ESLint flat config example

```ts
import typedocPlugin from "eslint-plugin-typedoc";

export default [
    {
        plugins: { typedoc: typedocPlugin },
        rules: {
            "typedoc/require-param-tags": "error",
        },
    },
];
```

## When not to use it

Disable this rule if your team intentionally documents parameters outside of TypeDoc tags and does not rely on generated TypeDoc parameter sections.

## Package documentation

TypeDoc package documentation:

- [TypeDoc `@param` tag](https://typedoc.org/documents/Tags._param.html)

## Further reading

> **Rule catalog ID:** R004

- [TypeDoc comments and tags](https://typedoc.org/documents/Doc_Comments.html)

## Adoption resources

- Roll this rule out after `require-exported-doc-comment` so all relevant declarations already have comment blocks.
