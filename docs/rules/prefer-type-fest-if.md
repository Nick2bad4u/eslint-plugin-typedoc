# prefer-type-fest-if

Require TypeFest [`If`](https://github.com/sindresorhus/type-fest/blob/main/source/if.d.ts) + `Is*` utilities over deprecated aliases like `IfAny`,
`IfNever`, `IfUnknown`, `IfNull`, and `IfEmptyObject`.

## Targeted pattern scope

This rule reports deprecated `IfAny`/`IfNever`/`IfUnknown`/`IfNull`/`IfEmptyObject` aliases and migrates usage to canonical `If<Is*>` patterns from `type-fest`.

It is intentionally strict about naming consistency and intentionally conservative
about fixing. Rewriting `IfAny<T, A, B>` into `If<IsAny<T>, A, B>` is a
structural transform, not a safe one-token rename.

## What this rule reports

- Imported type aliases used as identifier type references:
  - `IfAny`
  - `IfNever`
  - `IfUnknown`
  - `IfNull`
  - `IfEmptyObject`

### Detection boundaries

- ✅ Reports `import type { IfAny } ...` followed by `IfAny<...>` usage.
- ❌ Does not report locally renamed imports (`import type { IfAny as AliasIfAny } ...`).
- ❌ Does not report namespace-qualified references like `TypeUtils.IfAny<...>` (the matcher targets identifier references).
- ❌ Does not auto-fix because replacement requires rebuilding type arguments.

## Why this rule exists

These aliases are deprecated in TypeFest. The canonical pattern is to use
`If<...>` with the corresponding `Is*` utility (for example, `If<IsAny<T>, ...>`).

In practice, teams that keep old aliases around end up with mixed style across
packages (`IfAny`, `IfUnknown`, custom wrappers). This rule prevents that drift.

## ❌ Incorrect

```ts
import type { IfAny } from "type-fest";

type Result = IfAny<T, "any", "not-any">;
```

## ✅ Correct

```ts
import type { If, IsAny } from "type-fest";

type Result = If<IsAny<T>, "any", "not-any">;
```

## Behavior and migration notes

- Deprecated aliases map to `If<Is*>` forms (`IfAny` → `If<IsAny<...>>`, etc.).
- This rule intentionally does not auto-fix because argument restructuring must be explicit and reviewable.
- Keep migration focused on parity: preserve branch types and generic parameter order during conversion.

## Additional examples

### ❌ Incorrect — Additional example

```ts
import type { IfUnknown } from "custom-type-utils";

type ParseMode<T> = IfUnknown<T, "strict", "lenient">;
```

### ✅ Correct — Additional example

```ts
import type { If, IsUnknown } from "type-fest";

type ParseMode<T> = If<IsUnknown<T>, "strict", "lenient">;
```

### ✅ Correct — Repository-wide usage

```ts
import type { If, IsNull } from "type-fest";

type NullLabel<T> = If<IsNull<T>, "nullable", "non-nullable">;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-if": "error",
        },
    },
];
```

## When not to use it

Disable this rule if legacy alias naming must be preserved for compatibility.

## Package documentation

TypeFest package documentation:

Source file: [`source/if.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/if.d.ts)

````ts
/**
An if-else-like type that resolves depending on whether the given `boolean` type is `true` or `false`.

Use-cases:
- You can use this in combination with `Is*` types to create an if-else-like experience. For example, `If<IsAny<any>, 'is any', 'not any'>`.

Note:
- Returns a union of if branch and else branch if the given type is `boolean` or `any`. For example, `If<boolean, 'Y', 'N'>` will return `'Y' | 'N'`.
- Returns the else branch if the given type is `never`. For example, `If<never, 'Y', 'N'>` will return `'N'`.

@example
```
import type {If} from 'type-fest';

type A = If<true, 'yes', 'no'>;
//=> 'yes'

type B = If<false, 'yes', 'no'>;
//=> 'no'

type C = If<boolean, 'yes', 'no'>;
//=> 'yes' | 'no'

type D = If<any, 'yes', 'no'>;
//=> 'yes' | 'no'

type E = If<never, 'yes', 'no'>;
//=> 'no'
```

@example
```
import type {If, IsAny, IsNever} from 'type-fest';

type A = If<IsAny<unknown>, 'is any', 'not any'>;
//=> 'not any'

type B = If<IsNever<never>, 'is never', 'not never'>;
//=> 'is never'
```

@example
```
import type {If, IsEqual} from 'type-fest';

type IfEqual<T, U, IfBranch, ElseBranch> = If<IsEqual<T, U>, IfBranch, ElseBranch>;

type A = IfEqual<string, string, 'equal', 'not equal'>;
//=> 'equal'

type B = IfEqual<string, number, 'equal', 'not equal'>;
//=> 'not equal'
```

Note: Sometimes using the `If` type can make an implementation non–tail-recursive, which can impact performance. In such cases, it’s better to use a conditional directly. Refer to the following example:

@example
```
import type {If, IsEqual, StringRepeat} from 'type-fest';

type HundredZeroes = StringRepeat<'0', 100>;

// The following implementation is not tail recursive
type Includes<S extends string, Char extends string> =
    S extends `${infer First}${infer Rest}`
        ? If<IsEqual<First, Char>,
            'found',
            Includes<Rest, Char>>
        : 'not found';

// Hence, instantiations with long strings will fail
// @ts-expect-error
type Fails = Includes<HundredZeroes, '1'>;
//           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Error: Type instantiation is excessively deep and possibly infinite.

// However, if we use a simple conditional instead of `If`, the implementation becomes tail-recursive
type IncludesWithoutIf<S extends string, Char extends string> =
    S extends `${infer First}${infer Rest}`
        ? IsEqual<First, Char> extends true
            ? 'found'
            : IncludesWithoutIf<Rest, Char>
        : 'not found';

// Now, instantiations with long strings will work
type Works = IncludesWithoutIf<HundredZeroes, '1'>;
//=> 'not found'
```

@category Type Guard
@category Utilities
*/
````

> **Rule catalog ID:** R041

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
