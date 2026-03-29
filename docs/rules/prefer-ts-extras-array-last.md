# prefer-ts-extras-array-last

Require [`arrayLast`](https://github.com/sindresorhus/ts-extras/blob/main/source/array-last.ts) from `ts-extras` over direct `array[array.length - 1]` access.

## Targeted pattern scope

This rule only matches direct last-element index access (`receiver[receiver.length - 1]`) where the receiver expression can be reused unchanged in `arrayLast(receiver)`.

- Direct last-element index patterns (`array[array.length - 1]`).

Syntactically similar alternatives are intentionally out of scope unless they preserve the same AST shape.

## What this rule reports

This rule reports direct `receiver[receiver.length - 1]` access sites that can be safely replaced with `arrayLast(receiver)`.

- Direct last-element index patterns (`array[array.length - 1]`).

## Why this rule exists

`arrayLast` makes last-element access explicit and keeps type inference behavior consistent with other `ts-extras` array helpers.

- Last-element access is easier to audit in large codebases.
- Tuple/readonly array access patterns are standardized.
- Helper-driven access reduces repeated inline index arithmetic.

## ❌ Incorrect

```ts
const last = values[values.length - 1];
```

## ✅ Correct

```ts
const last = arrayLast(values);
```

## Behavior and migration notes

- Runtime behavior matches `array[array.length - 1]`.
- Empty arrays still produce `undefined`.
- Equivalent index expressions with extra wrappers should be reviewed manually during migration.

## Additional examples

### ❌ Incorrect — Additional example

```ts
const last = rows[rows.length - 1];
```

### ✅ Correct — Additional example

```ts
const last = arrayLast(rows);
```

### ✅ Correct — Repository-wide usage

```ts
const lastStep = arrayLast(steps);
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-ts-extras-array-last": "error",
        },
    },
];
```

## When not to use it

Disable this rule if direct index expressions are mandated by local style rules.

## Package documentation

ts-extras package documentation:

Source file: [`source/array-last.ts`](https://github.com/sindresorhus/ts-extras/blob/main/source/array-last.ts)

````ts
/**
Return the last item of an array with stronger typing for tuples.

This provides better type safety than `array[array.length - 1]` or `array.at(-1)`.

@example
```
import {arrayLast} from 'ts-extras';

const tuple = ['abc', 123, true] as const;
const last = arrayLast(tuple);
//=> true
//   ^? true

const array = ['a', 'b', 'c'];
const maybeLast = arrayLast(array);
//=> 'c'
//   ^? string | undefined

// Empty arrays
const empty: string[] = [];
const noLast = arrayLast(empty);
//=> undefined
//   ^? string | undefined
```

@category Improved builtin
*/
````

> **Rule catalog ID:** R009

## Further reading

- [`ts-extras` README](https://github.com/sindresorhus/ts-extras)
- [`ts-extras` package reference](https://www.npmjs.com/package/ts-extras)
- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
