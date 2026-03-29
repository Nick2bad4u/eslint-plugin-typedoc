# prefer-type-fest-distributed-pick

Prefer [`DistributedPick`](https://github.com/sindresorhus/type-fest/blob/main/source/distributed-pick.d.ts) from `type-fest` over distributive conditional helpers built from `Pick`.

This rule lives only in the experimental preset and reports without autofixing.

## Targeted pattern scope

This rule focuses on the common helper shape that distributes `Pick` over a union manually:

- `Union extends unknown ? Pick<Union, Key> : never`
- `Union extends any ? Pick<Union, Extract<Key, keyof Union>> : never`

It intentionally ignores ordinary non-distributive `Pick` usage and unrelated conditional helpers.

## What this rule reports

This rule reports conditional helpers when all of the following are true:

- the false branch is `never`
- the conditional distributes over the checked type with `extends unknown` or `extends any`
- the true branch is exactly `Pick<CheckedType, KeyType>` or `Pick<CheckedType, Extract<KeyType, keyof CheckedType>>`

The rule is currently **report-only**. It does not autofix or suggest a replacement yet.

## Why this rule exists

`DistributedPick<ObjectType, KeyType>` makes the union-preserving behavior explicit.

- The helper reads as a named concept instead of a conditional-type trick.
- It communicates why plain `Pick` is not enough for union-heavy object types.
- Standardizing on the upstream utility reduces local helper drift.

## ❌ Incorrect

```ts
type OnlyKeys<Union, Key extends PropertyKey> =
    Union extends unknown ? Pick<Union, Key> : never;
```

## ✅ Correct

```ts
import type {DistributedPick} from "type-fest";

type OnlyKeys<Union, Key extends PropertyKey> =
    DistributedPick<Union, Key>;
```

## Behavior and migration notes

- This rule only reports the narrow distributive-`Pick` helper pattern.
- It accepts the `Extract<Key, keyof Union>` variant because that is a common way to keep the built-in `Pick` constraint satisfied.
- It does not report plain `Pick<T, K>` usage.

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [typefest.configs.experimental];
```

## When not to use it

Disable this rule if your project prefers a local helper name for distributive picking or if you intentionally avoid Type-Fest for object-union utilities.

## Package documentation

TypeFest package documentation:

Source file: [`source/distributed-pick.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/distributed-pick.d.ts)

```ts
import type {DistributedPick} from "type-fest";

type Result<Union, Key extends PropertyKey> = DistributedPick<Union, Key>;
```

> **Rule catalog ID:** R091

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [TypeScript Handbook: Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
- [TypeScript Handbook: Pick](https://www.typescriptlang.org/docs/handbook/utility-types.html#picktype-keys)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
- [Preset selection strategy](./guides/preset-selection-strategy.md)
