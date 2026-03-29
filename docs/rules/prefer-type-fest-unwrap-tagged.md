# prefer-type-fest-unwrap-tagged

Require TypeFest [`UnwrapTagged`](https://github.com/sindresorhus/type-fest/blob/main/source/tagged.d.ts) over imported aliases like `UnwrapOpaque`.

## Targeted pattern scope

This rule targets deprecated `UnwrapOpaque` alias usage.

## What this rule reports

- Type references that resolve to imported `UnwrapOpaque` aliases.

## Why this rule exists

`UnwrapOpaque` is deprecated in TypeFest in favor of `UnwrapTagged`.
Standardizing on the canonical utility avoids deprecated API usage and keeps
types aligned with current TypeFest docs.

## ❌ Incorrect

```ts
import type { UnwrapOpaque } from "type-fest";

type RawId = UnwrapOpaque<UserId>;
```

## ✅ Correct

```ts
import type { UnwrapTagged } from "type-fest";

type RawId = UnwrapTagged<UserId>;
```

## Behavior and migration notes

- `UnwrapTagged<T>` is the supported replacement for deprecated `UnwrapOpaque<T>`.
- Use it when branded/tagged identifiers need to be converted back to raw underlying types.
- Keep unwrap operations localized near serialization and interop boundaries.

## Additional examples

### ❌ Incorrect — Additional example

```ts
import type { UnwrapOpaque } from "type-fest";

type RawId = UnwrapOpaque<UserId>;
```

### ✅ Correct — Additional example

```ts
import type { UnwrapTagged } from "type-fest";

type RawId = UnwrapTagged<UserId>;
```

### ✅ Correct — Repository-wide usage

```ts
type RawOrderId = UnwrapTagged<OrderId>;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-unwrap-tagged": "error",
        },
    },
];
```

## When not to use it

Disable this rule if compatibility requirements force retention of deprecated alias names.

## Package documentation

TypeFest package documentation:

Source file: [`source/tagged.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/tagged.d.ts)

````ts
/**
Revert a tagged type back to its original type by removing all tags.

Why is this necessary?

1. Use a `Tagged` type as object keys
2. Prevent TS4058 error: "Return type of exported function has or is using name X from external module Y but cannot be named"

@example
```
import type {Tagged, UnwrapTagged} from 'type-fest';

type AccountType = Tagged<'SAVINGS' | 'CHECKING', 'AccountType'>;

const moneyByAccountType: Record<UnwrapTagged<AccountType>, number> = {
    SAVINGS: 99,
    CHECKING: 0.1,
};

// Without UnwrapTagged, the following expression would throw a type error.
const money = moneyByAccountType.SAVINGS; // TS error: Property 'SAVINGS' does not exist

// Attempting to pass an non-Tagged type to UnwrapTagged will raise a type error.
// @ts-expect-error
type WontWork = UnwrapTagged<string>;
```

@category Type
*/
````

> **Rule catalog ID:** R073

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
