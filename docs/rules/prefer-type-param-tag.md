# prefer-type-param-tag

Prefer `@typeParam` over `@template` in TypeDoc block comments.

## Targeted pattern scope

This rule checks TypeDoc block comments and finds generic tags that use the `@template` alias.

## What this rule reports

This rule reports every `@template` tag and autofixes it to `@typeParam`.

## Why this rule exists

TypeDoc supports `@template`, but `@typeParam` is the canonical tag form in modern TypeDoc docs. Standardizing on one tag improves consistency and readability.

## ❌ Incorrect

```ts
/**
 * Identity helper.
 * @template TValue Value type.
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

Autofix is safe and textual: only the tag identifier is rewritten.

## ESLint flat config example

```ts
import typedocPlugin from "eslint-plugin-typedoc";

export default [
    {
        plugins: { typedoc: typedocPlugin },
        rules: {
            "typedoc/prefer-type-param-tag": "error",
        },
    },
];
```

## When not to use it

Disable this rule only if your project intentionally standardizes on `@template`.

## Package documentation

TypeDoc package documentation:

- [TypeDoc `@typeParam` tag](https://typedoc.org/documents/Tags._typeParam.html)

## Further reading

> **Rule catalog ID:** R010

- [TypeDoc comments and tags](https://typedoc.org/documents/Doc_Comments.html)

## Adoption resources

- Run with `--fix` once to normalize historical comments quickly.
