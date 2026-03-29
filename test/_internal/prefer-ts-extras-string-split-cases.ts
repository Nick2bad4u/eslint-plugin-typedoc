/**
 * @packageDocumentation
 * Shared code fixtures for `prefer-ts-extras-string-split` tests.
 */

export const validFixtureName = "prefer-ts-extras-string-split.valid.ts";
export const invalidFixtureName = "prefer-ts-extras-string-split.invalid.ts";

export const inlineInvalidCode: string = [
    "const value = 'a,b';",
    "const parts = value.split(',');",
    "String(parts);",
].join("\n");

export const inlineInvalidOutput: string = [
    'import { stringSplit } from "ts-extras";',
    "const value = 'a,b';",
    "const parts = stringSplit(value, ',');",
    "String(parts);",
].join("\n");

export const computedAccessValidCode: string = [
    "const value = 'a,b';",
    'const parts = value["split"](",");',
    "String(parts);",
].join("\n");

export const nonStringReceiverValidCode: string = [
    "const helper = {",
    "    split(separator: string): readonly string[] {",
    "        return [separator];",
    "    },",
    "};",
    "const parts = helper.split(',');",
    "String(parts);",
].join("\n");

export const differentStringMethodValidCode: string = [
    "const value = 'a,b';",
    "const normalized = value.toUpperCase();",
    "String(normalized);",
].join("\n");

export const unionStringInvalidCode: string = [
    "const value: 'a,b' | 'c,d' = 'a,b';",
    "const parts = value.split(',');",
    "String(parts);",
].join("\n");

export const unionStringInvalidOutput: string = [
    'import { stringSplit } from "ts-extras";',
    "const value: 'a,b' | 'c,d' = 'a,b';",
    "const parts = stringSplit(value, ',');",
    "String(parts);",
].join("\n");

export const mixedUnionInvalidCode: string = [
    "declare const value: string | { split(separator: string): readonly string[] };",
    "const parts = value.split(',');",
    "String(parts);",
].join("\n");

export const mixedUnionInvalidOutput: string = [
    'import { stringSplit } from "ts-extras";',
    "declare const value: string | { split(separator: string): readonly string[] };",
    "const parts = stringSplit(value, ',');",
    "String(parts);",
].join("\n");

export const declaredStringUnionInvalidCode: string = [
    "declare const value: string | String;",
    "const parts = value.split(',');",
    "String(parts);",
].join("\n");

export const declaredStringUnionInvalidOutput: string = [
    'import { stringSplit } from "ts-extras";',
    "declare const value: string | String;",
    "const parts = stringSplit(value, ',');",
    "String(parts);",
].join("\n");

export const declaredStringObjectInvalidCode: string = [
    "declare const value: String;",
    "const parts = value.split(',');",
    "String(parts);",
].join("\n");

export const declaredStringObjectInvalidOutput: string = [
    'import { stringSplit } from "ts-extras";',
    "declare const value: String;",
    "const parts = stringSplit(value, ',');",
    "String(parts);",
].join("\n");

export const intersectionStringInvalidCode: string = [
    "type BrandedString = string & { readonly __brand: 'BrandedString' };",
    "declare const value: BrandedString;",
    "const parts = value.split(',');",
    "String(parts);",
].join("\n");

export const intersectionStringInvalidOutput: string = [
    'import { stringSplit } from "ts-extras";',
    "type BrandedString = string & { readonly __brand: 'BrandedString' };",
    "declare const value: BrandedString;",
    "const parts = stringSplit(value, ',');",
    "String(parts);",
].join("\n");

export const inlineFixableCode: string = [
    'import { stringSplit } from "ts-extras";',
    "",
    "const value = 'a,b';",
    "const parts = value.split(',');",
].join("\n");

export const inlineFixableOutput: string = [
    'import { stringSplit } from "ts-extras";',
    "",
    "const value = 'a,b';",
    "const parts = stringSplit(value, ',');",
].join("\n");
