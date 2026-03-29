# prefer-type-fest-partial-deep

Require TypeFest [`PartialDeep`](https://github.com/sindresorhus/type-fest/blob/main/source/partial-deep.d.ts) over `DeepPartial` aliases.

## Targeted pattern scope

This rule reports `DeepPartial<T>` aliases and prefers `PartialDeep<T>` for recursive optional patch types.

## What this rule reports

- Type references named `DeepPartial`.

### Detection boundaries

- ✅ Reports direct `DeepPartial<T>` type references.
- ❌ Does not auto-fix where project-local aliases have non-TypeFest semantics.

## Why this rule exists

`PartialDeep<T>` is the canonical TypeFest utility for recursive optionality.

Using a single name for deep patch semantics makes update/persistence DTOs easier to audit.

## ❌ Incorrect

```ts
type Patch = DeepPartial<AppConfig>;
```

## ✅ Correct

```ts
import type { PartialDeep } from "type-fest";

type Patch = PartialDeep<AppConfig>;
```

## Behavior and migration notes

- `PartialDeep<T>` recursively marks nested properties optional.
- Validate parity if your legacy alias excluded arrays, maps, or sets.
- Prefer narrowing the patch surface with `Pick`/`Except` before applying deep optionality.

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-partial-deep": "error",
        },
    },
];
```

## When not to use it

Disable this rule if your codebase intentionally standardizes `DeepPartial` naming instead of TypeFest.

## Package documentation

TypeFest package documentation:

Source file: [`source/partial-deep.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/partial-deep.d.ts)

````ts
/**
Create a type from another type with all keys and nested keys set to optional.

Use-cases:
- Merging a default settings/config object with another object, the second object would be a deep partial of the default object.
- Mocking and testing complex entities, where populating an entire object with its keys would be redundant in terms of the mock or test.

@example
```
import type {PartialDeep} from 'type-fest';

let settings = {
    textEditor: {
        fontSize: 14,
        fontColor: '#000000',
        fontWeight: 400,
    },
    autocomplete: false,
    autosave: true,
};

const applySavedSettings = (savedSettings: PartialDeep<typeof settings>) => (
    {...settings, ...savedSettings, textEditor: {...settings.textEditor, ...savedSettings.textEditor}}
);

settings = applySavedSettings({textEditor: {fontWeight: 500}});
```

By default, this does not affect elements in array and tuple types. You can change this by passing `{recurseIntoArrays: true}` as the second type argument:

```
import type {PartialDeep} from 'type-fest';

type Shape = {
    dimensions: [number, number];
};

const partialShape: PartialDeep<Shape, {recurseIntoArrays: true}> = {
    dimensions: [], // OK
};

partialShape.dimensions = [15]; // OK
```

@see {@link PartialDeepOptions}

@category Object
@category Array
@category Set
@category Map
*/
````

> **Rule catalog ID:** R052

## Further reading

- [TypeFest README](https://github.com/sindresorhus/type-fest)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
