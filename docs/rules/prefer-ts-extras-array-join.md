# prefer-ts-extras-array-join

Prefer [`arrayJoin`](https://github.com/sindresorhus/ts-extras/blob/main/source/array-join.ts) from `ts-extras` over `array.join(...)`.

`arrayJoin(...)` can preserve stronger tuple-aware typing when joining array values.

## Targeted pattern scope

This rule focuses on direct `array.join(separator)` calls that can be migrated to `arrayJoin(array, separator)` with deterministic fixes.

- `array.join(separator)` call sites that can use `arrayJoin(array, separator)`.

Alias indirection, wrapper helpers, and non-canonical call shapes are excluded to keep `arrayJoin(array, separator)` migrations safe.

## What this rule reports

This rule reports `array.join(separator)` call sites when `arrayJoin(array, separator)` is the intended replacement.

- `array.join(separator)` call sites that can use `arrayJoin(array, separator)`.

## Why this rule exists

`arrayJoin` keeps string assembly consistent and can preserve stronger string typing when arrays and separators are literals.

- Join operations use one helper style across modules.
- Literal-based join results are inferred more precisely in typed utilities.
- Join-heavy code paths avoid mixed native/helper patterns.

## ❌ Incorrect

```ts
const key = segments.join(":");
```

## ✅ Correct

```ts
const key = arrayJoin(segments, ":");
```

## Behavior and migration notes

- Runtime behavior matches native `Array.prototype.join`.
- Missing separator still defaults to `","`.
- `null` and `undefined` entries are converted to empty strings, matching native behavior.

## Additional examples

### ❌ Incorrect — Additional example

```ts
const route = segments.join("/");
```

### ✅ Correct — Additional example

```ts
const route = arrayJoin(segments, "/");
```

### ✅ Correct — Repository-wide usage

```ts
const csv = arrayJoin(columns, ",");
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-ts-extras-array-join": "error",
        },
    },
];
```

## When not to use it

Disable this rule if your codebase requires native `.join()` for API consistency.

## Package documentation

ts-extras package documentation:

Source file: [`source/array-join.ts`](https://github.com/sindresorhus/ts-extras/blob/main/source/array-join.ts)

````ts
/**
A strongly-typed version of `Array#join()` that preserves literal string types.

The built-in `Array#join()` always returns `string`, losing type information. This function returns a properly-typed template literal when given a tuple of literals.

@example
```
import {arrayJoin} from 'ts-extras';

// Literal types are preserved automatically
const joined = arrayJoin(['foo', 'bar', 'baz'], '-');
//=> 'foo-bar-baz'
//   ^? 'foo-bar-baz'

const dotPath = arrayJoin(['a', 'b', 'c'], '.');
//=> 'a.b.c'
//   ^? 'a.b.c'

// Dynamic arrays return string
const dynamic: string[] = ['a', 'b'];
const dynamicJoined = arrayJoin(dynamic, '-');
//=> string
```

@category Improved builtin
*/
````

> **Rule catalog ID:** R008

## Further reading

- [`ts-extras` README](https://github.com/sindresorhus/ts-extras)
- [`ts-extras` package reference](https://www.npmjs.com/package/ts-extras)
- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
