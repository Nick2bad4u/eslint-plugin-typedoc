# prefer-type-fest-conditional-keys

Prefer [`ConditionalKeys`](https://github.com/sindresorhus/type-fest/blob/main/source/conditional-keys.d.ts) from `type-fest` over manual `keyof`-remapped key filters.

This rule lives only in the experimental preset and reports without autofixing.

## Targeted pattern scope

This rule focuses on the common pattern that filters keys by value condition through `keyof` over a mapped type:

- `keyof { [K in keyof Base as Base[K] extends Condition ? K : never]: ... }`

It intentionally skips more elaborate helpers that involve strictness wrappers, tuple-to-object conversions, or additional conditional layers.

## What this rule reports

This rule reports `keyof`-wrapped mapped types when all of the following are true:

- the key constraint is `keyof Base`
- the key remap condition is `Base[K] extends Condition ? K : never`
- the outer type operator is `keyof`

The rule is currently **report-only**. It does not autofix or suggest a replacement yet.

## Why this rule exists

`ConditionalKeys<Base, Condition>` is easier to read than the raw remapping recipe.

- The helper name explains the intent immediately.
- Readers do not need to mentally evaluate the mapped type and outer `keyof`.
- Standardizing on Type-Fest reduces duplicated local helper patterns.

## ❌ Incorrect

```ts
type KeysMatching<Base, Condition> = keyof {
    [Key in keyof Base as Base[Key] extends Condition
        ? Key
        : never]: never;
};
```

## ✅ Correct

```ts
import type {ConditionalKeys} from "type-fest";

type KeysMatching<Base, Condition> = ConditionalKeys<Base, Condition>;
```

## Behavior and migration notes

- This rule targets only the narrow `keyof`-remapped key-filter pattern.
- It ignores plain mapped types that are not wrapped in `keyof`.
- It also ignores more elaborate Type-Fest-internal strictness variants to avoid speculative reporting.

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [typefest.configs.experimental];
```

## When not to use it

Disable this rule if your project prefers the explicit remapped-key form or if your helper intentionally diverges from Type-Fest semantics.

## Package documentation

TypeFest package documentation:

Source file: [`source/conditional-keys.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/conditional-keys.d.ts)

```ts
import type {ConditionalKeys} from "type-fest";

type KeysMatching<Base, Condition> = ConditionalKeys<Base, Condition>;
```

> **Rule catalog ID:** R095

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [TypeScript Handbook: Mapped Types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html)
- [TypeScript Handbook: Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
- [Preset selection strategy](./guides/preset-selection-strategy.md)
