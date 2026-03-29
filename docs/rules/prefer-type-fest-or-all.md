# prefer-type-fest-or-all

Require TypeFest [`OrAll<TTuple>`](https://github.com/sindresorhus/type-fest/blob/main/source/or-all.d.ts) over `SomeExtend<TTuple, true>` boolean-tuple checks.

## Targeted pattern scope

This rule targets direct and namespace-qualified references to `SomeExtend<TTuple, true>` imported from `type-fest`.

## What this rule reports

- `SomeExtend<TTuple, true>` when it is being used as a boolean-tuple disjunction check.

## Why this rule exists

`OrAll` is the dedicated TypeFest helper for checking whether any boolean tuple member is `true`. It is shorter, clearer, and matches the new canonical TypeFest naming.

## ❌ Incorrect

```ts
import type { SomeExtend } from "type-fest";

type AnyFlagsTrue = SomeExtend<[false, false, true], true>;
```

## ✅ Correct

```ts
import type { OrAll } from "type-fest";

type AnyFlagsTrue = OrAll<[false, false, true]>;
```

## Behavior and migration notes

- This rule only targets `SomeExtend<TTuple, true>`.
- It does not report `SomeExtend<TTuple, SomeOtherType>` usages.
- Namespace-qualified `type-fest` references are reported too.

## Additional examples

### ❌ Incorrect — Additional example

```ts
import type * as TypeFest from "type-fest";

type Ready = TypeFest.SomeExtend<[false, false, true], true>;
```

### ✅ Correct — Additional example

```ts
import type { OrAll } from "type-fest";

type Ready = OrAll<[false, false, true]>;
```

### ✅ Correct — Non-targeted usage

```ts
import type { SomeExtend } from "type-fest";

type AnyStrings = SomeExtend<[1, "x", true], string>;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-or-all": "error",
        },
    },
];
```

## When not to use it

Disable this rule if your codebase intentionally prefers the more general `SomeExtend<TTuple, true>` spelling for boolean tuple checks.

## Package documentation

TypeFest package documentation:

Source file: [`source/or-all.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/or-all.d.ts)

```ts
/**
Returns a boolean for whether any of the given elements is `true`.

Use-cases:
- Check if at least one condition in a list of booleans is met.
*/
export type OrAll<T extends readonly boolean[]> = SomeExtend<T, true>;
```

> **Rule catalog ID:** R080

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
