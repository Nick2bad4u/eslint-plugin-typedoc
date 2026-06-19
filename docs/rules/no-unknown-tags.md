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
 * @returns The normalized output.
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

### `additionalTags` option

You can extend the built-in allowed tag set with the `additionalTags` option. This is the primary escape hatch for projects that define extra tags via TypeDoc plugins or a `tsdoc.json` configuration file.

```jsonc
// eslint.config.mjs
{
 "typedoc/no-unknown-tags": [
  "error",
  { "additionalTags": ["customTag", "myPluginTag"] },
 ],
}
```

In TypeScript flat config:

```ts
import typedocPlugin from "eslint-plugin-typedoc";

export default [
 {
  plugins: { typedoc: typedocPlugin },
  rules: {
   "typedoc/no-unknown-tags": [
    "error",
    { additionalTags: ["customTag", "myPluginTag"] },
   ],
  },
 },
];
```

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

Disable this rule only when your team intentionally uses custom non-TypeDoc tags
and accepts that generated docs may ignore them. Prefer the `additionalTags`
option over disabling the rule entirely.

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
