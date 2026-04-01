# no-unknown-tags

Disallow unknown TypeDoc tags and normalize common alias tags.

## Targeted pattern scope

This rule checks `@tag` markers in TypeDoc block comments and compares them to TypeDoc's built-in supported block, inline, modifier, and TypeScript-compatibility tag set.

## What this rule reports

This rule reports tags that are not recognized by TypeDoc's built-in supported tag set.

It also autofixes common aliases such as:

- `@return` -> `@returns`
- `@arg` -> `@param`
- `@argument` -> `@param`

## Why this rule exists

Unknown tags are easy to miss during review and often result in incomplete or misleading generated docs. Reporting them at lint time keeps documentation semantics consistent.

This is especially important for JSDoc-oriented codebases, because TypeDoc intentionally supports only a subset of the broader JSDoc ecosystem.

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

This rule validates against TypeDoc's built-in tag list. If your project adds custom tags via `tsdoc.json` or TypeDoc config options, those custom tags may still be reported here.

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
- [TypeDoc JSDoc support](https://typedoc.org/documents/Doc_Comments.JSDoc_Support.html)
- [TypeDoc TSDoc support](https://typedoc.org/documents/Doc_Comments.TSDoc_Support.html)

## Adoption resources

- Run this rule with `--fix` first to normalize common alias tags across large codebases.
- If you need configurable enforcement for required comments or required tags, pair this plugin with [`eslint-plugin-tsdoc-require-2`](https://www.npmjs.com/package/eslint-plugin-tsdoc-require-2).
