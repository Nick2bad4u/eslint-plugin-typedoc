/**
 * @packageDocumentation
 * Shared code fixtures for `prefer-type-fest-arrayable` tests.
 */

export const validFixtureName = "prefer-type-fest-arrayable.valid.ts";
export const invalidFixtureName = "prefer-type-fest-arrayable.invalid.ts";

export const inlineInvalidCode = "type QueryValue = string | string[];";
export const inlineInvalidReversedCode = "type QueryValue = string[] | string;";
export const inlineInvalidReadonlyArrayCode =
    "type QueryValue = string | readonly string[];";
export const inlineInvalidGenericArrayCode =
    "type QueryValue = string | Array<string>;";
export const inlineInvalidGenericArrayReversedCode =
    "type QueryValue = Array<string> | string;";
export const inlineInvalidWhitespaceNormalizedGenericArrayCode =
    "type QueryValue = Map < string , number > | Array<Map<string, number>>;";
export const inlineInvalidWhitespaceNormalizedGenericArrayReversedCode =
    "type QueryValue = Array<Map < string , number >> | Map<string, number>;";

export const nonMatchingUnionValidCode = "type QueryValue = string | number[];";
export const singleTypeValidCode = "type QueryValue = string;";
export const threeMemberUnionValidCode =
    "type QueryValue = string | string[] | null;";
export const genericArrayMissingTypeArgumentValidCode =
    "type QueryValue = string | Array;";
export const genericArrayExtraTypeArgumentValidCode =
    "type QueryValue = string | Array<string, number>;";
export const genericArrayMismatchedElementValidCode =
    "type QueryValue = string | Array<number>;";
export const reversedGenericArrayMismatchedElementValidCode =
    "type QueryValue = Array<number> | string;";
export const qualifiedGenericArrayValidCode =
    "type QueryValue = string | globalThis.Array<string>;";
export const nonArrayGenericMatchingElementValidCode: string = [
    "type Box<T> = T;",
    "type QueryValue = string | Box<string>;",
].join("\n");
export const bothMembersAreNativeArraysValidCode =
    "type QueryValue = string[] | string[];";

export const inlineFixableCode: string = [
    'import type { Arrayable } from "type-fest";',
    "",
    "type QueryValue = string | string[];",
].join("\n");

export const inlineFixableOutput: string = [
    'import type { Arrayable } from "type-fest";',
    "",
    "type QueryValue = Arrayable<string>;",
].join("\n");

export const inlineGenericFixableCode: string = [
    'import type { Arrayable } from "type-fest";',
    "",
    "type QueryValue = string | Array<string>;",
].join("\n");

export const inlineGenericFixableOutput: string = [
    'import type { Arrayable } from "type-fest";',
    "",
    "type QueryValue = Arrayable<string>;",
].join("\n");

export const inlineGenericFixableReversedCode: string = [
    'import type { Arrayable } from "type-fest";',
    "",
    "type QueryValue = Array<string> | string;",
].join("\n");

export const inlineGenericFixableReversedOutput: string = [
    'import type { Arrayable } from "type-fest";',
    "",
    "type QueryValue = Arrayable<string>;",
].join("\n");

export const inlineInvalidOutputCode: string = [
    'import type { Arrayable } from "type-fest";',
    "type QueryValue = Arrayable<string>;",
].join("\n");

export const inlineInvalidReversedOutputCode: string = [
    'import type { Arrayable } from "type-fest";',
    "type QueryValue = Arrayable<string>;",
].join("\n");

export const inlineInvalidGenericArrayOutputCode: string = [
    'import type { Arrayable } from "type-fest";',
    "type QueryValue = Arrayable<string>;",
].join("\n");

export const inlineInvalidGenericArrayReversedOutputCode: string = [
    'import type { Arrayable } from "type-fest";',
    "type QueryValue = Arrayable<string>;",
].join("\n");

export const inlineInvalidWhitespaceNormalizedGenericArrayOutputCode: string = [
    'import type { Arrayable } from "type-fest";',
    "type QueryValue = Arrayable<Map < string , number >>;",
].join("\n");

export const inlineInvalidWhitespaceNormalizedGenericArrayReversedOutputCode: string =
    [
        'import type { Arrayable } from "type-fest";',
        "type QueryValue = Arrayable<Map<string, number>>;",
    ].join("\n");
