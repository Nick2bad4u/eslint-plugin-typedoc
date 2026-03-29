# prefer-type-fest-conditional-pick

Require TypeFest [`ConditionalPick<T, Condition>`](https://github.com/sindresorhus/type-fest/blob/main/source/conditional-pick.d.ts) over imported aliases like `PickByTypes`.

## Targeted pattern scope

This rule targets imported alias names that mirror TypeFest conditional property selection semantics.

## What this rule reports

- Type references that resolve to imported `PickByTypes` aliases.

## Why this rule exists

`ConditionalPick` is the canonical TypeFest utility for selecting fields by value type. Standardizing on TypeFest naming improves discoverability and improves consistency.

## ❌ Incorrect

```ts
import type { PickByTypes } from "type-aliases";

type StringProps = PickByTypes<User, string>;
```

## ✅ Correct

```ts
import type { ConditionalPick } from "type-fest";

type StringProps = ConditionalPick<User, string>;
```

## Behavior and migration notes

- `ConditionalPick<T, Condition>` selects keys whose value types extend `Condition`.
- This rule targets alias names with equivalent semantics (`PickByTypes`).
- Keep aliases only when they intentionally add behavior beyond simple conditional key filtering.

## Additional examples

### ❌ Incorrect — Additional example

```ts
import type { PickByTypes } from "type-aliases";

type StringFields = PickByTypes<User, string>;
```

### ✅ Correct — Additional example

```ts
import type { ConditionalPick } from "type-fest";

type StringFields = ConditionalPick<User, string>;
```

### ✅ Correct — Repository-wide usage

```ts
type DateFields = ConditionalPick<User, Date>;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-conditional-pick": "error",
        },
    },
];
```

## When not to use it

Disable this rule if compatibility requirements force existing alias names.

## Package documentation

TypeFest package documentation:

Source file: [`source/conditional-pick.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/conditional-pick.d.ts)

````ts
/**
Pick keys from the shape that matches the given `Condition`.

This is useful when you want to create a new type from a specific subset of an existing type. For example, you might want to pick all the primitive properties from a class and form a new automatically derived type.

@example
```
import type {Primitive, ConditionalPick} from 'type-fest';

class Awesome {
    constructor(public name: string, public successes: number, public failures: bigint) {}

    run() {
        // do something
    }
}

type PickPrimitivesFromAwesome = ConditionalPick<Awesome, Primitive>;
//=> {name: string; successes: number; failures: bigint}
```

@example
```
import type {ConditionalPick} from 'type-fest';

type Example = {
    a: string;
    b: string | number;
    c: () => void;
    d: {};
};

type StringKeysOnly = ConditionalPick<Example, string>;
//=> {a: string}
```

@category Object
*/
````

> **Rule catalog ID:** R038

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
