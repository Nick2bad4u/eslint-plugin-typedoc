# prefer-type-fest-union-to-tuple

Require TypeFest [`UnionToTuple<T>`](https://github.com/sindresorhus/type-fest/blob/main/source/union-to-tuple.d.ts) over legacy union-to-tuple aliases.

## Targeted pattern scope

This rule targets imported alias names that represent union-to-tuple conversion semantics (for example, `TuplifyUnion` and `TupleFromUnion`).

## What this rule reports

- Type references that resolve to imported union-to-tuple aliases.

## Why this rule exists

`UnionToTuple` is TypeFest’s canonical helper for converting unions to tuple forms. Using one canonical helper improves readability and migration consistency.

## ❌ Incorrect

```ts
import type { TuplifyUnion } from "type-aliases";

type KeysTuple = TuplifyUnion<"a" | "b" | "c">;
```

## ✅ Correct

```ts
import type { UnionToTuple } from "type-fest";

type KeysTuple = UnionToTuple<"a" | "b" | "c">;
```

## Behavior and migration notes

- `UnionToTuple<T>` converts union members into an unordered tuple.
- This rule only targets known alias names with equivalent intent.
- Keep custom aliases only when they intentionally provide additional behavior.

## Additional examples

### ❌ Incorrect — Additional example

```ts
import type { TupleFromUnion } from "type-aliases";

type NumericTuple = TupleFromUnion<1 | 2 | 3>;
```

### ✅ Correct — Additional example

```ts
import type { UnionToTuple } from "type-fest";

type NumericTuple = UnionToTuple<1 | 2 | 3>;
```

### ✅ Correct — Repository-wide usage

```ts
type AllowedTuple = UnionToTuple<AllowedValue>;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-union-to-tuple": "error",
        },
    },
];
```

## When not to use it

Disable this rule if compatibility requirements mandate custom alias names.

## Package documentation

TypeFest package documentation:

Source file: [`source/union-to-tuple.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/union-to-tuple.d.ts)

```ts
/**
Convert a union type into an unordered tuple type of its elements.

@category Array
*/
export type UnionToTuple<T, L = UnionMember<T>> = ...
```

> **Rule catalog ID:** R083

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Unions and Intersection Types](https://www.typescriptlang.org/docs/handbook/unions-and-intersections.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
