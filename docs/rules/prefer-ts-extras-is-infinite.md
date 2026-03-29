# prefer-ts-extras-is-infinite

Require [`isInfinite`](https://github.com/sindresorhus/ts-extras/blob/main/source/is-infinite.ts) from `ts-extras` over direct Infinity equality checks.

## Targeted pattern scope

This rule only matches direct equality checks against infinity constants that can be collapsed into `isInfinite(value)`.

- Direct infinity equality checks:
- `value === Infinity`
- `value === Number.POSITIVE_INFINITY`
- `value === Number.NEGATIVE_INFINITY`

Syntactically similar alternatives are intentionally out of scope unless they preserve the same AST shape.

## What this rule reports

This rule reports direct infinity equality checks that can be replaced with `isInfinite(value)`.

- Direct infinity equality checks:
- `value === Infinity`
- `value === Number.POSITIVE_INFINITY`
- `value === Number.NEGATIVE_INFINITY`

## Why this rule exists

`isInfinite` replaces constant-based comparisons with one explicit predicate.

- Infinity checks follow one helper pattern.
- Mixed positive/negative infinity comparisons are normalized.
- Numeric guard code is easier to audit.

## ❌ Incorrect

```ts
const infinite = value === Infinity || value === Number.NEGATIVE_INFINITY;
```

## ✅ Correct

```ts
const infinite = isInfinite(value);
```

## Behavior and migration notes

- `isInfinite(value)` covers both `Infinity` and `-Infinity`.
- Finite numbers and `NaN` return `false`.
- This rule targets direct equality checks, not broader numeric validation chains.

## Additional examples

### ❌ Incorrect — Additional example

```ts
const bad = value === Infinity || value === Number.NEGATIVE_INFINITY;
```

### ✅ Correct — Additional example

```ts
const bad = isInfinite(value);
```

### ✅ Correct — Repository-wide usage

```ts
if (isInfinite(rate)) {
    throw new Error("invalid rate");
}
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-ts-extras-is-infinite": "error",
        },
    },
];
```

## When not to use it

Disable this rule if direct infinity constant comparisons are required in generated code.

## Package documentation

ts-extras package documentation:

Source file: [`source/is-infinite.ts`](https://github.com/sindresorhus/ts-extras/blob/main/source/is-infinite.ts)

````ts
/**
Check whether a value is infinite.

@example
```
import {isInfinite} from 'ts-extras';

isInfinite(Number.POSITIVE_INFINITY);
//=> true

isInfinite(Number.NEGATIVE_INFINITY);
//=> true

isInfinite(42);
//=> false

isInfinite(Number.NaN);
//=> false
```

@category Type guard
*/
````

> **Rule catalog ID:** R019

## Further reading

- [`ts-extras` README](https://github.com/sindresorhus/ts-extras)
- [`ts-extras` package reference](https://www.npmjs.com/package/ts-extras)
- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
