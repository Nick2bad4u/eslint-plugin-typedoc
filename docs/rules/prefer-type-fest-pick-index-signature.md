# prefer-type-fest-pick-index-signature

Prefer [`PickIndexSignature`](https://github.com/sindresorhus/type-fest/blob/main/source/pick-index-signature.d.ts) from `type-fest` over manual mapped types that keep only index signatures.

This rule lives only in the experimental preset and reports without autofixing.

## Targeted pattern scope

This rule focuses on the canonical mapped-type counterpart to `PickIndexSignature`:

- `{ [K in keyof T as {} extends Record<K, unknown> ? K : never]: T[K] }`

It intentionally skips the inverse `OmitIndexSignature` pattern and broader remapping logic.

## What this rule reports

This rule reports mapped types when all of the following are true:

- the key constraint is `keyof ObjectType`
- the key remap condition is `{} extends Record<Key, unknown> ? Key : never`
- the mapped value is `ObjectType[Key]`

The rule is currently **report-only**. It does not autofix or suggest a replacement yet.

## Why this rule exists

`PickIndexSignature<ObjectType>` names the intent directly.

- Readers do not need to decode the `Record<Key, unknown>` trick.
- The helper makes it obvious that only index signatures survive.
- Using the upstream utility keeps this niche pattern consistent across a codebase.

## ❌ Incorrect

```ts
type IndexOnly<ObjectType> = {
    [Key in keyof ObjectType as {} extends Record<Key, unknown>
        ? Key
        : never]: ObjectType[Key];
};
```

## ✅ Correct

```ts
import type {PickIndexSignature} from "type-fest";

type IndexOnly<ObjectType> = PickIndexSignature<ObjectType>;
```

## Behavior and migration notes

- This rule only reports the narrow canonical mapped-type pattern.
- It intentionally ignores the inverse `{} extends Record<Key, unknown> ? never : Key` form because that belongs to `OmitIndexSignature`, not `PickIndexSignature`.
- It also ignores broader remapped types that do more than keep index signatures.

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [typefest.configs.experimental];
```

## When not to use it

Disable this rule if your team prefers the explicit mapped type or if you want to reserve `PickIndexSignature` for only a subset of object utility code.

## Package documentation

TypeFest package documentation:

Source file: [`source/pick-index-signature.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/pick-index-signature.d.ts)

```ts
import type {PickIndexSignature} from "type-fest";

type IndexOnly<ObjectType> = PickIndexSignature<ObjectType>;
```

> **Rule catalog ID:** R094

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [TypeScript Handbook: Mapped Types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html)
- [TypeScript Handbook: keyof](https://www.typescriptlang.org/docs/handbook/2/keyof-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
- [Preset selection strategy](./guides/preset-selection-strategy.md)
