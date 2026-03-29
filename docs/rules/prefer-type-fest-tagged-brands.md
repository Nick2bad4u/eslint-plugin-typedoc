# prefer-type-fest-tagged-brands

Prefers TypeFest `Tagged` for branded primitive identifiers over ad-hoc `__brand`/`__tag` intersection patterns.

## Targeted pattern scope

This rule targets ad-hoc brand-marker intersections and legacy alias names used for branded primitives.

## What this rule reports

- Type aliases that use intersection branding with explicit brand-marker fields.
- Type references that resolve to imported `Opaque` / `Branded` aliases.
- Existing `Tagged` usage is ignored.

### Detection boundaries

- ✅ Reports ad-hoc brand-marker intersections by default.
- ✅ Reports imported `Opaque` / `Branded` aliases by default.
- ❌ Does not report namespace-qualified alias usage.
- ✅ Auto-fixes imported legacy alias references to `Tagged` when replacement is syntactically safe.
- ❌ Does not auto-fix ad-hoc intersection branding declarations.
- ✅ Enforcement surface is configurable with `enforceAdHocBrandIntersections` and `enforceLegacyAliases`.

## Why this rule exists

`Tagged` provides a standard, reusable branded-type approach that improves consistency and readability.

## ❌ Incorrect

```ts
type UserId = string & { readonly __brand: "UserId" };
```

## ✅ Correct

```ts
type UserId = Tagged<string, "UserId">;
```

## Behavior and migration notes

- `Tagged<Base, Tag>` standardizes branded identity types.
- This rule targets both structural brand fields (`__brand`, `__tag`) and legacy alias references (`Opaque`, `Branded`).
- Use canonical `Tagged` aliases for IDs and domain markers to keep branding semantics consistent across packages.

### Options

This rule accepts a single options object:

```ts
type PreferTypeFestTaggedBrandsOptions = {
    /**
     * Whether to report structural ad-hoc branding intersections.
     *
     * @default true
     */
    enforceAdHocBrandIntersections?: boolean;

    /**
     * Whether to report imported legacy aliases like Opaque/Branded.
     *
     * @default true
     */
    enforceLegacyAliases?: boolean;
};
```

Default configuration:

```ts
{
    enforceAdHocBrandIntersections: true,
    enforceLegacyAliases: true,
}
```

Flat config setup (default behavior):

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-tagged-brands": [
                "error",
                {
                    enforceAdHocBrandIntersections: true,
                    enforceLegacyAliases: true,
                },
            ],
        },
    },
];
```

#### `enforceAdHocBrandIntersections: false`

Ignores structural ad-hoc intersections, while still reporting legacy aliases:

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-tagged-brands": [
                "error",
                {
                    enforceAdHocBrandIntersections: false,
                    enforceLegacyAliases: true,
                },
            ],
        },
    },
];
```

```ts
import type { Opaque } from "type-aliases";

type A = string & { readonly __brand: "UserId" }; // ✅ Not reported
type B = Opaque<string, "UserId">; // ❌ Reported
```

#### `enforceLegacyAliases: false`

Ignores imported `Opaque`/`Branded` aliases, while still reporting ad-hoc intersections:

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-tagged-brands": [
                "error",
                {
                    enforceAdHocBrandIntersections: true,
                    enforceLegacyAliases: false,
                },
            ],
        },
    },
];
```

```ts
import type { Opaque } from "type-aliases";

type A = Opaque<string, "UserId">; // ✅ Not reported
type B = string & { readonly __brand: "UserId" }; // ❌ Reported
```

## Additional examples

### ❌ Incorrect — Additional example

```ts
type OrderId = string & { readonly __tag: "OrderId" };
```

### ✅ Correct — Additional example

```ts
type OrderId = Tagged<string, "OrderId">;
```

### ✅ Correct — Repository-wide usage

```ts
type TenantId = Tagged<string, "TenantId">;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-tagged-brands": "error",
        },
    },
];
```

## When not to use it

Disable this rule if existing brand encodings must remain for backward compatibility.

## Package documentation

TypeFest package documentation:

Source file: [`source/tagged.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/tagged.d.ts)

````ts
/**
Attach a "tag" to an arbitrary type. This allows you to create distinct types, that aren't assignable to one another, for distinct concepts in your program that should not be interchangeable, even if their runtime values have the same type. (See examples.)

A type returned by `Tagged` can be passed to `Tagged` again, to create a type with multiple tags.

[Read more about tagged types.](https://medium.com/@KevinBGreene/surviving-the-typescript-ecosystem-branding-and-type-tagging-6cf6e516523d)

A tag's name is usually a string (and must be a string, number, or symbol), but each application of a tag can also contain an arbitrary type as its "metadata". See {@link GetTagMetadata} for examples and explanation.

A type `A` returned by `Tagged` is assignable to another type `B` returned by `Tagged` if and only if:
  - the underlying (untagged) type of `A` is assignable to the underlying type of `B`;
    - `A` contains at least all the tags `B` has;
    - and the metadata type for each of `A`'s tags is assignable to the metadata type of `B`'s corresponding tag.

There have been several discussions about adding similar features to TypeScript. Unfortunately, nothing has (yet) moved forward:
    - [Microsoft/TypeScript#202](https://github.com/microsoft/TypeScript/issues/202)
    - [Microsoft/TypeScript#4895](https://github.com/microsoft/TypeScript/issues/4895)
    - [Microsoft/TypeScript#33290](https://github.com/microsoft/TypeScript/pull/33290)

@example
```
import type {Tagged} from 'type-fest';

type AccountNumber = Tagged<number, 'AccountNumber'>;
type AccountBalance = Tagged<number, 'AccountBalance'>;

function createAccountNumber(): AccountNumber {
    // As you can see, casting from a `number` (the underlying type being tagged) is allowed.
    return 2 as AccountNumber;
}

declare function getMoneyForAccount(accountNumber: AccountNumber): AccountBalance;

// This will compile successfully.
getMoneyForAccount(createAccountNumber());

// But this won't, because it has to be explicitly passed as an `AccountNumber` type!
// Critically, you could not accidentally use an `AccountBalance` as an `AccountNumber`.
// @ts-expect-error
getMoneyForAccount(2);

// You can also use tagged values like their underlying, untagged type.
// I.e., this will compile successfully because an `AccountNumber` can be used as a regular `number`.
// In this sense, the underlying base type is not hidden, which differentiates tagged types from opaque types in other languages.
const accountNumber = createAccountNumber() + 2;
```

@example
```
import type {Tagged} from 'type-fest';

// You can apply multiple tags to a type by using `Tagged` repeatedly.
type Url = Tagged<string, 'URL'>;
type SpecialCacheKey = Tagged<Url, 'SpecialCacheKey'>;

// You can also pass a union of tag names, so this is equivalent to the above, although it doesn't give you the ability to assign distinct metadata to each tag.
type SpecialCacheKey2 = Tagged<string, 'URL' | 'SpecialCacheKey'>;
```

@category Type
*/
````

> **Rule catalog ID:** R067

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
