# prefer-type-fest-require-exactly-one

Require TypeFest [`RequireExactlyOne<T, Keys>`](https://github.com/sindresorhus/type-fest/blob/main/source/require-exactly-one.d.ts) over imported aliases like `OneOf` or `RequireOnlyOne`.

## Targeted pattern scope

This rule reports imported `OneOf`/`RequireOnlyOne` aliases and prefers `RequireExactlyOne<T, Keys>` for XOR-style object constraints.

Use this when callers must choose one mode, not multiple modes (for example,
`id` _or_ `slug`, `apiKey` _or_ `token`).

## What this rule reports

- Type references that resolve to imported `OneOf` aliases.
- Type references that resolve to imported `RequireOnlyOne` aliases.

### Detection boundaries

- ✅ Reports imported aliases with direct named imports.
- ❌ Does not report namespace-qualified alias usage.
- ✅ Auto-fixes imported alias references to `RequireExactlyOne` when replacement is syntactically safe.
- ✅ Alias coverage is configurable with `enforcedAliasNames`.

## Why this rule exists

`RequireExactlyOne` is the canonical TypeFest utility for enforcing exactly one active key among a set. Using the canonical name reduces semantic drift between utility libraries.

This is one of the most error-prone constraints in hand-written unions. Using a
known utility keeps intent obvious and consistent.

## ❌ Incorrect

```ts
import type { OneOf } from "type-aliases";

type Auth = OneOf<{
    token?: string;
    apiKey?: string;
}>;
```

## ✅ Correct

```ts
import type { RequireExactlyOne } from "type-fest";

type Auth = RequireExactlyOne<{
    token?: string;
    apiKey?: string;
}>;
```

## Behavior and migration notes

- `RequireExactlyOne<T, Keys>` encodes XOR object modes where one and only one key can be active.
- This rule targets alias names with matching semantics (`OneOf`, `RequireOnlyOne`).
- Keep the participating key set small and explicit to avoid hard-to-read error messages in consuming code.

### Options

This rule accepts a single options object:

```ts
type PreferTypeFestRequireExactlyOneOptions = {
    /**
     * Legacy alias names that this rule will report and replace.
     *
     * @default ["OneOf", "RequireOnlyOne"]
     */
    enforcedAliasNames?: ("OneOf" | "RequireOnlyOne")[];
};
```

Default configuration:

```ts
{
    enforcedAliasNames: ["OneOf", "RequireOnlyOne"],
}
```

Flat config setup (default behavior):

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-require-exactly-one": [
                "error",
                { enforcedAliasNames: ["OneOf", "RequireOnlyOne"] },
            ],
        },
    },
];
```

#### `enforcedAliasNames: ["OneOf", "RequireOnlyOne"]` (default)

Reports both legacy aliases.

#### `enforcedAliasNames: ["RequireOnlyOne"]`

Reports only `RequireOnlyOne` and ignores `OneOf`:

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-require-exactly-one": [
                "error",
                { enforcedAliasNames: ["RequireOnlyOne"] },
            ],
        },
    },
];
```

```ts
import type { OneOf, RequireOnlyOne } from "type-aliases";

type A = OneOf<{ a?: string; b?: number }>; // ✅ Not reported
type B = RequireOnlyOne<{ a?: string; b?: number }>; // ❌ Reported
```

## Additional examples

### ❌ Incorrect — Additional example

```ts
import type { RequireOnlyOne } from "custom-type-utils";

type LookupInput = RequireOnlyOne<
    {
        id?: string;
        slug?: string;
        externalRef?: string;
    },
    "id" | "slug" | "externalRef"
>;
```

### ✅ Correct — Additional example

```ts
import type { RequireExactlyOne } from "type-fest";

type LookupInput = RequireExactlyOne<
    {
        id?: string;
        slug?: string;
        externalRef?: string;
    },
    "id" | "slug" | "externalRef"
>;
```

### ✅ Correct — Repository-wide usage

```ts
type AuthInput = RequireExactlyOne<
    { token?: string; apiKey?: string; oauthCode?: string },
    "token" | "apiKey" | "oauthCode"
>;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-require-exactly-one": "error",
        },
    },
];
```

## When not to use it

Disable this rule if compatibility requirements force existing alias names.

## Package documentation

TypeFest package documentation:

Source file: [`source/require-exactly-one.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/require-exactly-one.d.ts)

````ts
/**
Create a type that requires exactly one of the given keys and disallows more. The remaining keys are kept as is.

Use-cases:
- Creating interfaces for components that only need one of the keys to display properly.
- Declaring generic keys in a single place for a single use-case that gets narrowed down via `RequireExactlyOne`.

The caveat with `RequireExactlyOne` is that TypeScript doesn't always know at compile time every key that will exist at runtime. Therefore `RequireExactlyOne` can't do anything to prevent extra keys it doesn't know about.

@example
```
import type {RequireExactlyOne} from 'type-fest';

type Responder = {
    text: () => string;
    json: () => string;
    secure: boolean;
};

const responder: RequireExactlyOne<Responder, 'text' | 'json'> = {
    // Adding a `text` key here would cause a compile error.

    json: () => '{"message": "ok"}',
    secure: true,
};
```

@category Object
*/
````

> **Rule catalog ID:** R058

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
