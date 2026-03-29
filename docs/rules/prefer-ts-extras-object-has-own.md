# prefer-ts-extras-object-has-own

Require [`objectHasOwn`](https://github.com/sindresorhus/ts-extras/blob/main/source/object-has-own.ts) from `ts-extras` over `Object.hasOwn` when checking own properties.

## Targeted pattern scope

This rule only matches direct `Object.hasOwn(object, key)` calls where both arguments can be forwarded unchanged to `objectHasOwn(object, key)`.

- Calls to `Object.hasOwn(...)` in runtime source files and typed rule fixtures.

Syntactically similar alternatives are intentionally out of scope unless they preserve the same AST shape.

## What this rule reports

This rule reports `Object.hasOwn(object, key)` calls that can be replaced with `objectHasOwn(object, key)`.

- Calls to `Object.hasOwn(...)` in runtime source files and typed rule fixtures.

## Why this rule exists

`objectHasOwn` is a type guard that narrows the object to include the checked property. This makes downstream access safer and reduces manual casts after own-property checks.

- Prefer this when you only want **own** properties.
- Avoids repetitive `(obj as { prop: ... }).prop` casts after checks.
- Makes guard intent explicit for reviewers.

## ❌ Incorrect

```ts
if (Object.hasOwn(record, key)) {
    console.log(record[key as keyof typeof record]);
}
```

## ✅ Correct

```ts
if (objectHasOwn(record, key)) {
    console.log(record[key]);
}
```

## Behavior and migration notes

- Runtime semantics align with `Object.hasOwn` (prototype chain is **not** considered).
- Useful for untrusted inputs where inherited members should not count.
- If your current code uses `Reflect.has` or `in`, confirm that own-only checks are acceptable before migration.

## Additional examples

### ❌ Incorrect — Additional example

```ts
if (Object.hasOwn(data, "id")) {
    console.log((data as { id: unknown }).id);
}
```

### ✅ Correct — Additional example

```ts
if (objectHasOwn(data, "id")) {
    console.log(data.id);
}
```

### ✅ Correct — Repository-wide usage

```ts
const isOwn = objectHasOwn(record, field);
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-ts-extras-object-has-own": "error",
        },
    },
];
```

## When not to use it

Disable this rule if you intentionally rely on prototype-chain checks (`in`/`Reflect.has`) or if runtime helper dependencies are disallowed in your environment.

## Package documentation

ts-extras package documentation:

Source file: [`source/object-has-own.ts`](https://github.com/sindresorhus/ts-extras/blob/main/source/object-has-own.ts)

````ts
/**
A strongly-typed version of `Object.hasOwn()` that narrows the object type.

This function performs __object narrowing__ for own properties only - it adds the checked property to the object's type, allowing safe property access. Does not check the prototype chain.

Unlike `objectHasIn` (includes inherited) and `keyIn` (key narrowing), this narrows the _object_ type to include only own properties.

@example
```
import {objectHasOwn} from 'ts-extras';

const data: unknown = {foo: 1};

if (objectHasOwn(data, 'foo')) {
    // `data` is now: unknown & {foo: unknown}
    console.log(data.foo); // Safe access to own property
}

objectHasOwn({}, 'toString');
//=> false (inherited property, not own)
```

@category Improved builtin
@category Type guard
*/
````

> **Rule catalog ID:** R029

## Further reading

- [`ts-extras` README](https://github.com/sindresorhus/ts-extras)
- [`ts-extras` package reference](https://www.npmjs.com/package/ts-extras)
- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
