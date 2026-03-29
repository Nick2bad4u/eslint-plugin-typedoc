/**
 * @packageDocumentation
 * Shared code fixtures for `prefer-ts-extras-is-infinite` tests.
 */

export const validFixtureName = "prefer-ts-extras-is-infinite.valid.ts";
export const invalidFixtureName = "prefer-ts-extras-is-infinite.invalid.ts";

export const inlineInvalidPositiveInfinityCode: string = [
    "declare const metric: number;",
    "",
    "const isInfiniteMetric = metric == Number.POSITIVE_INFINITY;",
    "",
    "String(isInfiniteMetric);",
].join("\n");

export const inlineInvalidLeftInfinityCode: string = [
    "declare const metric: number;",
    "",
    "const isInfiniteMetric = Infinity === metric;",
    "",
    "String(isInfiniteMetric);",
].join("\n");

export const inlineValidNonEqualityOperatorCode: string = [
    "declare const metric: number;",
    "",
    "const isInfiniteMetric = metric > Infinity;",
    "",
    "String(isInfiniteMetric);",
].join("\n");

export const inlineValidWithoutInfinityReferenceCode: string = [
    "declare const metric: number;",
    "declare const fallbackMetric: number;",
    "",
    "const hasSameMetric = metric === fallbackMetric;",
    "",
    "String(hasSameMetric);",
].join("\n");

export const inlineValidComputedInfinityMemberCode: string = [
    "declare const metric: number;",
    "",
    'const isInfiniteMetric = metric === Number["POSITIVE_INFINITY"];',
    "",
    "String(isInfiniteMetric);",
].join("\n");

export const inlineValidOtherObjectInfinityMemberCode: string = [
    "declare const metric: number;",
    "",
    "const isInfiniteMetric = metric === Math.POSITIVE_INFINITY;",
    "",
    "String(isInfiniteMetric);",
].join("\n");

export const inlineValidNonInfinityNumberPropertyCode: string = [
    "declare const metric: number;",
    "",
    "const isInfiniteMetric = metric === Number.MAX_VALUE;",
    "",
    "String(isInfiniteMetric);",
].join("\n");

export const inlineValidShadowedInfinityBindingCode: string = [
    "declare const metric: number;",
    "const Infinity = Number.NaN;",
    "",
    "const isInfiniteMetric = metric === Infinity;",
    "",
    "String(isInfiniteMetric);",
].join("\n");

export const inlineValidShadowedNumberBindingCode: string = [
    "declare const metric: number;",
    "const Number = { POSITIVE_INFINITY: 1, NEGATIVE_INFINITY: -1 };",
    "",
    "const isInfiniteMetric = metric === Number.POSITIVE_INFINITY;",
    "",
    "String(isInfiniteMetric);",
].join("\n");

export const inlineFixableDualSignCode: string = [
    'import { isInfinite } from "ts-extras";',
    "",
    "declare const metric: number;",
    "",
    "const isInfiniteMetric = metric === Number.POSITIVE_INFINITY || metric === Number.NEGATIVE_INFINITY;",
    "",
    "String(isInfiniteMetric);",
].join("\n");

export const inlineFixableDualSignOutput: string = [
    'import { isInfinite } from "ts-extras";',
    "",
    "declare const metric: number;",
    "",
    "const isInfiniteMetric = isInfinite(metric);",
    "",
    "String(isInfiniteMetric);",
].join("\n");

export const inlineFixableInfinityIdentifierDualSignCode: string = [
    'import { isInfinite } from "ts-extras";',
    "",
    "declare const metric: number;",
    "",
    "const isInfiniteMetric = Infinity === metric || Number.NEGATIVE_INFINITY === metric;",
    "",
    "String(isInfiniteMetric);",
].join("\n");

export const inlineFixableInfinityIdentifierDualSignOutput: string = [
    'import { isInfinite } from "ts-extras";',
    "",
    "declare const metric: number;",
    "",
    "const isInfiniteMetric = isInfinite(metric);",
    "",
    "String(isInfiniteMetric);",
].join("\n");

export const inlineInvalidMixedStrictnessDualSignCode: string = [
    "declare const metric: number;",
    "",
    "const isInfiniteMetric = metric == Number.POSITIVE_INFINITY || metric === Number.NEGATIVE_INFINITY;",
    "",
    "String(isInfiniteMetric);",
].join("\n");

export const inlineInvalidSameSignStrictDisjunctionCode: string = [
    "declare const metric: number;",
    "",
    "const isInfiniteMetric = metric === Number.POSITIVE_INFINITY || metric === Infinity;",
    "",
    "String(isInfiniteMetric);",
].join("\n");

export const inlineInvalidDifferentComparedExpressionsCode: string = [
    "declare const firstMetric: number;",
    "declare const secondMetric: number;",
    "",
    "const isInfiniteMetric = firstMetric === Number.POSITIVE_INFINITY || secondMetric === Number.NEGATIVE_INFINITY;",
    "",
    "String(isInfiniteMetric);",
].join("\n");

export const inlineInvalidLogicalAndDualSignCode: string = [
    "declare const metric: number;",
    "",
    "const isInfiniteMetric = metric === Number.POSITIVE_INFINITY && metric === Number.NEGATIVE_INFINITY;",
    "",
    "String(isInfiniteMetric);",
].join("\n");

export const inlineInvalidMathNegativeInfinityDisjunctionCode: string = [
    "declare const metric: number;",
    "",
    "const isInfiniteMetric = metric === Number.POSITIVE_INFINITY || metric === Math.NEGATIVE_INFINITY;",
    "",
    "String(isInfiniteMetric);",
].join("\n");

export const inlineParenthesizedDisjunctionCode: string = [
    'import { isInfinite } from "ts-extras";',
    "",
    "const metric = Number.POSITIVE_INFINITY;",
    "const hasInfiniteMetric =",
    "    (metric) === Number.POSITIVE_INFINITY ||",
    "    Number.NEGATIVE_INFINITY === metric;",
    "String(hasInfiniteMetric);",
].join("\n");

export const inlineParenthesizedDisjunctionOutput: string = [
    'import { isInfinite } from "ts-extras";',
    "",
    "const metric = Number.POSITIVE_INFINITY;",
    "const hasInfiniteMetric =",
    "    isInfinite(metric);",
    "String(hasInfiniteMetric);",
].join("\n");
