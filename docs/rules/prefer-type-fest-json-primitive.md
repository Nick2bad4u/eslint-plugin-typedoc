# prefer-type-fest-json-primitive

Require TypeFest [`JsonPrimitive`](https://github.com/sindresorhus/type-fest/blob/main/source/json-value.d.ts) over explicit JSON primitive keyword unions.

## Targeted pattern scope

This rule narrows matching to explicit primitive-union spellings that TypeFest captures as `JsonPrimitive`.

- `boolean | null | number | string` unions (in any order)

Non-primitive additions and alias-expanded unions are out of scope unless they exactly preserve the primitive set.

## What this rule reports

This rule reports primitive-only unions that should be rewritten as `JsonPrimitive`.

- `boolean | null | number | string` unions (in any order)

## Why this rule exists

`JsonPrimitive` communicates JSON primitive intent directly and avoids repeating equivalent keyword-union definitions.

## ❌ Incorrect

```ts
type Scalar = string | number | boolean | null;
```

## ✅ Correct

```ts
type Scalar = JsonPrimitive;
```

## Behavior and migration notes

- `JsonPrimitive` covers `string | number | boolean | null`.
- The union order in source code is irrelevant; this rule targets the shape, not token order.
- Keep this alias for scalar JSON domains while using `JsonValue` for full recursive JSON values.

## Additional examples

### ❌ Incorrect — Additional example

```ts
type PrimitiveValue = string | number | boolean | null;
```

### ✅ Correct — Additional example

```ts
type PrimitiveValue = JsonPrimitive;
```

### ✅ Correct — Repository-wide usage

```ts
type Cell = JsonPrimitive;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-json-primitive": "error",
        },
    },
];
```

## When not to use it

Disable this rule if existing exported aliases must remain stable.

## Package documentation

TypeFest package documentation:

Source file: [`source/json-value.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/json-value.d.ts)

```ts
/**
Matches any valid JSON primitive value.

@category JSON
*/
```

> **Rule catalog ID:** R045

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
