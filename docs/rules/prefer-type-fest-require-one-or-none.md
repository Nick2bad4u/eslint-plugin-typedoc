# prefer-type-fest-require-one-or-none

Require TypeFest [`RequireOneOrNone<T, Keys>`](https://github.com/sindresorhus/type-fest/blob/main/source/require-one-or-none.d.ts) over imported aliases like `AtMostOne`.

## Targeted pattern scope

This rule reports imported `AtMostOne` aliases and prefers `RequireOneOrNone<T, Keys>` for zero-or-one selector constraints.

Use this utility when a payload may omit all optional selectors, but must not
provide two selectors at the same time.

## What this rule reports

- Type references that resolve to imported `AtMostOne` aliases.

### Detection boundaries

- ✅ Reports imported aliases with direct named imports.
- ❌ Does not report namespace-qualified alias usage.
- ❌ Does not auto-fix.

## Why this rule exists

`RequireOneOrNone` is the canonical TypeFest utility for expressing “zero or exactly one” optional key constraints. Canonical naming keeps type utility usage predictable in public codebases.

This pattern appears in query/filter payloads where no selector is valid but
multiple selectors conflict.

## ❌ Incorrect

```ts
import type { AtMostOne } from "type-aliases";

type OptionalAuth = AtMostOne<{
    token?: string;
    apiKey?: string;
}>;
```

## ✅ Correct

```ts
import type { RequireOneOrNone } from "type-fest";

type OptionalAuth = RequireOneOrNone<{
    token?: string;
    apiKey?: string;
}>;
```

## Behavior and migration notes

- `RequireOneOrNone<T, Keys>` models selectors where zero is valid but more than one is invalid.
- This rule targets alias names with equivalent semantics (`AtMostOne`).
- Keep the key subset focused on mutually exclusive selectors to maintain readable contract intent.

## Additional examples

### ❌ Incorrect — Additional example

```ts
import type { AtMostOne } from "custom-type-utils";

type MonitorLookup = AtMostOne<
    {
        monitorId?: string;
        slug?: string;
    },
    "monitorId" | "slug"
>;
```

### ✅ Correct — Additional example

```ts
import type { RequireOneOrNone } from "type-fest";

type MonitorLookup = RequireOneOrNone<
    {
        monitorId?: string;
        slug?: string;
    },
    "monitorId" | "slug"
>;
```

### ✅ Correct — Repository-wide usage

```ts
type SessionIdentity = RequireOneOrNone<
    { userId?: string; guestId?: string },
    "userId" | "guestId"
>;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-require-one-or-none": "error",
        },
    },
];
```

## When not to use it

Disable this rule if existing alias names are part of a published API contract.

## Package documentation

TypeFest package documentation:

Source file: [`source/require-one-or-none.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/require-one-or-none.d.ts)

````ts
/**
Create a type that requires exactly one of the given keys and disallows more, or none of the given keys. The remaining keys are kept as is.

@example
```
import type {RequireOneOrNone} from 'type-fest';

type Responder = RequireOneOrNone<{
    text: () => string;
    json: () => string;
    secure: boolean;
}, 'text' | 'json'>;

const responder1: Responder = {
    secure: true,
};

const responder2: Responder = {
    text: () => '{"message": "hi"}',
    secure: true,
};

const responder3: Responder = {
    json: () => '{"message": "ok"}',
    secure: true,
};
```

@category Object
*/
````

> **Rule catalog ID:** R059

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
