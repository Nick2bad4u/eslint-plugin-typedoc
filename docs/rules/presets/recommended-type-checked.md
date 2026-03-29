---
title: Recommended (type-checked) preset
---

# 🟠 Recommended (type-checked)

Use this when you want the recommended baseline plus rules that require
TypeScript type information.

## Config key

```ts
typefest.configs["recommended-type-checked"]
```

## Flat Config example

```ts
import typefest from "eslint-plugin-typefest";

export default [typefest.configs["recommended-type-checked"]];
```

This preset is type-aware and includes
`languageOptions.parserOptions.projectService: true`.

## Rules in this preset

- `Fix` legend:
  - `🔧` = autofixable
  - `💡` = suggestions available
  - `—` = report only

### Type-aware additions over `recommended`

| Rule | Fix |
| --- | :-: |
| [`prefer-ts-extras-array-includes`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-array-includes) | 🔧 💡 |
| [`prefer-ts-extras-array-last`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-array-last) | 🔧 💡 |
| [`prefer-ts-extras-is-empty`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-is-empty) | 🔧 |
| [`prefer-ts-extras-safe-cast-to`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-safe-cast-to) | 🔧 |
| [`prefer-ts-extras-set-has`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-set-has) | 🔧 💡 |
| [`prefer-type-fest-array-length`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-array-length) | 🔧 |

### Baseline rules inherited from `recommended`

| Rule | Fix |
| --- | :-: |
| [`prefer-ts-extras-assert-defined`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-assert-defined) | 🔧 💡 |
| [`prefer-ts-extras-assert-error`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-assert-error) | 💡 |
| [`prefer-ts-extras-assert-present`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-assert-present) | 🔧 💡 |
| [`prefer-ts-extras-is-defined`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-is-defined) | 🔧 |
| [`prefer-ts-extras-is-defined-filter`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-is-defined-filter) | 🔧 |
| [`prefer-ts-extras-is-finite`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-is-finite) | 🔧 |
| [`prefer-ts-extras-is-infinite`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-is-infinite) | 🔧 |
| [`prefer-ts-extras-is-integer`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-is-integer) | 🔧 |
| [`prefer-ts-extras-is-present`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-is-present) | 🔧 |
| [`prefer-ts-extras-is-present-filter`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-is-present-filter) | 🔧 |
| [`prefer-ts-extras-is-safe-integer`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-is-safe-integer) | 🔧 |
| [`prefer-ts-extras-key-in`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-key-in) | 🔧 |
| [`prefer-ts-extras-not`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-not) | 🔧 |
| [`prefer-ts-extras-object-has-in`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-object-has-in) | 🔧 💡 |
| [`prefer-ts-extras-object-has-own`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-object-has-own) | 🔧 💡 |
| [`prefer-type-fest-abstract-constructor`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-abstract-constructor) | 🔧 |
| [`prefer-type-fest-and-all`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-and-all) | 🔧 |
| [`prefer-type-fest-arrayable`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-arrayable) | 🔧 |
| [`prefer-type-fest-async-return-type`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-async-return-type) | 🔧 |
| [`prefer-type-fest-conditional-pick`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-conditional-pick) | 🔧 |
| [`prefer-type-fest-conditional-pick-deep`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-conditional-pick-deep) | 🔧 |
| [`prefer-type-fest-constructor`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-constructor) | 🔧 |
| [`prefer-type-fest-except`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-except) | 🔧 |
| [`prefer-type-fest-if`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-if) | 🔧 |
| [`prefer-type-fest-iterable-element`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-iterable-element) | 🔧 |
| [`prefer-type-fest-json-array`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-json-array) | 🔧 |
| [`prefer-type-fest-json-object`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-json-object) | 🔧 |
| [`prefer-type-fest-json-primitive`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-json-primitive) | 🔧 |
| [`prefer-type-fest-json-value`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-json-value) | 💡 |
| [`prefer-type-fest-keys-of-union`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-keys-of-union) | 🔧 |
| [`prefer-type-fest-less-than`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-less-than) | 🔧 |
| [`prefer-type-fest-less-than-or-equal`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-less-than-or-equal) | 🔧 |
| [`prefer-type-fest-literal-union`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-literal-union) | 🔧 |
| [`prefer-type-fest-merge-exclusive`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-merge-exclusive) | 🔧 |
| [`prefer-type-fest-non-empty-tuple`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-non-empty-tuple) | 🔧 |
| [`prefer-type-fest-omit-index-signature`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-omit-index-signature) | 🔧 |
| [`prefer-type-fest-optional`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-optional) | 🔧 |
| [`prefer-type-fest-or-all`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-or-all) | 🔧 |
| [`prefer-type-fest-partial-deep`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-partial-deep) | 🔧 |
| [`prefer-type-fest-primitive`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-primitive) | 🔧 |
| [`prefer-type-fest-promisable`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-promisable) | 🔧 |
| [`prefer-type-fest-readonly-deep`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-readonly-deep) | 🔧 |
| [`prefer-type-fest-require-all-or-none`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-require-all-or-none) | 🔧 |
| [`prefer-type-fest-require-at-least-one`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-require-at-least-one) | 🔧 |
| [`prefer-type-fest-require-exactly-one`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-require-exactly-one) | 🔧 |
| [`prefer-type-fest-require-one-or-none`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-require-one-or-none) | 🔧 |
| [`prefer-type-fest-required-deep`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-required-deep) | 🔧 |
| [`prefer-type-fest-schema`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-schema) | 🔧 |
| [`prefer-type-fest-set-non-nullable`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-set-non-nullable) | 🔧 |
| [`prefer-type-fest-set-optional`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-set-optional) | 🔧 |
| [`prefer-type-fest-set-readonly`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-set-readonly) | 🔧 |
| [`prefer-type-fest-set-required`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-set-required) | 🔧 |
| [`prefer-type-fest-simplify`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-simplify) | 🔧 |
| [`prefer-type-fest-tagged-brands`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-tagged-brands) | 🔧 |
| [`prefer-type-fest-tuple-of`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-tuple-of) | 🔧 |
| [`prefer-type-fest-union-member`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-union-member) | 🔧 |
| [`prefer-type-fest-union-to-tuple`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-union-to-tuple) | 🔧 |
| [`prefer-type-fest-unknown-array`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-unknown-array) | 🔧 |
| [`prefer-type-fest-unknown-map`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-unknown-map) | 🔧 |
| [`prefer-type-fest-unknown-record`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-unknown-record) | 🔧 |
| [`prefer-type-fest-unknown-set`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-unknown-set) | 🔧 |
| [`prefer-type-fest-unwrap-tagged`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-unwrap-tagged) | 🔧 |
| [`prefer-type-fest-value-of`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-value-of) | 🔧 |
| [`prefer-type-fest-writable`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-writable) | 🔧 |
| [`prefer-type-fest-writable-deep`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-writable-deep) | 🔧 |
