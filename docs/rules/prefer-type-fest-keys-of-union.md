# prefer-type-fest-keys-of-union

Require TypeFest [`KeysOfUnion<T>`](https://github.com/sindresorhus/type-fest/blob/main/source/keys-of-union.d.ts) over imported aliases like `AllKeys`.

## Targeted pattern scope

This rule targets imported alias names used for "all keys across union members" extraction.

## What this rule reports

- Type references that resolve to imported `AllKeys` aliases.

## Why this rule exists

`KeysOfUnion` is the canonical TypeFest utility for extracting the full key union across object unions. Using canonical utility names improves readability and consistency.

## ❌ Incorrect

```ts
import type { AllKeys } from "type-aliases";

type Keys = AllKeys<Foo | Bar>;
```

## ✅ Correct

```ts
import type { KeysOfUnion } from "type-fest";

type Keys = KeysOfUnion<Foo | Bar>;
```

## Behavior and migration notes

- `KeysOfUnion<T>` includes keys that appear in any member of an object union.
- This rule targets alias names with matching semantics (`AllKeys`).
- Use this utility when discriminated unions require full key introspection across variants.

## Additional examples

### ❌ Incorrect — Additional example

```ts
import type { AllKeys } from "type-aliases";

type Keys = AllKeys<A | B>;
```

### ✅ Correct — Additional example

```ts
import type { KeysOfUnion } from "type-fest";

type Keys = KeysOfUnion<A | B>;
```

### ✅ Correct — Repository-wide usage

```ts
type EventKeys = KeysOfUnion<CreateEvent | DeleteEvent>;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-keys-of-union": "error",
        },
    },
];
```

## When not to use it

Disable this rule if existing alias names must remain for public API compatibility.

## Package documentation

TypeFest package documentation:

Source file: [`source/keys-of-union.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/keys-of-union.d.ts)

````ts
/**
Create a union of all keys from a given type, even those exclusive to specific union members.

Unlike the native `keyof` keyword, which returns keys present in **all** union members, this type returns keys from **any** member.

@link https://stackoverflow.com/a/49402091

@example
```
import type {KeysOfUnion} from 'type-fest';

type A = {
    common: string;
    a: number;
};

type B = {
    common: string;
    b: string;
};

type C = {
    common: string;
    c: boolean;
};

type Union = A | B | C;

type CommonKeys = keyof Union;
//=> 'common'

type AllKeys = KeysOfUnion<Union>;
//=> 'common' | 'a' | 'b' | 'c'
```

@category Object
*/
````

> **Rule catalog ID:** R047

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
