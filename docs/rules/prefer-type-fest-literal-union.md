# prefer-type-fest-literal-union

Require TypeFest [`LiteralUnion`](https://github.com/sindresorhus/type-fest/blob/main/source/literal-union.d.ts) over unions that mix primitive keywords with same-family literal members.

## Targeted pattern scope

This rule targets patterns like `"foo" | "bar" | string` and `200 | 404 | number`.

Those unions are usually better expressed with `LiteralUnion`, which preserves literal IntelliSense while retaining primitive assignability.

## What this rule reports

- String literal unions that also include `string`.
- Number literal unions that also include `number`.
- Boolean literal unions that also include `boolean`.
- Bigint literal unions that also include `bigint`.

### Detection boundaries

- ✅ Reports same-family literal-plus-primitive unions (for example `"a" | string`).
- ❌ Does not rewrite cross-family unions (for example `"a" | number`).

## Why this rule exists

`LiteralUnion<Literals, Primitive>` preserves literal completions while still accepting the broad primitive type.

This keeps APIs ergonomic for known values without over-constraining extension points.

## ❌ Incorrect

```ts
type Environment = "dev" | "prod" | string;
type HttpCode = 200 | 404 | number;
```

## ✅ Correct

```ts
import type { LiteralUnion } from "type-fest";

type Environment = LiteralUnion<"dev" | "prod", string>;
type HttpCode = LiteralUnion<200 | 404, number>;
```

## Behavior and migration notes

- Use the second parameter to match the primitive family (`string`, `number`, `boolean`, `bigint`).
- Preserve literal member intent by keeping the literal union in the first type argument.
- Avoid this pattern for closed enums where broad primitive assignability is not wanted.

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-literal-union": "error",
        },
    },
];
```

## When not to use it

Disable this rule if your team prefers explicit primitive-plus-literal unions and does not want the additional abstraction.

## Package documentation

TypeFest package documentation:

Source file: [`source/literal-union.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/literal-union.d.ts)

````ts
/**
Allows creating a union type by combining primitive types and literal types without sacrificing auto-completion in IDEs for the literal type part of the union.

Currently, when a union type of a primitive type is combined with literal types, TypeScript loses all information about the combined literals. Thus, when such type is used in an IDE with autocompletion, no suggestions are made for the declared literals.

This type is a workaround for [Microsoft/TypeScript#29729](https://github.com/Microsoft/TypeScript/issues/29729). It will be removed as soon as it's not needed anymore.

@example
```
import type {LiteralUnion} from 'type-fest';

// Before

type Pet = 'dog' | 'cat' | string;

const petWithoutAutocomplete: Pet = '';
// Start typing in your TypeScript-enabled IDE.
// You **will not** get auto-completion for `dog` and `cat` literals.

// After

type Pet2 = LiteralUnion<'dog' | 'cat', string>;

const petWithAutoComplete: Pet2 = '';
// You **will** get auto-completion for `dog` and `cat` literals.
```

@category Type
*/
````

> **Rule catalog ID:** R048

## Further reading

- [TypeFest README](https://github.com/sindresorhus/type-fest)
- [TypeScript Handbook: Literal Types](https://www.typescriptlang.org/docs/handbook/literal-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
