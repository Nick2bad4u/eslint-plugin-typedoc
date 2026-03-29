# prefer-type-fest-stringified

Prefer [`Stringified`](https://github.com/sindresorhus/type-fest/blob/main/source/stringified.d.ts) from `type-fest` over manual mapped types of the form `{ [K in keyof T]: string }`.

This rule lives only in the experimental preset and reports without autofixing.

## Targeted pattern scope

This rule focuses on direct mapped types that convert every property value in a source object type to `string`.

- `{ [Key in keyof T]: string }`

It intentionally skips mapped types with readonly modifiers, optional modifiers, key remapping, or non-string value expressions.

## What this rule reports

This rule reports mapped types when all of the following are true:

- the key constraint is exactly `keyof T`
- the mapped value type is exactly `string`
- there is no key remapping
- there are no readonly or optional mapped modifiers

The rule is currently **report-only**. It does not autofix or suggest a replacement yet.

## Why this rule exists

`Stringified<T>` names the transformation directly.

- The helper is shorter than repeating the mapped-type recipe inline.
- The intent is easier to recognize in form models and serialization layers.
- The shared utility keeps the codebase consistent when the same transformation appears in multiple places.

## ❌ Incorrect

```ts
type Car = {
    model: string;
    speed: number;
};

type CarForm = { [Key in keyof Car]: string };
```

## ✅ Correct

```ts
import type {Stringified} from "type-fest";

type Car = {
    model: string;
    speed: number;
};

type CarForm = Stringified<Car>;
```

## Behavior and migration notes

- This rule only reports the exact mapped-type shape `{ [Key in keyof T]: string }`.
- It ignores mapped types that also change key names or property modifiers.
- It ignores mapped types whose value side is not exactly `string`.

## Additional examples

### ❌ Incorrect — Additional example

```ts
type Payload = {
    attemptCount: number;
    success: boolean;
};

type PayloadForm = { [Key in keyof Payload]: string };
```

### ✅ Correct — Additional example

```ts
import type {Stringified} from "type-fest";

type Payload = {
    attemptCount: number;
    success: boolean;
};

type PayloadForm = Stringified<Payload>;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [typefest.configs.experimental];
```

## When not to use it

Disable this rule if your team prefers inline mapped types for one-off transformations, or if the mapped type needs to evolve beyond the exact `Stringified<T>` shape.

## Package documentation

TypeFest package documentation:

Source file: [`source/stringified.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/stringified.d.ts)

```ts
import type {Stringified} from "type-fest";

type Car = {
    model: string;
    speed: number;
};

const carForm: Stringified<Car> = {
    model: "Foo",
    speed: "101",
};
```

> **Rule catalog ID:** R089

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` package reference](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Mapped Types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
- [Preset selection strategy](./guides/preset-selection-strategy.md)
