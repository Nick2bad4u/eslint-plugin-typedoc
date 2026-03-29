# prefer-type-fest-less-than

Require TypeFest [`LessThan<A, B>`](https://github.com/sindresorhus/type-fest/blob/main/source/less-than.d.ts) over boolean wrappers built from `GreaterThanOrEqual<A, B>`.

## Targeted pattern scope

This rule targets equivalent conditional wrappers such as `GreaterThanOrEqual<A, B> extends true ? false : true` and infer-wrapped variants.

## What this rule reports

- Conditional types equivalent to `LessThan<A, B>` that are composed from `GreaterThanOrEqual<A, B>`.

## Why this rule exists

`LessThan` is the canonical TypeFest numeric comparison helper for strict `<` checks. Using it directly is shorter, clearer, and avoids repetitive wrapper patterns.

## ❌ Incorrect

```ts
import type { GreaterThanOrEqual } from "type-fest";

type IsLess = GreaterThanOrEqual<1, 2> extends true ? false : true;
```

## ✅ Correct

```ts
import type { LessThan } from "type-fest";

type IsLess = LessThan<1, 2>;
```

## Behavior and migration notes

- This rule targets wrappers equivalent to `LessThan<A, B>`.
- It handles direct and infer-wrapped conditional forms.
- It does not report wrappers whose boolean branches do not match strict `<` semantics.

## Additional examples

### ❌ Incorrect — Additional example

```ts
import type { GreaterThanOrEqual } from "type-fest";

type IsLess =
    GreaterThanOrEqual<4, 9> extends infer Result
        ? Result extends true
            ? false
            : true
        : never;
```

### ✅ Correct — Additional example

```ts
import type { LessThan } from "type-fest";

type IsLess = LessThan<4, 9>;
```

### ✅ Correct — Repository-wide usage

```ts
type IsNegative<N extends number> = LessThan<N, 0>;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-less-than": "error",
        },
    },
];
```

## When not to use it

Disable this rule if your codebase intentionally standardizes on custom numeric wrapper types.

## Package documentation

TypeFest package documentation:

Source file: [`source/less-than.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/less-than.d.ts)

```ts
/**
Returns a boolean for whether a given number is less than another number.
*/
export type LessThan<A extends number, B extends number> = ...
```

> **Rule catalog ID:** R084

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
