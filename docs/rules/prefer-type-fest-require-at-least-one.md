# prefer-type-fest-require-at-least-one

Require TypeFest [`RequireAtLeastOne<T, Keys>`](https://github.com/sindresorhus/type-fest/blob/main/source/require-at-least-one.d.ts) over imported aliases like
`AtLeastOne`.

## Targeted pattern scope

This rule reports imported `AtLeastOne` aliases and prefers `RequireAtLeastOne<T, Keys>` for at-least-one field requirements.

It is especially valuable for search DTOs and patch/update payloads where
empty objects should be rejected at compile time.

## What this rule reports

- Type references that resolve to imported `AtLeastOne` aliases.

### Detection boundaries

- ✅ Reports imported aliases with direct named imports.
- ❌ Does not report namespace-qualified aliases.
- ❌ Does not auto-fix.

## Why this rule exists

`RequireAtLeastOne` is the canonical TypeFest utility for enforcing at least one
required key among a set of optional candidates. Standardizing on canonical
TypeFest naming keeps public type contracts easier to understand and maintain.

For user-facing APIs, this avoids accepting meaningless payloads like `{}`
where at least one filter field is required.

## ❌ Incorrect

```ts
import type { AtLeastOne } from "type-aliases";

type Update = AtLeastOne<User>;
```

## ✅ Correct

```ts
import type { RequireAtLeastOne } from "type-fest";

type Update = RequireAtLeastOne<User>;
```

## Behavior and migration notes

- `RequireAtLeastOne<T, Keys>` prevents empty-object payloads when at least one selector is required.
- This rule targets alias names with equivalent semantics (`AtLeastOne`).
- Use keyed variants for large object types to constrain only the fields that participate in the requirement.

## Additional examples

### ❌ Incorrect — Additional example

```ts
import type { AtLeastOne } from "custom-type-utils";

type UserSearch = AtLeastOne<
    {
        email?: string;
        id?: string;
        username?: string;
    },
    "email" | "id" | "username"
>;
```

### ✅ Correct — Additional example

```ts
import type { RequireAtLeastOne } from "type-fest";

type UserSearch = RequireAtLeastOne<
    {
        email?: string;
        id?: string;
        username?: string;
    },
    "email" | "id" | "username"
>;
```

### ✅ Correct — Repository-wide usage

```ts
type ProfilePatch = RequireAtLeastOne<
    { avatarUrl?: string; displayName?: string; bio?: string },
    "avatarUrl" | "displayName" | "bio"
>;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-require-at-least-one": "error",
        },
    },
];
```

## When not to use it

Disable this rule if published contracts must preserve existing alias names.

## Package documentation

TypeFest package documentation:

Source file: [`source/require-at-least-one.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/require-at-least-one.d.ts)

````ts
/**
Create a type that requires at least one of the given keys. The remaining keys are kept as is.

@example
```
import type {RequireAtLeastOne} from 'type-fest';

type Responder = {
    text?: () => string;
    json?: () => string;
    secure?: boolean;
};

const responder: RequireAtLeastOne<Responder, 'text' | 'json'> = {
    json: () => '{"message": "ok"}',
    secure: true,
};
```

@category Object
*/
````

> **Rule catalog ID:** R057

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
