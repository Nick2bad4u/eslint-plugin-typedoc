# prefer-type-fest-array-length

Require TypeFest [`ArrayLength<T>`](https://github.com/sindresorhus/type-fest/blob/main/source/array-length.d.ts) over array and tuple `T["length"]` type queries.

## Targeted pattern scope

This is a type-aware rule. It targets indexed-access type queries whose object type resolves to an array or tuple.

## What this rule reports

- `T["length"]` when `T` is an array or tuple type.

## Why this rule exists

`ArrayLength<T>` is the dedicated TypeFest helper for array and tuple length extraction. Using it makes intent explicit and aligns with the canonical TypeFest helper name.

## ❌ Incorrect

```ts
type StepCount = EventSteps["length"];
```

## ✅ Correct

```ts
import type { ArrayLength } from "type-fest";

type StepCount = ArrayLength<EventSteps>;
```

## Behavior and migration notes

- This rule requires type information.
- It only reports `T["length"]` when `T` resolves to an array-like type.
- It does not report non-array property lookups like `User["length"]`.

## Additional examples

### ❌ Incorrect — Additional example

```ts
type TupleLength = readonly [1, 2, 3]["length"];
```

### ✅ Correct — Additional example

```ts
import type { ArrayLength } from "type-fest";

type TupleLength = ArrayLength<readonly [1, 2, 3]>;
```

### ✅ Correct — Non-targeted usage

```ts
interface User {
    readonly length: number;
    readonly name: string;
}

type UserLength = User["length"];
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-array-length": "error",
        },
    },
];
```

## When not to use it

Disable this rule if you prefer native indexed-access syntax for array length queries or if your project does not use type-aware linting.

## Package documentation

TypeFest package documentation:

Source file: [`source/array-length.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/array-length.d.ts)

```ts
/**
Return the length of an array. Equivalent to `T['length']` where `T` extends any array.

Tuples resolve to numeric literals, while non-tuples resolve to the `number` type.
*/
export type ArrayLength<T extends readonly unknown[]> = T['length'];
```

> **Rule catalog ID:** R078

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Indexed Access Types](https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
