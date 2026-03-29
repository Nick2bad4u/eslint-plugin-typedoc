# no-typedoc-tag-alias

Disallow TypeDoc tag aliases and enforce canonical tag names.

## Targeted pattern scope

This rule scans TypeDoc block comments and rewrites known alias tags to canonical forms.

## What this rule reports

By default, the rule reports and fixes:

- `@arg` -> `@param`
- `@argument` -> `@param`
- `@return` -> `@returns`

## Why this rule exists

Canonical tags make generated docs and search tooling more consistent across teams.

## ❌ Incorrect

```ts
/**
 * @arg value Input value.
 * @return Output value.
 */
export function normalize(value: string): string {
    return value.trim();
}
```

## ✅ Correct

```ts
/**
 * @param value Input value.
 * @returns Output value.
 */
export function normalize(value: string): string {
    return value.trim();
}
```

## Behavior and migration notes

Default option structure:

```ts
{
    aliases: {
        "@arg": "@param",
        "@argument": "@param",
        "@return": "@returns",
    },
}
```

## ESLint flat config example

```ts
import typedoc from "eslint-plugin-typedoc";

export default [
    {
        plugins: { typedoc },
        rules: {
            "typedoc/no-typedoc-tag-alias": "error",
        },
    },
];
```

## When not to use it

Disable this rule if your docs tooling deliberately preserves alias tags for historical compatibility.

## Package documentation

- [TypeDoc tags reference](https://typedoc.org/documents/Tags.html)

> **Rule catalog ID:** R002

## Further reading

- [TSDoc spec](https://tsdoc.org/)
