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
 *
 * @param left Left value.
 * @param right Right value.
 *
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
 *
 * @example
 *  add(1, 2);
 *
 * @param left Left value.
 * @param right Right value.
 *
 * @returns Sum.
 */
export function add(left: number, right: number): number {
 return left + right;
}
```

## Behavior and migration notes

This rule does **not** apply changes during `--fix`.

It offers an editor suggestion that inserts a minimal `@example` tag stub (`@example Example usage for <name>.`) and expects authors to replace it with a real, context-specific example.

By default, this rule ignores non-production paths:

- `test/**`, `tests/**`
- `benchmark/**`, `benchmarks/**`
- `fixture/**`, `fixtures/**`
- `temp/**`, `coverage/**`, `dist/**`, `build/**`, `generated/**`

You can override this behavior with:

- `ignorePatterns`: custom glob patterns
- `ignoreDeclarationFiles`: skip declaration files such as `.d.ts` and `.d.mts`

Rule options:

```ts
type RuleOptions = [
 {
  ignoreDeclarationFiles?: boolean;
  ignorePatterns?: string[];
 }?,
];
```

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
