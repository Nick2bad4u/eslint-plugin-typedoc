# prefer-ts-extras-is-equal-type

Prefer [`isEqualType`](https://github.com/sindresorhus/ts-extras/blob/main/source/is-equal-type.ts) from `ts-extras` over `IsEqual<T, U>` boolean assertion variables.

## Targeted pattern scope

This rule targets one assertion pattern: `IsEqual<T, U>` variables initialized with literal `true`/`false`, and rewrites them to `isEqualType<T, U>()`.

The focus is narrow on assertion-style declarations so migration stays deterministic and avoids changing unrelated type aliases.

## What this rule reports

This rule intentionally targets a narrow assertion pattern:

- Variables typed as `IsEqual<T, U>` and initialized with boolean literals (`true`/`false`).
- Namespace-qualified `type-fest` forms such as `TypeFest.IsEqual<T, U>`.

### Detection boundaries

- ✅ Reports `const x: IsEqual<A, B> = true`.
- ✅ Reports namespace imports (`TypeFest.IsEqual<A, B>`).
- ❌ Does not report type aliases (`type X = IsEqual<A, B>`).
- ❌ Does not report variables initialized from expressions (`someCondition`) instead of boolean literals.

## Why this rule exists

`isEqualType<T, U>()` expresses compile-time type equality checks for assertion-style code and avoids manual boolean literal scaffolding.

This makes test/fixture code easier to scan because type assertions look like
explicit calls instead of pseudo-runtime constants.

## ❌ Incorrect

```ts
import type { IsEqual } from "type-fest";

const typeCheck: IsEqual<Foo, Bar> = true;
```

## ✅ Correct

```ts
import { isEqualType } from "ts-extras";

const typeCheck = isEqualType<Foo, Bar>();
```

## Behavior and migration notes

- Reported declarations are compile-time assertions; they are not runtime equality checks.
- `isEqualType<T, U>()` keeps assertion intent while removing manual boolean literal scaffolding.
- Expression-initialized `IsEqual<T, U>` variables are intentionally out of scope for this rule.

## Additional examples

### ❌ Incorrect — Additional example

```ts
import type * as TypeFest from "type-fest";

const dtoMatchesModel: TypeFest.IsEqual<UserDto, UserModel> = true;
```

### ✅ Correct — Additional example

```ts
import { isEqualType } from "ts-extras";

const dtoMatchesModel = isEqualType<UserDto, UserModel>();
```

### ✅ Correct — Repository-wide usage

```ts
const idsAreEqual = isEqualType<Id, string>();
const payloadsAreEqual = isEqualType<ApiPayload, InternalPayload>();
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-ts-extras-is-equal-type": "error",
        },
    },
];
```

## When not to use it

Disable this rule if your project prefers `type-fest` assertion types directly in declarations and does not want function-form assertion helpers.

## Package documentation

ts-extras package documentation:

Source file: [`source/is-equal-type.ts`](https://github.com/sindresorhus/ts-extras/blob/main/source/is-equal-type.ts)

````ts
/**
Check if two types are equal at compile time.

Returns a boolean type (`true` or `false`) at compile time based on whether the types are equal.
At runtime, this returns nothing (`void`) since it's purely a compile-time utility.

@example
```
import {isEqualType} from 'ts-extras';

// Type-level comparison
const result1 = isEqualType<string, string>(); // Type: true
const result2 = isEqualType<string, number>(); // Type: false

// Value-level comparison
const string1 = 'hello';
const string2 = 'world';
const number = 42;
const result3 = isEqualType(string1, string2); // Type: true (both strings)
const result4 = isEqualType(string1, number);  // Type: false (different types)
```

@note The runtime value is `void`. This function is designed for compile-time type checking only, not runtime behavior.

@category Type guard
*/
````

> **Rule catalog ID:** R017

## Further reading

- [`ts-extras` README](https://github.com/sindresorhus/ts-extras)
- [`ts-extras` package reference](https://www.npmjs.com/package/ts-extras)
- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
