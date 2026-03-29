# prefer-ts-extras-is-present

Require [`isPresent`](https://github.com/sindresorhus/ts-extras/blob/main/source/is-present.ts) from `ts-extras` for direct nullish checks outside `Array.prototype.filter` callbacks.

## Targeted pattern scope

This rule scopes matching to direct nullish-check expressions outside `.filter(...)` callbacks.

- Direct nullish checks outside `Array.prototype.filter` callbacks:
- `value != null`
- `value == null`
- `value !== null && value !== undefined`
- `value === null || value === undefined`

Filter callbacks are handled by the dedicated filter rule; larger boolean expressions are only matched when they keep these shapes.

## What this rule reports

This rule reports direct nullish comparisons that should use `isPresent(...)` helpers.

- Direct nullish checks outside `Array.prototype.filter` callbacks:
- `value != null`
- `value == null`
- `value !== null && value !== undefined`
- `value === null || value === undefined`

## Why this rule exists

`isPresent` gives one canonical predicate for non-nullish checks and reduces mixed null/undefined comparison styles.

- Nullish guard intent is explicit.
- Narrowing to `NonNullable<T>` follows one convention.
- Verbose inline nullish checks are removed.

## ❌ Incorrect

```ts
if (value != null) {
    consume(value);
}

if (value === null || value === undefined) {
    return;
}
```

## ✅ Correct

```ts
if (isPresent(value)) {
    consume(value);
}

if (!isPresent(value)) {
    return;
}
```

## Behavior and migration notes

- `isPresent(value)` means value is neither `null` nor `undefined`.
- `!isPresent(value)` is the nullish guard equivalent.
- Filter-specific nullish patterns are covered by `prefer-ts-extras-is-present-filter`.

## Additional examples

### ❌ Incorrect — Additional example

```ts
if (profile != null) {
    render(profile);
}
```

### ✅ Correct — Additional example

```ts
if (isPresent(profile)) {
    render(profile);
}
```

### ✅ Correct — Repository-wide usage

```ts
const available = isPresent(cacheEntry);
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-ts-extras-is-present": "error",
        },
    },
];
```

## When not to use it

Disable this rule if your code style requires explicit `=== null` / `=== undefined` branches.

## Package documentation

ts-extras package documentation:

Source file: [`source/is-present.ts`](https://github.com/sindresorhus/ts-extras/blob/main/source/is-present.ts)

````ts
/**
Check whether a value is present (non-nullable), meaning it is neither `null` nor `undefined`.

This can be useful as a type guard, as for example, `[1, null].filter(Boolean)` does not always type-guard correctly.

@example
```
import {isPresent} from 'ts-extras';

[1, null, 2, undefined].filter(isPresent);
//=> [1, 2]
```

@category Type guard
*/
````

> **Rule catalog ID:** R021

## Further reading

- [`ts-extras` README](https://github.com/sindresorhus/ts-extras)
- [`ts-extras` package reference](https://www.npmjs.com/package/ts-extras)
- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
