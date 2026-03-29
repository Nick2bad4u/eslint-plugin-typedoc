# no-unknown-tags

Disallow unknown TypeDoc tags and normalize common alias tags.

## Targeted pattern scope

This rule checks `@tag` markers in TypeDoc block comments and compares them to a supported TypeDoc tag set.

## What this rule reports

This rule reports tags that are not recognized by the configured TypeDoc tag allowlist.

It also autofixes common aliases such as:

- `@return` -> `@returns`
- `@arg` -> `@param`
- `@argument` -> `@param`

## Why this rule exists

Unknown tags are easy to miss during review and often result in incomplete or misleading generated docs. Reporting them at lint time keeps documentation semantics consistent.

## ❌ Incorrect

```ts
/**
 * @return The normalized output.
 */
export function normalize(value: string): string {
    return value.trim();
}
```

```ts
/**
 * @foo Unsupported custom tag.
 */
export function run(): void {}
```

## ✅ Correct

```ts
/**
 * @returns The normalized output.
 */
export function normalize(value: string): string {
    return value.trim();
}
```

## Behavior and migration notes

Use autofix for known aliases, then manually resolve any remaining unknown tags to valid TypeDoc tags.

## ESLint flat config example

```ts
import typedocPlugin from "eslint-plugin-typedoc";

export default [
    {
        plugins: { typedoc: typedocPlugin },
        rules: {
            "typedoc/no-unknown-tags": "error",
        },
    },
];
```

## When not to use it

Disable this rule only when your team intentionally uses custom non-TypeDoc tags and accepts that generated docs may ignore them.

## Package documentation

TypeDoc package documentation:

- [TypeDoc tag reference](https://typedoc.org/documents/Tags.html)

## Further reading

> **Rule catalog ID:** R002

- [TypeDoc comments and tags](https://typedoc.org/documents/Doc_Comments.html)

## Adoption resources

- Run this rule with `--fix` first to normalize common alias tags across large codebases.
