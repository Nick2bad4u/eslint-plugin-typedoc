# prefer-type-fest-unknown-record

Prefers `UnknownRecord` from TypeFest over `Record<string, unknown>` in architecture-critical layers.

## Targeted pattern scope

This rule targets explicit unknown-record spellings that TypeFest standardizes as `UnknownRecord`.

- `Record<string, unknown>` type references in configured boundary paths (for example shared contracts and IPC-adjacent layers).

Other collection contracts are left alone unless they match the exact unknown collection form listed below.

## What this rule reports

This rule reports unknown-record type forms that should migrate to `UnknownRecord`.

- `Record<string, unknown>` type references in configured boundary paths (for example shared contracts and IPC-adjacent layers).

## Why this rule exists

`UnknownRecord` conveys intent directly and keeps boundary contracts consistent with TypeFest-first typing conventions.

## ❌ Incorrect

```ts
type Payload = Record<string, unknown>;
```

## ✅ Correct

```ts
type Payload = UnknownRecord;
```

## Behavior and migration notes

- `UnknownRecord` is the canonical dictionary-like unknown-object alias in `type-fest`.
- Standardize boundary object contracts on `UnknownRecord` instead of repeating `Record<string, unknown>`.
- Keep runtime validation and field narrowing at call sites that consume unknown records.

## Additional examples

### ❌ Incorrect — Additional example

```ts
type Input = Record<string, unknown>;
```

### ✅ Correct — Additional example

```ts
type Input = UnknownRecord;
```

### ✅ Correct — Repository-wide usage

```ts
type EventPayload = UnknownRecord;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-unknown-record": "error",
        },
    },
];
```

## When not to use it

Disable this rule if a public contract requires preserving existing record alias names.

## Package documentation

TypeFest package documentation:

Source file: [`source/unknown-record.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/unknown-record.d.ts)

````ts
/**
Represents an object with `unknown` value. You probably want this instead of `{}`.

Use case: You have an object whose keys and values are unknown to you.

@example
```
import type {UnknownRecord} from 'type-fest';

function toJson(object: UnknownRecord) {
    return JSON.stringify(object);
}

toJson({hello: 'world'}); // Ok

function isObject(value: unknown): value is UnknownRecord {
    return typeof value === 'object' && value !== null;
}

const value: unknown = {hello: 'world'};

if (isObject(value)) {
    const v = value;
    //=> UnknownRecord
}
```

@category Type
@category Object
*/
````

> **Rule catalog ID:** R071

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
