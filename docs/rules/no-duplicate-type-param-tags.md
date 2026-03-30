# no-duplicate-type-param-tags

Disallow duplicate generic tags (`@typeParam` / `@template`) for the same type parameter name.

## Targeted pattern scope

This rule checks TypeDoc comments on generic declarations (functions, methods, classes, interfaces, and type aliases).

## What this rule reports

This rule reports when a type parameter name is documented multiple times in one comment block.

## Why this rule exists

Duplicate generic docs introduce conflicting descriptions and reduce documentation clarity for API consumers.

## ❌ Incorrect

```ts
/**
 * Identity helper.
 * @typeParam TValue Value type.
 * @template TValue Duplicate value type.
 * @param value Input value.
 * @returns Same value.
 */
export function identity<TValue>(value: TValue): TValue {
    return value;
}
```

## ✅ Correct

```ts
/**
 * Identity helper.
 * @typeParam TValue Value type.
 * @param value Input value.
 * @returns Same value.
 */
export function identity<TValue>(value: TValue): TValue {
    return value;
}
```

## Behavior and migration notes

The rule reports duplicates but does not autofix, since choosing which content to keep is semantic.

## ESLint flat config example

```ts
import typedocPlugin from "eslint-plugin-typedoc";

export default [
    {
        plugins: { typedoc: typedocPlugin },
        rules: {
            "typedoc/no-duplicate-type-param-tags": "error",
        },
    },
];
```

## When not to use it

Disable only if your team intentionally duplicates generic docs (rare and usually accidental).

## Package documentation

TypeDoc package documentation:

- [TypeDoc `@typeParam` tag](https://typedoc.org/documents/Tags._typeParam.html)

## Further reading

> **Rule catalog ID:** R016

- [TypeDoc comments and tags](https://typedoc.org/documents/Doc_Comments.html)

## Adoption resources

- Pair with `require-type-param-tags` and `no-extra-type-param-tags` for strong generic-doc consistency.
