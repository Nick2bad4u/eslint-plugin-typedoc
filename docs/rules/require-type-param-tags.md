# require-type-param-tags

Require `@typeParam` tags for documented generic declarations.

## Targeted pattern scope

This rule checks documented declarations that declare generic type parameters:

- function declarations and declared functions,
- methods,
- classes,
- interfaces,
- type aliases.

## What this rule reports

This rule reports missing type-parameter tags when a declaration has type parameters but its TypeDoc block omits one or more `@typeParam` entries.

## Why this rule exists

Generic APIs are harder to consume when type parameters are undocumented. This rule ensures generated docs explain each generic parameter's intent.

## ❌ Incorrect

```ts
/**
 * Map one value into another type.
 *
 * @typeParam TInput Input type.
 *
 * @param input Input value.
 * @param mapper Mapping function.
 *
 * @returns Mapped value.
 */
export function mapValue<TInput, TOutput>(
 input: TInput,
 mapper: (value: TInput) => TOutput
): TOutput {
 return mapper(input);
}
```

## ✅ Correct

```ts
/**
 * Map one value into another type.
 *
 * @typeParam TInput Input type.
 * @typeParam TOutput Output type.
 *
 * @param input Input value.
 * @param mapper Mapping function.
 *
 * @returns Mapped value.
 */
export function mapValue<TInput, TOutput>(
 input: TInput,
 mapper: (value: TInput) => TOutput
): TOutput {
 return mapper(input);
}
```

## Behavior and migration notes

This rule does **not** apply changes during `--fix`.

It provides an editor suggestion that inserts missing `@typeParam` tags without placeholder TODO prose.

By default, this rule ignores non-production paths:

- `test/**`, `tests/**`
- `benchmark/**`, `benchmarks/**`
- `fixture/**`, `fixtures/**`
- `temp/**`, `coverage/**`, `dist/**`, `build/**`, `generated/**`

Use `ignorePatterns` to override those defaults, and `ignoreDeclarationFiles: true` to skip declaration files such as `.d.ts` / `.d.mts`.

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
   "typedoc/require-type-param-tags": "error",
  },
 },
];
```

## When not to use it

Disable this rule when your API style intentionally avoids per-generic prose and relies solely on type signatures.

## Package documentation

TypeDoc package documentation:

- [TypeDoc `@typeParam` tag](https://typedoc.org/documents/Tags._typeParam.html)

## Further reading

> **Rule catalog ID:** R007

- [TypeDoc comments and tags](https://typedoc.org/documents/Doc_Comments.html)

## Adoption resources

- Enable this rule after `require-param-tags`/`require-returns-tag` for full generic API coverage.
