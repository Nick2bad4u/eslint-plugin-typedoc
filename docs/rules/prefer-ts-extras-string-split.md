# prefer-ts-extras-string-split

Prefer [`stringSplit`](https://github.com/sindresorhus/ts-extras/blob/main/source/string-split.ts) from `ts-extras` over `string.split(...)`.

`stringSplit(...)` can preserve stronger tuple-like inference for literal separators.

## Targeted pattern scope

This rule focuses on direct `string.split(separator)` calls that can be migrated to `stringSplit(string, separator)` with deterministic fixes.

- `string.split(separator)` call sites that can use `stringSplit(string, separator)`.

Alias indirection, wrapper helpers, and non-canonical call shapes are excluded to keep `stringSplit(string, separator)` migrations safe.

## What this rule reports

This rule reports `string.split(separator)` call sites when `stringSplit(string, separator)` is the intended replacement.

- `string.split(separator)` call sites that can use `stringSplit(string, separator)`.

## Why this rule exists

`stringSplit` standardizes string tokenization and can preserve stronger typing for literal separators and known string shapes.

- Split usage follows one helper style across modules.
- Destructuring from split results is easier to type in strict code.
- Native/helper split styles are not mixed.

## ❌ Incorrect

```ts
const parts = monitorKey.split(":");
```

## ✅ Correct

```ts
const parts = stringSplit(monitorKey, ":");
```

## Behavior and migration notes

- Runtime behavior matches native `String.prototype.split`.
- Separator semantics (string/regex, limits) are preserved.
- Literal-based tuple inference depends on the source string and separator types.

## Additional examples

### ❌ Incorrect — Additional example

```ts
const [major, minor] = version.split(".");
```

### ✅ Correct — Additional example

```ts
const [major, minor] = stringSplit(version, ".");
```

### ✅ Correct — Repository-wide usage

```ts
const pathParts = stringSplit(route, "/");
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-ts-extras-string-split": "error",
        },
    },
];
```

## When not to use it

Disable this rule if your code style standardizes on direct `.split()` usage.

## Package documentation

ts-extras package documentation:

Source file: [`source/string-split.ts`](https://github.com/sindresorhus/ts-extras/blob/main/source/string-split.ts)

````ts
/**
A strongly-typed version of `String#split()` that returns a tuple for literal strings.

@example
```
import {stringSplit} from 'ts-extras';

const parts = stringSplit('foo-bar-baz', '-');
//=> ['foo', 'bar', 'baz']
//   ^? ['foo', 'bar', 'baz']

const [first, second] = stringSplit('top-left', '-');
//=> first: 'top', second: 'left'

const placement = 'top-start' as const;
const side = stringSplit(placement, '-')[0];
//=> 'top'
//   ^? 'top'

// Dynamic strings return string[]
const dynamic: string = 'a-b-c';
const dynamicParts = stringSplit(dynamic, '-');
//=> string[]
```

@category Improved builtin
*/
````

> **Rule catalog ID:** R034

## Further reading

- [`ts-extras` README](https://github.com/sindresorhus/ts-extras)
- [`ts-extras` package reference](https://www.npmjs.com/package/ts-extras)
- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
