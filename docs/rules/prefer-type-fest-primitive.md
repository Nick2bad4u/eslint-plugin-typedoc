# prefer-type-fest-primitive

Require TypeFest [`Primitive`](https://github.com/sindresorhus/type-fest/blob/main/source/primitive.d.ts) over explicit unions of primitive keyword types.

## Targeted pattern scope

This rule targets full primitive keyword unions used as standalone scalar aliases.

## What this rule reports

- Unions composed of all primitive keyword types:
  - `string`
  - `number`
  - `bigint`
  - `boolean`
  - `symbol`
  - `null`
  - `undefined`

## Why this rule exists

`Primitive` communicates intent directly and avoids repeating a long union in multiple places.

## ❌ Incorrect

```ts
type PrimitiveValue = string | number | bigint | boolean | symbol | null | undefined;
```

## ✅ Correct

```ts
type PrimitiveValue = Primitive;
```

## Behavior and migration notes

- `Primitive` covers all JS primitive categories: `string`, `number`, `bigint`, `boolean`, `symbol`, `null`, `undefined`.
- This rule targets unions that include the complete primitive set.
- Keep explicit subsets when domain semantics require only a subset of primitive categories.

## Additional examples

### ❌ Incorrect — Additional example

```ts
type Scalar = string | number | bigint | boolean | symbol | null | undefined;
```

### ✅ Correct — Additional example

```ts
type Scalar = Primitive;
```

### ✅ Correct — Repository-wide usage

```ts
type LeafValue = Primitive;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-primitive": "error",
        },
    },
];
```

## When not to use it

Disable this rule if explicit primitive unions are part of a published API contract.

## Package documentation

TypeFest package documentation:

Source file: [`source/primitive.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/primitive.d.ts)

```ts
/**
Matches any [primitive value](https://developer.mozilla.org/en-US/docs/Glossary/Primitive).

@category Type
*/
```

> **Rule catalog ID:** R053

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
