# prefer-ts-extras-object-map-values

Prefer [`objectMapValues`](https://github.com/sindresorhus/ts-extras/blob/main/source/object-map-values.ts) from `ts-extras` over key-preserving `objectFromEntries(objectEntries(...).map(...))` chains.

This rule lives only in the experimental preset and reports without autofixing.

## Targeted pattern scope

This rule focuses on `ts-extras` entry pipelines whose callback preserves the original key and only changes the value.

- `objectFromEntries(objectEntries(value).map(([key, item]) => [key, nextValue]))`
- the same shape with a block body that immediately returns `[key, nextValue]`

It intentionally skips broader patterns that can encode different intent.

## What this rule reports

This rule reports ts-extras object remapping chains when all of the following are true:

- the outer call is `objectFromEntries(...)`
- the inner source is `objectEntries(...)`
- the intermediate step is a direct `.map(...)` call
- the callback is an arrow function with a strict `[key, value]` tuple parameter
- the callback returns a two-item tuple whose first item is the original `key`

The rule is currently **report-only**. It does not autofix or suggest a replacement yet.

## Why this rule exists

`objectMapValues` reduces noise in a common value-only remapping pattern.

- The callback contract matches the intent directly: `(value, key) => nextValue`.
- Readers do not need to mentally unpack an entries pipeline to see that keys stay the same.
- The code avoids a temporary array of tuples in authored source.

Because this pattern appears in semantically different forms, the rule stays narrow on purpose and reports only equivalent key-preserving remaps.

## ❌ Incorrect

```ts
import {objectEntries, objectFromEntries} from "ts-extras";

const statusById = {
    alpha: "up",
    beta: "down",
} as const;

const labels = objectFromEntries(
    objectEntries(statusById).map(([key, value]) => [key, `${key}:${value}`])
);
```

## ✅ Correct

```ts
import {objectMapValues} from "ts-extras";

const statusById = {
    alpha: "up",
    beta: "down",
} as const;

const labels = objectMapValues(
    statusById,
    (value, key) => `${key}:${value}`
);
```

## Behavior and migration notes

- This rule only reports chains that preserve the original key unchanged.
- It ignores native `Object.entries` / `Object.fromEntries` pipelines to avoid overlapping with the stable `objectEntries` and `objectFromEntries` adoption rules.
- It ignores `.map(...)` calls that pass a `thisArg`, because `objectMapValues` does not have an equivalent callback binding parameter.
- It ignores function-expression callbacks for now, because the experimental rule avoids assuming `this` behavior is irrelevant.

## Additional examples

### ❌ Incorrect — Additional example

```ts
import {objectEntries, objectFromEntries} from "ts-extras";

const statusById = {
    alpha: "up",
    beta: "down",
} as const;

const uppercased = objectFromEntries(
    objectEntries(statusById).map(([key, value]) => [key, value.toUpperCase()])
);
```

### ✅ Correct — Additional example

```ts
import {objectMapValues} from "ts-extras";

const statusById = {
    alpha: "up",
    beta: "down",
} as const;

const uppercased = objectMapValues(statusById, (value) => value.toUpperCase());
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [typefest.configs.experimental];
```

## When not to use it

Disable this rule if your team prefers explicit entry-tuple pipelines for readability, or if the remapping logic changes keys often enough that `objectMapValues` is not the dominant style.

## Package documentation

ts-extras package documentation:

Source file: [`source/object-map-values.ts`](https://github.com/sindresorhus/ts-extras/blob/main/source/object-map-values.ts)

```ts
import {objectMapValues} from "ts-extras";

const object = {a: 1, b: 2, c: 3};

const mapped = objectMapValues(object, value => String(value));
//=> {a?: string; b?: string; c?: string}
```

> **Rule catalog ID:** R086

## Further reading

- [`ts-extras` README](https://github.com/sindresorhus/ts-extras)
- [`ts-extras` package reference](https://www.npmjs.com/package/ts-extras)
- [MDN: Array.prototype.map()](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/map)
- [MDN: Object.fromEntries()](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/fromEntries)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
- [Preset selection strategy](./guides/preset-selection-strategy.md)
