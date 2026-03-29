# prefer-type-fest-conditional-except

Prefer [`ConditionalExcept`](https://github.com/sindresorhus/type-fest/blob/main/source/conditional-except.d.ts) from `type-fest` over `Except<Base, ConditionalKeys<Base, Condition>>` compositions.

This rule lives only in the experimental preset and reports without autofixing.

## Targeted pattern scope

This rule focuses on direct `type-fest` compositions that already use both `Except` and `ConditionalKeys` together.

- `Except<Base, ConditionalKeys<Base, Condition>>`
- the same shape when `Except` and `ConditionalKeys` are imported under local aliases from `type-fest`

It intentionally skips builtin `Omit<Base, ConditionalKeys<Base, Condition>>` shapes to avoid overlapping with the stable `prefer-type-fest-except` rule.

## What this rule reports

This rule reports `type-fest` compositions when all of the following are true:

- the outer type reference resolves to `Except`
- the second type argument resolves to `ConditionalKeys`
- the base type passed to `Except` matches the base type passed to `ConditionalKeys`

The rule is currently **report-only**. It does not autofix or suggest a replacement yet.

## Why this rule exists

`ConditionalExcept<Base, Condition>` expresses the intent of conditional omission directly.

- Readers do not need to mentally expand two helper types to understand the result.
- The single helper form is shorter and easier to scan in large type aliases.
- The intent stays aligned with the upstream Type-Fest utility that already models this exact composition.

## ❌ Incorrect

```ts
import type {ConditionalKeys, Except} from "type-fest";

type Example = {
    count: number;
    enabled: boolean;
    name: string;
};

type NonStrings = Except<Example, ConditionalKeys<Example, string>>;
```

## ✅ Correct

```ts
import type {ConditionalExcept} from "type-fest";

type Example = {
    count: number;
    enabled: boolean;
    name: string;
};

type NonStrings = ConditionalExcept<Example, string>;
```

## Behavior and migration notes

- This rule only reports the direct `Except<..., ConditionalKeys<...>>` composition.
- It ignores builtin `Omit` forms on purpose to avoid duplicate reporting with `prefer-type-fest-except`.
- It ignores compositions where the `ConditionalKeys` base type does not exactly match the `Except` base type.

## Additional examples

### ❌ Incorrect — Additional example

```ts
import type {ConditionalKeys as MatchingKeys, Except as StrictExcept} from "type-fest";

type Example = {
    count: number;
    enabled: boolean;
    name: string;
};

type NonStrings = StrictExcept<Example, MatchingKeys<Example, string>>;
```

### ✅ Correct — Additional example

```ts
import type {ConditionalExcept} from "type-fest";

type Example = {
    count: number;
    enabled: boolean;
    name: string;
};

type NonStrings = ConditionalExcept<Example, string>;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [typefest.configs.experimental];
```

## When not to use it

Disable this rule if your team prefers explicit helper-type composition over the shorter canonical alias, or if you want `Except` and `ConditionalKeys` to stay visible for teaching purposes.

## Package documentation

TypeFest package documentation:

Source file: [`source/conditional-except.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/conditional-except.d.ts)

```ts
import type {ConditionalExcept} from "type-fest";

type Example = {
    a: string;
    b: string | number;
    c: () => void;
};

type NonStringKeysOnly = ConditionalExcept<Example, string>;
//=> {b: string | number; c: () => void}
```

> **Rule catalog ID:** R087

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` package reference](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
- [Preset selection strategy](./guides/preset-selection-strategy.md)
