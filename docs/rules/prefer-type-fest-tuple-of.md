# prefer-type-fest-tuple-of

Require `Readonly<TupleOf<Length, Element>>` over imported aliases like
`ReadonlyTuple`.

## Targeted pattern scope

This rule targets deprecated `ReadonlyTuple` and `Tuple` alias usage.

## What this rule reports

- Type references that resolve to imported `ReadonlyTuple` aliases.
- Type references that resolve to imported `Tuple` aliases.

### Detection boundaries

- ✅ Reports imported aliases with direct named imports.
- ❌ Does not report namespace-qualified alias usage.
- ✅ Auto-fixes imported alias references to canonical `TupleOf` forms when replacement is syntactically safe.
- ✅ Alias coverage is configurable with `enforcedAliasNames`.

## Why this rule exists

`ReadonlyTuple` is deprecated in TypeFest. The canonical replacement is
`Readonly<TupleOf<Length, Element>>`, which keeps readonly semantics explicit
while using the supported tuple utility.

## ❌ Incorrect

```ts
import type { ReadonlyTuple } from "type-fest";

type Digits = ReadonlyTuple<number, 4>;
```

## ✅ Correct

```ts
import type { TupleOf } from "type-fest";

type Digits = Readonly<TupleOf<4, number>>;
```

## Behavior and migration notes

- `ReadonlyTuple<Element, Length>` is deprecated in favor of `Readonly<TupleOf<Length, Element>>`.
- `Tuple<Element, Length>` is deprecated in favor of `TupleOf<Length, Element>`.
- This rule migrates deprecated TypeFest tuple naming toward supported utilities.
- Keep readonly wrapping explicit so mutability intent remains visible at call sites.

### Options

This rule accepts a single options object:

```ts
type PreferTypeFestTupleOfOptions = {
    /**
     * Legacy alias names that this rule will report and replace.
     *
     * @default ["ReadonlyTuple", "Tuple"]
     */
    enforcedAliasNames?: ("ReadonlyTuple" | "Tuple")[];
};
```

Default configuration:

```ts
{
    enforcedAliasNames: ["ReadonlyTuple", "Tuple"],
}
```

Flat config setup (default behavior):

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-tuple-of": [
                "error",
                { enforcedAliasNames: ["ReadonlyTuple", "Tuple"] },
            ],
        },
    },
];
```

#### `enforcedAliasNames: ["ReadonlyTuple", "Tuple"]` (default)

Reports both legacy aliases.

#### `enforcedAliasNames: ["Tuple"]`

Reports only `Tuple` and ignores `ReadonlyTuple`:

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-tuple-of": [
                "error",
                { enforcedAliasNames: ["Tuple"] },
            ],
        },
    },
];
```

```ts
import type { ReadonlyTuple, Tuple } from "type-aliases";

type A = ReadonlyTuple<string, 3>; // ✅ Not reported
type B = Tuple<string, 3>; // ❌ Reported
```

## Additional examples

### ❌ Incorrect — Additional example

```ts
import type { ReadonlyTuple } from "type-fest";

type IPv4 = ReadonlyTuple<number, 4>;
```

### ✅ Correct — Additional example

```ts
import type { TupleOf } from "type-fest";

type IPv4 = Readonly<TupleOf<4, number>>;
```

### ✅ Correct — Repository-wide usage

```ts
type RGB = TupleOf<3, number>;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-tuple-of": "error",
        },
    },
];
```

## When not to use it

Disable this rule if compatibility constraints require preserving deprecated aliases.

## Package documentation

TypeFest package documentation:

Source file: [`source/tuple-of.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/tuple-of.d.ts)

````ts
/**
Create a tuple type of the specified length with elements of the specified type.

@example
```
import type {TupleOf} from 'type-fest';

type RGB = TupleOf<3, number>;
//=> [number, number, number]

type Line = TupleOf<2, {x: number; y: number}>;
//=> [{x: number; y: number}, {x: number; y: number}]

type TicTacToeBoard = TupleOf<3, TupleOf<3, 'X' | 'O' | null>>;
//=> [['X' | 'O' | null, 'X' | 'O' | null, 'X' | 'O' | null], ['X' | 'O' | null, 'X' | 'O' | null, 'X' | 'O' | null], ['X' | 'O' | null, 'X' | 'O' | null, 'X' | 'O' | null]]
```

@example
```
import type {TupleOf} from 'type-fest';

type Range<Start extends number, End extends number> = Exclude<keyof TupleOf<End>, keyof TupleOf<Start>>;

type ZeroToFour = Range<0, 5>;
//=> '0' | '1' | '2' | '3' | '4'

type ThreeToEight = Range<3, 9>;
//=> '5' | '3' | '4' | '6' | '7' | '8'
```

Note: If the specified length is the non-literal `number` type, the result will not be a tuple but a regular array.

@example
```
import type {TupleOf} from 'type-fest';

type StringArray = TupleOf<number, string>;
//=> string[]
```

Note: If the type for elements is not specified, it will default to `unknown`.

@example
```
import type {TupleOf} from 'type-fest';

type UnknownTriplet = TupleOf<3>;
//=> [unknown, unknown, unknown]
```

Note: If the specified length is negative, the result will be an empty tuple.

@example
```
import type {TupleOf} from 'type-fest';

type EmptyTuple = TupleOf<-3, string>;
//=> []
```

Note: If you need a readonly tuple, simply wrap this type with `Readonly`, for example, to create `readonly [number, number, number]` use `Readonly<TupleOf<3, number>>`.

@category Array
*/
````

> **Rule catalog ID:** R068

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
