# prefer-type-fest-conditional-pick-deep

Require TypeFest [`ConditionalPickDeep<T, Condition, Options?>`](https://github.com/sindresorhus/type-fest/blob/main/source/conditional-pick-deep.d.ts) instead of legacy deep conditional-pick aliases.

## Targeted pattern scope

This rule targets imported aliases that mirror deep conditional property filtering semantics (for example, `PickDeepByTypes` and `PickDeepByType`).

## What this rule reports

- Type references that resolve to imported deep conditional-pick aliases.

## Why this rule exists

`ConditionalPickDeep` is the canonical TypeFest helper for recursively filtering object properties by value condition. Standardizing on this utility improves consistency and readability.

## ❌ Incorrect

```ts
import type { PickDeepByTypes } from "type-aliases";

type StringProps = PickDeepByTypes<User, string>;
```

## ✅ Correct

```ts
import type { ConditionalPickDeep } from "type-fest";

type StringProps = ConditionalPickDeep<User, string>;
```

## Behavior and migration notes

- `ConditionalPickDeep<T, Condition, Options?>` recursively selects keys whose values match `Condition`.
- This rule only targets known alias names that represent the same intent.
- Keep custom aliases only when they intentionally add behavior beyond deep conditional filtering.

## Additional examples

### ❌ Incorrect — Additional example

```ts
import type { PickDeepByType } from "type-aliases";

type NumericProps = PickDeepByType<User, number>;
```

### ✅ Correct — Additional example

```ts
import type { ConditionalPickDeep } from "type-fest";

type NumericProps = ConditionalPickDeep<User, number>;
```

### ✅ Correct — Repository-wide usage

```ts
type DateProps = ConditionalPickDeep<User, Date>;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-conditional-pick-deep": "error",
        },
    },
];
```

## When not to use it

Disable this rule if external API contracts require specific alias names.

## Package documentation

TypeFest package documentation:

Source file: [`source/conditional-pick-deep.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/conditional-pick-deep.d.ts)

```ts
/**
Pick keys recursively from the shape that matches the given condition.

@category Object
*/
export type ConditionalPickDeep<
    Type,
    Condition,
    Options extends ConditionalPickDeepOptions = {},
> = ...
```

> **Rule catalog ID:** R082

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
