/**
 * @packageDocumentation
 * Shared code fixtures for `prefer-ts-extras-set-has` tests.
 */

export const validFixtureName = "prefer-ts-extras-set-has.valid.ts";
export const invalidFixtureName = "prefer-ts-extras-set-has.invalid.ts";

export const computedAccessValidCode: string = [
    "const values = new Set([1, 2, 3]);",
    'const hasValue = values["has"](2);',
    "String(hasValue);",
].join("\n");

export const nonSetReceiverValidCode: string = [
    "const helper = {",
    "    has(value: number): boolean {",
    "        return value === 1;",
    "    },",
    "};",
    "const hasValue = helper.has(1);",
    "String(hasValue);",
].join("\n");

export const setDifferentMethodValidCode: string = [
    "const values = new Set([1, 2, 3]);",
    "values.clear();",
    "String(values.size);",
].join("\n");

export const unionSetInvalidCode: string = [
    "const values: Set<number> | ReadonlySet<number> = new Set([1, 2]);",
    "const hasValue = values.has(2);",
    "String(hasValue);",
].join("\n");

export const readonlySetInvalidCode: string = [
    "const values: ReadonlySet<number> = new Set([1, 2]);",
    "const hasValue = values.has(2);",
    "String(hasValue);",
].join("\n");

export const readonlySetInvalidOutput: string = [
    'import { setHas } from "ts-extras";',
    "const values: ReadonlySet<number> = new Set([1, 2]);",
    "const hasValue = setHas(values, 2);",
    "String(hasValue);",
].join("\n");

export const unionSetInvalidOutput: string = [
    'import { setHas } from "ts-extras";',
    "const values: Set<number> | ReadonlySet<number> = new Set([1, 2]);",
    "const hasValue = setHas(values, 2);",
    "String(hasValue);",
].join("\n");

export const mixedUnionValidCode: string = [
    "declare const values: Set<number> | Map<number, number>;",
    "const hasValue = values.has(2);",
    "String(hasValue);",
].join("\n");

export const reversedMixedUnionValidCode: string = [
    "declare const values: Map<number, number> | Set<number>;",
    "const hasValue = values.has(2);",
    "String(hasValue);",
].join("\n");

export const declaredUnionSetInvalidCode: string = [
    "declare const values: Set<number> | ReadonlySet<number>;",
    "const hasValue = values.has(2);",
    "String(hasValue);",
].join("\n");

export const declaredUnionSetInvalidOutput: string = [
    'import { setHas } from "ts-extras";',
    "declare const values: Set<number> | ReadonlySet<number>;",
    "const hasValue = setHas(values, 2);",
    "String(hasValue);",
].join("\n");

export const inlineFixableCode: string = [
    'import { setHas } from "ts-extras";',
    "",
    "const values = new Set([1, 2, 3]);",
    "const hasValue = values.has(2);",
].join("\n");

export const inlineFixableOutput: string = [
    'import { setHas } from "ts-extras";',
    "",
    "const values = new Set([1, 2, 3]);",
    "const hasValue = setHas(values, 2);",
].join("\n");
