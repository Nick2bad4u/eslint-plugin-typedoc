# prefer-ts-extras-array-find

Prefer [`arrayFind`](https://github.com/sindresorhus/ts-extras/blob/main/source/array-find.ts) from `ts-extras` over `array.find(...)`.

`arrayFind(...)` improves predicate inference and value narrowing in typed arrays.

## Targeted pattern scope

This rule focuses on direct `array.find(predicate)` calls that can be migrated to `arrayFind(array, predicate)` with deterministic fixes.

- `array.find(predicate)` call sites that can use `arrayFind(array, predicate)`.

Alias indirection, wrapper helpers, and non-canonical call shapes are excluded to keep `arrayFind(array, predicate)` migrations safe.

## What this rule reports

This rule reports `array.find(predicate)` call sites when `arrayFind(array, predicate)` is the intended replacement.

- `array.find(predicate)` call sites that can use `arrayFind(array, predicate)`.

## Why this rule exists

`arrayFind` keeps predicate-driven lookup aligned with the other `ts-extras` helper APIs and improves inference in generic code.

- Predicate call sites are standardized across modules.
- Result types are easier to follow in utility layers.
- Local type assertions after `find` calls are reduced.

## ❌ Incorrect

```ts
const monitor = monitors.find((entry) => entry.id === targetId);
```

## ✅ Correct

```ts
const monitor = arrayFind(monitors, (entry) => entry.id === targetId);
```

## Behavior and migration notes

- Runtime behavior matches native `Array.prototype.find`.
- Search still returns the first matching element.
- If no element matches, the result is `undefined`.

## Additional examples

### ❌ Incorrect — Additional example

```ts
const user = users.find((item) => item.id === userId);
```

### ✅ Correct — Additional example

```ts
const user = arrayFind(users, (item) => item.id === userId);
```

### ✅ Correct — Repository-wide usage

```ts
const firstError = arrayFind(logs, (entry) => entry.level === "error");
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-ts-extras-array-find": "error",
        },
    },
];
```

## When not to use it

Disable this rule if your team requires native `.find()` for consistency with existing shared APIs.

## Package documentation

ts-extras package documentation:

`ts-extras@0.17.x` does not currently expose `arrayFind` in its published API, so there is no canonical `source/*.ts` link for this helper yet.

Reference links:

- [`ts-extras` API list (README)](https://github.com/sindresorhus/ts-extras/blob/main/readme.md#api)
- [`ts-extras` source directory](https://github.com/sindresorhus/ts-extras/tree/main/source)

> **Rule catalog ID:** R003

## Further reading

- [`ts-extras` README](https://github.com/sindresorhus/ts-extras)
- [`ts-extras` package reference](https://www.npmjs.com/package/ts-extras)
- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
