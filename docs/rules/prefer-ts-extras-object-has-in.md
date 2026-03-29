# prefer-ts-extras-object-has-in

Require [`objectHasIn`](https://github.com/sindresorhus/ts-extras/blob/main/source/object-has-in.ts) from `ts-extras` over `Reflect.has()`.

## Targeted pattern scope

This rule only matches direct `Reflect.has(object, key)` calls where both arguments can be forwarded unchanged to `objectHasIn(object, key)`.

- `Reflect.has(object, key)` calls.

Syntactically similar alternatives are intentionally out of scope unless they preserve the same AST shape.

## What this rule reports

This rule reports `Reflect.has(object, key)` calls that can be replaced with `objectHasIn(object, key)`.

- `Reflect.has(object, key)` calls.

## Why this rule exists

`objectHasIn()` provides stronger TypeScript narrowing for key-existence checks while preserving inherited-property semantics.

- Use this when inherited members should count as present.
- Reduces cast-heavy follow-up property access.
- Keeps prototype-aware checks consistent across modules.

## ❌ Incorrect

```ts
if (Reflect.has(record, key)) {
    console.log(record[key as keyof typeof record]);
}
```

## ✅ Correct

```ts
if (objectHasIn(record, key)) {
    console.log(record[key]);
}
```

## Behavior and migration notes

- Runtime semantics align with `Reflect.has` and `key in object` (prototype chain included).
- Prefer `objectHasOwn` if inherited members should be excluded.
- For security-sensitive payload validation, confirm that inherited properties are acceptable.

## Additional examples

### ❌ Incorrect — Additional example

```ts
if (Reflect.has(input, "name")) {
    console.log((input as { name: unknown }).name);
}
```

### ✅ Correct — Additional example

```ts
if (objectHasIn(input, "name")) {
    console.log(input.name);
}
```

### ✅ Correct — Repository-wide usage

```ts
const canAccess = objectHasIn(candidate, key);
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-ts-extras-object-has-in": "error",
        },
    },
];
```

## When not to use it

Disable this rule if checks must be own-property-only, or if runtime helper dependencies are disallowed in your environment.

## Package documentation

ts-extras package documentation:

Source file: [`source/object-has-in.ts`](https://github.com/sindresorhus/ts-extras/blob/main/source/object-has-in.ts)

````ts
/**
Check if an object has a property (including inherited) and narrow the object type.

This function performs __object narrowing__ - it adds the checked property to the object's type, allowing safe property access. Uses the `in` operator to check the entire prototype chain.

Unlike `objectHasOwn` (own properties only) and `keyIn` (key narrowing), this narrows the _object_ type to include inherited properties.

@example
```
import {objectHasIn} from 'ts-extras';

const data: unknown = {foo: 1};

if (objectHasIn(data, 'foo')) {
    // `data` is now: unknown & {foo: unknown}
    console.log(data.foo); // Safe access
}

// Also checks prototype chain
if (objectHasIn(data, 'toString')) {
    // `data` is now: unknown & {toString: unknown}
    console.log(data.toString); // Safe access to inherited method
}
```

@note This uses the `in` operator and checks the entire prototype chain, but blocks `__proto__` and `constructor` for security.

@category Type guard
*/
````

> **Rule catalog ID:** R028

## Further reading

- [`ts-extras` README](https://github.com/sindresorhus/ts-extras)
- [`ts-extras` package reference](https://www.npmjs.com/package/ts-extras)
- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
