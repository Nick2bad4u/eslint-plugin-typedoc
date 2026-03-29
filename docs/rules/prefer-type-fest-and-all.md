# prefer-type-fest-and-all

Require TypeFest [`AndAll<TTuple>`](https://github.com/sindresorhus/type-fest/blob/main/source/and-all.d.ts) over `AllExtend<TTuple, true>` boolean-tuple checks.

## Targeted pattern scope

This rule targets direct and namespace-qualified references to `AllExtend<TTuple, true>` imported from `type-fest`.

## What this rule reports

- `AllExtend<TTuple, true>` when it is being used as a boolean-tuple conjunction check.

## Why this rule exists

`AndAll` is the dedicated TypeFest helper for checking whether all boolean tuple members are `true`. It is shorter, more intention-revealing, and matches the new canonical TypeFest naming.

## ❌ Incorrect

```ts
import type { AllExtend } from "type-fest";

type AllFlagsTrue = AllExtend<[true, true, false], true>;
```

## ✅ Correct

```ts
import type { AndAll } from "type-fest";

type AllFlagsTrue = AndAll<[true, true, false]>;
```

## Behavior and migration notes

- This rule only targets `AllExtend<TTuple, true>`.
- It does not report `AllExtend<TTuple, SomeOtherType>` usages.
- Namespace-qualified `type-fest` references are reported too.

## Additional examples

### ❌ Incorrect — Additional example

```ts
import type * as TypeFest from "type-fest";

type Ready = TypeFest.AllExtend<[true, true, true], true>;
```

### ✅ Correct — Additional example

```ts
import type { AndAll } from "type-fest";

type Ready = AndAll<[true, true, true]>;
```

### ✅ Correct — Non-targeted usage

```ts
import type { AllExtend } from "type-fest";

type AllNumbers = AllExtend<[1, 2, 3], number>;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-and-all": "error",
        },
    },
];
```

## When not to use it

Disable this rule if your codebase intentionally prefers the more general `AllExtend<TTuple, true>` spelling for boolean tuple checks.

## Package documentation

TypeFest package documentation:

Source file: [`source/and-all.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/and-all.d.ts)

```ts
/**
Returns a boolean for whether all of the given elements are `true`.

Use-cases:
- Check if all conditions in a list of booleans are met.
*/
export type AndAll<T extends readonly boolean[]> = AllExtend<T, true>;
```

> **Rule catalog ID:** R077

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
