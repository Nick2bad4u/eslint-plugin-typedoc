# prefer-type-fest-schema

Require TypeFest [`Schema<ObjectType, ValueType>`](https://github.com/sindresorhus/type-fest/blob/main/source/schema.d.ts) over imported aliases like `RecordDeep`.

## Targeted pattern scope

This rule keeps deep object-shape transforms on the canonical `type-fest`
utility: `Schema<ObjectType, ValueType>`.

It is designed for consistency, not aggressive rewriting. Replacing third-party
aliases such as `RecordDeep` with `Schema` is usually straightforward, but you
should still validate semantics if your old utility had custom behavior.

## What this rule reports

- Imported `RecordDeep` aliases used as identifier type references.

### Detection boundaries

- ✅ Reports `import type { RecordDeep } ...` + `RecordDeep<...>` usage.
- ❌ Does not report locally renamed imports (`RecordDeep as AliasRecordDeep`).
- ❌ Does not report namespace-qualified usages such as `TypeUtils.RecordDeep<...>`.
- ❌ Does not auto-fix.

## Why this rule exists

`Schema` is the canonical TypeFest utility for deep value-shape transformation across object types. Standardized naming helps readers recognize intent immediately.

`type-fest` describes itself as **"A collection of essential TypeScript
types"**. Using canonical names means engineers can jump directly between your
code and upstream docs without translation.

## ❌ Incorrect

```ts
import type { RecordDeep } from "type-aliases";

type Flags = RecordDeep<Config, boolean>;
```

## ✅ Correct

```ts
import type { Schema } from "type-fest";

type Flags = Schema<Config, boolean>;
```

## Behavior and migration notes

- `Schema<ObjectType, ValueType>` recursively maps leaf value types while preserving object shape.
- This rule targets imported alias names with overlapping semantics (`RecordDeep`).
- Validate behavior if your previous alias implemented custom deep-mapping edge cases beyond `Schema`.

## Additional examples

### ❌ Incorrect — Additional example

```ts
import type { RecordDeep } from "custom-type-utils";

type AuditMask = RecordDeep<UserProfile, "REDACTED">;
```

### ✅ Correct — Additional example

```ts
import type { Schema } from "type-fest";

type AuditMask = Schema<UserProfile, "REDACTED">;
```

### ✅ Correct — Repository-wide usage

```ts
type FeatureFlags = Schema<EnvironmentConfig, boolean>;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-schema": "error",
        },
    },
];
```

## When not to use it

Disable this rule if existing deep-shape aliases encode custom semantics that differ from `Schema`.

## Package documentation

TypeFest package documentation:

Source file: [`source/schema.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/schema.d.ts)

````ts
/**
Create a deep version of another object type where property values are recursively replaced into a given value type.

Use-cases:
- Form validation: Define how each field should be validated.
- Form settings: Define configuration for input fields.
- Parsing: Define types that specify special behavior for specific fields.

@example
```
import type {Schema} from 'type-fest';

type User = {
    id: string;
    name: {
        firstname: string;
        lastname: string;
    };
    created: Date;
    active: boolean;
    passwordHash: string;
    location: [latitude: number, longitude: number];
};

type UserMask = Schema<User, 'mask' | 'hide' | 'show'>;

const userMaskSettings: UserMask = {
    id: 'show',
    name: {
        firstname: 'show',
        lastname: 'mask',
    },
    created: 'show',
    active: 'show',
    passwordHash: 'hide',
    location: ['hide', 'hide'],
};
```

@see {@link SchemaOptions}

@category Object
*/
````

> **Rule catalog ID:** R061

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
