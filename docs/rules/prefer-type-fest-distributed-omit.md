# prefer-type-fest-distributed-omit

Prefer [`DistributedOmit`](https://github.com/sindresorhus/type-fest/blob/main/source/distributed-omit.d.ts) from `type-fest` over distributive conditional helpers built from `Omit`.

This rule lives only in the experimental preset and reports without autofixing.

## Targeted pattern scope

This rule focuses on the common helper shape that distributes `Omit` over a union manually:

- `Union extends unknown ? Omit<Union, Key> : never`
- `Union extends any ? Omit<Union, Key> : never`

It intentionally ignores ordinary non-distributive `Omit` usage and unrelated conditional helpers.

## What this rule reports

This rule reports conditional helpers when all of the following are true:

- the false branch is `never`
- the conditional distributes over the checked type with `extends unknown` or `extends any`
- the true branch is exactly `Omit<CheckedType, KeyType>`

The rule is currently **report-only**. It does not autofix or suggest a replacement yet.

## Why this rule exists

`DistributedOmit<ObjectType, KeyType>` makes the union-preserving behavior explicit.

- Readers do not need to mentally simulate the distributive conditional.
- The Type-Fest helper explains why this is different from plain `Omit`.
- Consistent adoption reduces duplicate one-off helpers across a codebase.

## ❌ Incorrect

```ts
type WithoutKeys<Union, Key extends PropertyKey> =
    Union extends unknown ? Omit<Union, Key> : never;
```

## ✅ Correct

```ts
import type {DistributedOmit} from "type-fest";

type WithoutKeys<Union, Key extends PropertyKey> =
    DistributedOmit<Union, Key>;
```

## Behavior and migration notes

- This rule only reports the narrow distributive-`Omit` helper pattern.
- It does not report ordinary `Omit<T, K>` usage.
- It does not try to prove that your generic key constraints match Type-Fest exactly; it only reports the direct structural helper pattern.

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [typefest.configs.experimental];
```

## When not to use it

Disable this rule if your team prefers to keep a local distributive helper name or if you intentionally avoid Type-Fest for these object-union utilities.

## Package documentation

TypeFest package documentation:

Source file: [`source/distributed-omit.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/distributed-omit.d.ts)

```ts
import type {DistributedOmit} from "type-fest";

type Result<Union, Key extends PropertyKey> = DistributedOmit<Union, Key>;
```

> **Rule catalog ID:** R090

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [TypeScript Handbook: Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
- [TypeScript Handbook: Omit](https://www.typescriptlang.org/docs/handbook/utility-types.html#omittype-keys)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
- [Preset selection strategy](./guides/preset-selection-strategy.md)
