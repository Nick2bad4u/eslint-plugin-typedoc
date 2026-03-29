/**
 * @packageDocumentation
 * Shared fixtures for `prefer-type-fest-literal-union` tests.
 */

import { readTypedFixture } from "./typed-rule-tester";

export const validFixtureName = "prefer-type-fest-literal-union.valid.ts";
export const invalidFixtureName = "prefer-type-fest-literal-union.invalid.ts";
export const inlineInvalidBigIntLiteralUnionCode =
    "type SessionNonce = bigint | 1n;";
export const inlineInvalidBooleanLiteralUnionCode =
    "type FeatureFlag = true | false | boolean;";
export const inlineInvalidNumberLiteralUnionCode =
    "type HttpCode = 200 | 404 | number;";
export const inlineInvalidWithoutFixCode =
    "type EnvironmentName = 'dev' | 'prod' | string;";
export const shadowedReplacementNameInvalidCode =
    "type Wrapper<LiteralUnion> = 'dev' | 'prod' | string;";
export const inlineInvalidBigIntLiteralUnionOutputCode: string = [
    'import type { LiteralUnion } from "type-fest";',
    "type SessionNonce = LiteralUnion<1n, bigint>;",
].join("\n");
export const inlineInvalidBooleanLiteralUnionOutputCode: string = [
    'import type { LiteralUnion } from "type-fest";',
    "type FeatureFlag = LiteralUnion<true | false, boolean>;",
].join("\n");
export const inlineInvalidNumberLiteralUnionOutputCode: string = [
    'import type { LiteralUnion } from "type-fest";',
    "type HttpCode = LiteralUnion<200 | 404, number>;",
].join("\n");
export const inlineInvalidWithoutFixOutputCode: string = [
    'import type { LiteralUnion } from "type-fest";',
    "type EnvironmentName = LiteralUnion<'dev' | 'prod', string>;",
].join("\n");

export const invalidFixtureCode: string = readTypedFixture(invalidFixtureName);

const replaceOrThrow = ({
    replacement,
    sourceText,
    target,
}: Readonly<{
    replacement: string;
    sourceText: string;
    target: string;
}>): string => {
    const replacedText = sourceText.replace(target, replacement);

    if (replacedText === sourceText) {
        throw new TypeError(
            `Expected literal-union fixture text to contain replaceable segment: ${target}`
        );
    }

    return replacedText;
};

const buildFixtureFixableOutputCode = (): string =>
    `import type { LiteralUnion } from "type-fest";\n${replaceOrThrow({
        replacement: 'LiteralUnion<"dev" | "prod", string>',
        sourceText: invalidFixtureCode,
        target: '"dev" | "prod" | string',
    })}`;

export const fixtureFixableOutputCode: string = buildFixtureFixableOutputCode();

export const fixtureFixableSecondPassOutputCode: string = replaceOrThrow({
    replacement: "LiteralUnion<200 | 404, number>",
    sourceText: fixtureFixableOutputCode,
    target: "200 | 404 | number",
});

export const inlineFixableCode: string = [
    'import type { LiteralUnion } from "type-fest";',
    "",
    "type EnvironmentName = 'dev' | 'prod' | string;",
].join("\n");
export const inlineFixableOutput: string = [
    'import type { LiteralUnion } from "type-fest";',
    "",
    "type EnvironmentName = LiteralUnion<'dev' | 'prod', string>;",
].join("\n");
export const inlineFixableBooleanCode: string = [
    'import type { LiteralUnion } from "type-fest";',
    "",
    "type FeatureFlag = true | false | boolean;",
].join("\n");
export const inlineFixableBooleanOutput: string = [
    'import type { LiteralUnion } from "type-fest";',
    "",
    "type FeatureFlag = LiteralUnion<true | false, boolean>;",
].join("\n");
export const inlineFixableNumberCode: string = [
    'import type { LiteralUnion } from "type-fest";',
    "",
    "type HttpCode = 200 | 404 | number;",
].join("\n");
export const inlineFixableNumberOutput: string = [
    'import type { LiteralUnion } from "type-fest";',
    "",
    "type HttpCode = LiteralUnion<200 | 404, number>;",
].join("\n");
export const inlineFixableSingleLiteralStringCode: string = [
    'import type { LiteralUnion } from "type-fest";',
    "",
    "type EnvironmentName = 'dev' | string;",
].join("\n");
export const inlineFixableSingleLiteralStringOutput: string = [
    'import type { LiteralUnion } from "type-fest";',
    "",
    "type EnvironmentName = LiteralUnion<'dev', string>;",
].join("\n");
export const inlineFixableBigIntCode: string = [
    'import type { LiteralUnion } from "type-fest";',
    "",
    "type SessionNonce = bigint | 1n;",
].join("\n");
export const inlineFixableBigIntOutput: string = [
    'import type { LiteralUnion } from "type-fest";',
    "",
    "type SessionNonce = LiteralUnion<1n, bigint>;",
].join("\n");
export const inlineFixableSingleLiteralBooleanCode: string = [
    'import type { LiteralUnion } from "type-fest";',
    "",
    "type FeatureFlag = true | boolean;",
].join("\n");
export const inlineFixableSingleLiteralBooleanOutput: string = [
    'import type { LiteralUnion } from "type-fest";',
    "",
    "type FeatureFlag = LiteralUnion<true, boolean>;",
].join("\n");
export const inlineFixableSingleLiteralNumberCode: string = [
    'import type { LiteralUnion } from "type-fest";',
    "",
    "type HttpCode = 200 | number;",
].join("\n");
export const inlineFixableSingleLiteralNumberOutput: string = [
    'import type { LiteralUnion } from "type-fest";',
    "",
    "type HttpCode = LiteralUnion<200, number>;",
].join("\n");
export const mixedFamilyUnionValidCode =
    "type EnvironmentName = 'dev' | number | string;";
export const literalOnlyUnionValidCode =
    "type EnvironmentName = 'dev' | 'prod';";
export const literalOnlyBooleanUnionValidCode =
    "type FeatureFlag = true | false;";
export const literalOnlyBigIntUnionValidCode = "type SessionNonce = 1n | 2n;";
export const mixedLiteralFamiliesValidCode =
    "type Marker = true | 'dev' | string;";
export const keywordOnlyStringUnionValidCode =
    "type EnvironmentName = string | string;";
export const keywordOnlyNumberUnionValidCode =
    "type HttpCode = number | number;";
export const keywordOnlyBooleanUnionValidCode =
    "type FeatureFlag = boolean | boolean;";
export const keywordOnlyBigIntUnionValidCode =
    "type SessionNonce = bigint | bigint;";
export const literalAndTypeReferenceUnionValidCode =
    "type EnvironmentName = 'dev' | CustomAlias | string;";
export const mismatchedBigIntLiteralFamilyValidCode =
    "type SessionNonce = bigint | 1 | 2;";
export const keywordLiteralCrossFamilyValidCode =
    "type SessionToken = string | 1;";
export const templateLiteralAndStringKeywordValidCode =
    "type EnvironmentName = `dev` | string;";
