# prefer-type-fest-required-deep

Require TypeFest [`RequiredDeep`](https://github.com/sindresorhus/type-fest/blob/main/source/required-deep.d.ts) over `DeepRequired` aliases.

## Targeted pattern scope

This rule reports `DeepRequired<T>` aliases and prefers `RequiredDeep<T>` for recursively required object shapes.

## What this rule reports

- Type references named `DeepRequired`.

### Detection boundaries

- ✅ Reports direct `DeepRequired<T>` references.
- ❌ Does not auto-fix where legacy aliases treat nullable leaves differently.

## Why this rule exists

`RequiredDeep<T>` is the canonical TypeFest utility for recursively requiring nested properties.

Using one utility name clarifies strict configuration and post-validation object contracts.

## ❌ Incorrect

```ts
type StrictConfig = DeepRequired<AppConfig>;
```

## ✅ Correct

```ts
import type { RequiredDeep } from "type-fest";

type StrictConfig = RequiredDeep<AppConfig>;
```

## Behavior and migration notes

- `RequiredDeep<T>` recursively removes optional modifiers from nested properties.
- Re-check generated API types if optionality was previously preserved in certain branches.
- Combine with validation/parsing phases before exposing strict internal types.

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-required-deep": "error",
        },
    },
];
```

## When not to use it

Disable this rule if your codebase intentionally standardizes `DeepRequired` naming instead of TypeFest.

## Package documentation

TypeFest package documentation:

Source file: [`source/required-deep.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/required-deep.d.ts)

````ts
/**
Create a type from another type with all keys and nested keys set to required.

Use-cases:
- Creating optional configuration interfaces where the underlying implementation still requires all options to be fully specified.
- Modeling the resulting type after a deep merge with a set of defaults.

@example
```
import type {RequiredDeep} from 'type-fest';

type Settings = {
    textEditor?: {
        fontSize?: number;
        fontColor?: string;
        fontWeight?: number | undefined;
    };
    autocomplete?: boolean;
    autosave?: boolean | undefined;
};

type RequiredSettings = RequiredDeep<Settings>;
//=> {
//     textEditor: {
//         fontSize: number;
//         fontColor: string;
//         fontWeight: number | undefined;
//     };
//     autocomplete: boolean;
//     autosave: boolean | undefined;
// }
```

Note that types containing overloaded functions are not made deeply required due to a [TypeScript limitation](https://github.com/microsoft/TypeScript/issues/29732).

@category Utilities
@category Object
@category Array
@category Set
@category Map
*/
````

> **Rule catalog ID:** R060

## Further reading

- [TypeFest README](https://github.com/sindresorhus/type-fest)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
