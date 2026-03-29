# prefer-ts-extras-array-find-last

Prefer [`arrayFindLast`](https://github.com/sindresorhus/ts-extras/blob/main/source/array-find-last.ts) from `ts-extras` over `array.findLast(...)`.

`arrayFindLast(...)` improves predicate inference and value narrowing in typed arrays.

## Targeted pattern scope

This rule focuses on direct `array.findLast(predicate)` calls that can be migrated to `arrayFindLast(array, predicate)` with deterministic fixes.

- `array.findLast(predicate)` call sites that can use `arrayFindLast(array, predicate)`.

Alias indirection, wrapper helpers, and non-canonical call shapes are excluded to keep `arrayFindLast(array, predicate)` migrations safe.

## What this rule reports

This rule reports `array.findLast(predicate)` call sites when `arrayFindLast(array, predicate)` is the intended replacement.

- `array.findLast(predicate)` call sites that can use `arrayFindLast(array, predicate)`.

## Why this rule exists

`arrayFindLast` makes reverse-direction predicate lookups explicit and keeps them aligned with the `ts-extras` helper style.

- Reverse scans are easier to spot during code review.
- Call signatures stay consistent with `arrayFind` / `arrayFindLastIndex`.
- Utility code that depends on "latest match" is easier to audit.

## ❌ Incorrect

```ts
const monitor = monitors.findLast((entry) => entry.id === targetId);
```

## ✅ Correct

```ts
const monitor = arrayFindLast(monitors, (entry) => entry.id === targetId);
```

## Behavior and migration notes

- Runtime behavior matches native `Array.prototype.findLast`.
- Search direction remains right-to-left.
- Result is the matching element, or `undefined` if no match exists.

## Additional examples

### ❌ Incorrect — Additional example

```ts
const latest = events.findLast((entry) => entry.type === "login");
```

### ✅ Correct — Additional example

```ts
const latest = arrayFindLast(events, (entry) => entry.type === "login");
```

### ✅ Correct — Repository-wide usage

```ts
const trailingError = arrayFindLast(logs, (entry) => entry.level === "error");
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-ts-extras-array-find-last": "error",
        },
    },
];
```

## When not to use it

Disable this rule if your team intentionally uses native `.findLast()` everywhere.

## Package documentation

ts-extras package documentation:

`ts-extras@0.17.x` does not currently expose `arrayFindLast` in its published API, so there is no canonical `source/*.ts` link for this helper yet.

Reference links:

- [`ts-extras` API list (README)](https://github.com/sindresorhus/ts-extras/blob/main/readme.md#api)
- [`ts-extras` source directory](https://github.com/sindresorhus/ts-extras/tree/main/source)

> **Rule catalog ID:** R004

## Further reading

- [`ts-extras` README](https://github.com/sindresorhus/ts-extras)
- [`ts-extras` package reference](https://www.npmjs.com/package/ts-extras)
- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
