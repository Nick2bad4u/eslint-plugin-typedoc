# prefer-ts-extras-array-find-last-index

Prefer [`arrayFindLastIndex`](https://github.com/sindresorhus/ts-extras/blob/main/source/array-find-last-index.ts) from `ts-extras` over `array.findLastIndex(...)`.

`arrayFindLastIndex(...)` improves predicate inference in typed arrays.

## Targeted pattern scope

This rule focuses on direct `array.findLastIndex(predicate)` calls that can be migrated to `arrayFindLastIndex(array, predicate)` with deterministic fixes.

- `array.findLastIndex(predicate)` call sites that can use `arrayFindLastIndex(array, predicate)`.

Alias indirection, wrapper helpers, and non-canonical call shapes are excluded to keep `arrayFindLastIndex(array, predicate)` migrations safe.

## What this rule reports

This rule reports `array.findLastIndex(predicate)` call sites when `arrayFindLastIndex(array, predicate)` is the intended replacement.

- `array.findLastIndex(predicate)` call sites that can use `arrayFindLastIndex(array, predicate)`.

## Why this rule exists

`arrayFindLastIndex` standardizes reverse index lookup and keeps call signatures aligned with other `ts-extras` search helpers.

- Reverse index scans are explicit at the call site.
- Search code avoids mixed native/helper patterns.
- Index-based follow-up logic stays uniform across modules.

## ❌ Incorrect

```ts
const index = monitors.findLastIndex((entry) => entry.id === targetId);
```

## ✅ Correct

```ts
const index = arrayFindLastIndex(monitors, (entry) => entry.id === targetId);
```

## Behavior and migration notes

- Runtime behavior matches native `Array.prototype.findLastIndex`.
- Search still proceeds from right to left.
- If no element matches, the result is `-1`.

## Additional examples

### ❌ Incorrect — Additional example

```ts
const index = logs.findLastIndex((entry) => entry.level === "warn");
```

### ✅ Correct — Additional example

```ts
const index = arrayFindLastIndex(logs, (entry) => entry.level === "warn");
```

### ✅ Correct — Repository-wide usage

```ts
const retryIndex = arrayFindLastIndex(attempts, (attempt) => !attempt.success);
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-ts-extras-array-find-last-index": "error",
        },
    },
];
```

## When not to use it

Disable this rule if your codebase has standardized on native `.findLastIndex()`.

## Package documentation

ts-extras package documentation:

`ts-extras@0.17.x` does not currently expose `arrayFindLastIndex` in its published API, so there is no canonical `source/*.ts` link for this helper yet.

Reference links:

- [`ts-extras` API list (README)](https://github.com/sindresorhus/ts-extras/blob/main/readme.md#api)
- [`ts-extras` source directory](https://github.com/sindresorhus/ts-extras/tree/main/source)

> **Rule catalog ID:** R005

## Further reading

- [`ts-extras` README](https://github.com/sindresorhus/ts-extras)
- [`ts-extras` package reference](https://www.npmjs.com/package/ts-extras)
- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
