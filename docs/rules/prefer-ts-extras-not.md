# prefer-ts-extras-not

Require [`not`](https://github.com/sindresorhus/ts-extras/blob/main/source/not.ts) from `ts-extras` over inline negated predicate callbacks in `filter` calls.

## Targeted pattern scope

This rule focuses on direct `.filter(...)` callbacks that negate a predicate and can be migrated to `not(predicate)` with deterministic fixes.

- Inline negated predicate callbacks in `.filter(...)` that can use `not(predicate)`.
- `array.filter((value) => !predicate(value))`

Alias indirection, wrapper helpers, and non-canonical call shapes are excluded to keep `not(predicate)` migrations safe.

## What this rule reports

This rule reports `.filter(...)` call sites when `not(predicate)` is the intended replacement.

- Inline negated predicate callbacks in `.filter(...)` that can use `not(predicate)`.
- `array.filter((value) => !predicate(value))`

## Why this rule exists

`not(predicate)` communicates intent directly and preserves predicate-based typing in a reusable helper.

## ❌ Incorrect

```ts
const activeUsers = users.filter((user) => !isArchived(user));
```

## ✅ Correct

```ts
const activeUsers = users.filter(not(isArchived));
```

## Behavior and migration notes

- `not(predicate)` preserves predicate inversion intent in one reusable helper.
- This rule targets inline negation wrappers inside `filter` callbacks.
- Callbacks that do extra work beyond predicate negation should be reviewed manually.

## Additional examples

### ❌ Incorrect — Additional example

```ts
const active = users.filter((user) => !isArchived(user));
```

### ✅ Correct — Additional example

```ts
const active = users.filter(not(isArchived));
```

### ✅ Correct — Repository-wide usage

```ts
const nonEmpty = values.filter(not(isEmptyValue));
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-ts-extras-not": "error",
        },
    },
];
```

## When not to use it

Disable this rule if your codebase requires explicit inline callback bodies for readability.

## Package documentation

ts-extras package documentation:

Source file: [`source/not.ts`](https://github.com/sindresorhus/ts-extras/blob/main/source/not.ts)

````ts
/**
Invert a type predicate function.

This utility allows you to create the inverse of any type guard function, using TypeScript's `Exclude` utility type to properly narrow types.

@example
```
import {not} from 'ts-extras';

const isNullish = (value: unknown): value is null | undefined => value == null;

const isNotNullish = not(isNullish);

const values = [1, null, 2, undefined, 3];
const defined = values.filter(isNotNullish);
//=> [1, 2, 3]
// with type number[]

// Works with any type guard
const isString = (value: unknown): value is string => typeof value === 'string';

const isNotString = not(isString);

declare const mixedValue: string | number | boolean;
if (isNotString(mixedValue)) {
    mixedValue;
    //=> number | boolean
}
```

@note TypeScript may fail to narrow types in nested branches, with mutated variables, or when using `Exclude` with complex union types. See:
- https://github.com/microsoft/TypeScript/issues/44901
- https://github.com/microsoft/TypeScript/issues/43589

@category Type guard
*/
````

> **Rule catalog ID:** R025

## Further reading

- [`ts-extras` README](https://github.com/sindresorhus/ts-extras)
- [`ts-extras` package reference](https://www.npmjs.com/package/ts-extras)
- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
