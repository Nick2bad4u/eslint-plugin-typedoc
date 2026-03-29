# prefer-type-fest-less-than-or-equal

Require TypeFest [`LessThanOrEqual<A, B>`](https://github.com/sindresorhus/type-fest/blob/main/source/less-than-or-equal.d.ts) over boolean wrappers built from `GreaterThan<A, B>`.

## Targeted pattern scope

This rule targets equivalent conditional wrappers such as `GreaterThan<A, B> extends true ? false : true` and infer-wrapped variants.

## What this rule reports

- Conditional types equivalent to `LessThanOrEqual<A, B>` that are composed from `GreaterThan<A, B>`.

## Why this rule exists

`LessThanOrEqual` is the canonical TypeFest numeric comparison helper for `<=` checks. Using it directly improves readability and avoids repeated wrapper patterns.

## ❌ Incorrect

```ts
import type { GreaterThan } from "type-fest";

type IsLessOrEqual = GreaterThan<1, 2> extends true ? false : true;
```

## ✅ Correct

```ts
import type { LessThanOrEqual } from "type-fest";

type IsLessOrEqual = LessThanOrEqual<1, 2>;
```

## Behavior and migration notes

- This rule targets wrappers equivalent to `LessThanOrEqual<A, B>`.
- It handles direct and infer-wrapped conditional forms.
- It does not report wrappers whose boolean branches do not match `<=` semantics.

## Additional examples

### ❌ Incorrect — Additional example

```ts
import type { GreaterThan } from "type-fest";

type IsLessOrEqual =
    GreaterThan<4, 9> extends infer Result
        ? Result extends true
            ? false
            : true
        : never;
```

### ✅ Correct — Additional example

```ts
import type { LessThanOrEqual } from "type-fest";

type IsLessOrEqual = LessThanOrEqual<4, 9>;
```

### ✅ Correct — Repository-wide usage

```ts
type IsNonPositive<N extends number> = LessThanOrEqual<N, 0>;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-less-than-or-equal": "error",
        },
    },
];
```

## When not to use it

Disable this rule if your codebase intentionally standardizes on custom numeric wrapper types.

## Package documentation

TypeFest package documentation:

Source file: [`source/less-than-or-equal.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/less-than-or-equal.d.ts)

```ts
/**
Returns a boolean for whether a given number is less than or equal to another number.
*/
export type LessThanOrEqual<A extends number, B extends number> = ...
```

> **Rule catalog ID:** R085

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
