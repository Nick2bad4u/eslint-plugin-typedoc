# prefer-type-fest-non-empty-tuple

Require TypeFest [`NonEmptyTuple`](https://github.com/sindresorhus/type-fest/blob/main/source/non-empty-tuple.d.ts) over the ad-hoc `readonly [T, ...T[]]` tuple pattern.

## Targeted pattern scope

This rule targets ad-hoc tuple-rest patterns that encode non-empty collections.

## What this rule reports

- `readonly [T, ...T[]]`

## Why this rule exists

`NonEmptyTuple<T>` is a well-known TypeFest alias that communicates the intent of a non-empty tuple and keeps shared utility-type usage consistent across codebases.

## ❌ Incorrect

```ts
type Names = readonly [string, ...string[]];
```

## ✅ Correct

```ts
type Names = NonEmptyTuple<string>;
```

## Behavior and migration notes

- `NonEmptyTuple<T>` represents tuple/list contracts with at least one element.
- This rule targets the explicit rest-tuple spelling (`readonly [T, ...T[]]`).
- Keep element type aliases explicit when non-empty constraints are part of public API contracts.

## Additional examples

### ❌ Incorrect — Additional example

```ts
type Names = readonly [string, ...string[]];
```

### ✅ Correct — Additional example

```ts
type Names = NonEmptyTuple<string>;
```

### ✅ Correct — Repository-wide usage

```ts
type Steps = NonEmptyTuple<{ id: string }>;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-non-empty-tuple": "error",
        },
    },
];
```

## When not to use it

Disable this rule if existing tuple spellings must remain for public compatibility.

## Package documentation

TypeFest package documentation:

Source file: [`source/non-empty-tuple.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/non-empty-tuple.d.ts)

````ts
/**
Matches any non-empty tuple.

@example
```
import type {NonEmptyTuple} from 'type-fest';

const sum = (...numbers: NonEmptyTuple<number>) => numbers.reduce((total, value) => total + value, 0);

sum(1, 2, 3);
// Ok

// @ts-expect-error
sum();
// Error: Expected at least 1 arguments, but got 0.
```

@see {@link RequireAtLeastOne} for objects

@category Array
*/
````

> **Rule catalog ID:** R050

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
