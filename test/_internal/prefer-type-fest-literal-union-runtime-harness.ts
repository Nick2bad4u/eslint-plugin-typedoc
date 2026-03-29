/**
 * @packageDocumentation
 * Property-based runtime harness helpers for `prefer-type-fest-literal-union` tests.
 */

import parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import fc from "fast-check";

export type GeneratedCrossFamilyCase = Readonly<{
    keywordFamily: LiteralUnionFamily;
    literalCase: GeneratedLiteralUnionCase;
}>;

export type GeneratedLiteralUnionCase = Readonly<{
    family: LiteralUnionFamily;
    literalMembers: readonly string[];
}>;

export type LiteralUnionFamily = "bigint" | "boolean" | "number" | "string";

const familyKeywordByFamily: Readonly<Record<LiteralUnionFamily, string>> = {
    bigint: "bigint",
    boolean: "boolean",
    number: "number",
    string: "string",
};

const generatedStringFamilyCaseArbitrary: fc.Arbitrary<GeneratedLiteralUnionCase> =
    fc
        .uniqueArray(fc.string({ maxLength: 6, minLength: 1 }), {
            maxLength: 3,
            minLength: 1,
        })
        .map(
            (members): GeneratedLiteralUnionCase => ({
                family: "string",
                literalMembers: members.map((member) => JSON.stringify(member)),
            })
        );

const generatedNumberFamilyCaseArbitrary: fc.Arbitrary<GeneratedLiteralUnionCase> =
    fc
        .uniqueArray(fc.integer({ max: 20, min: 0 }), {
            maxLength: 3,
            minLength: 1,
        })
        .map(
            (members): GeneratedLiteralUnionCase => ({
                family: "number",
                literalMembers: members.map(String),
            })
        );

const generatedBooleanFamilyCaseArbitrary: fc.Arbitrary<GeneratedLiteralUnionCase> =
    fc
        .uniqueArray(fc.boolean(), {
            maxLength: 2,
            minLength: 1,
        })
        .map(
            (members): GeneratedLiteralUnionCase => ({
                family: "boolean",
                literalMembers: members.map((member) =>
                    member ? "true" : "false"
                ),
            })
        );

const generatedBigIntFamilyCaseArbitrary: fc.Arbitrary<GeneratedLiteralUnionCase> =
    fc
        .uniqueArray(fc.bigInt({ max: 20n, min: 0n }), {
            maxLength: 3,
            minLength: 1,
        })
        .map(
            (members): GeneratedLiteralUnionCase => ({
                family: "bigint",
                literalMembers: members.map((member) => `${String(member)}n`),
            })
        );

export const generatedLiteralUnionCaseArbitrary: fc.Arbitrary<GeneratedLiteralUnionCase> =
    fc.oneof(
        generatedStringFamilyCaseArbitrary,
        generatedNumberFamilyCaseArbitrary,
        generatedBooleanFamilyCaseArbitrary,
        generatedBigIntFamilyCaseArbitrary
    );

export const generatedCrossFamilyCaseArbitrary: fc.Arbitrary<GeneratedCrossFamilyCase> =
    generatedLiteralUnionCaseArbitrary.chain((literalCase) => {
        const keywordFamilyArbitrary = (() => {
            switch (literalCase.family) {
                case "bigint": {
                    return fc.constantFrom("boolean", "number", "string");
                }

                case "boolean": {
                    return fc.constantFrom("bigint", "number", "string");
                }

                case "number": {
                    return fc.constantFrom("bigint", "boolean", "string");
                }

                case "string": {
                    return fc.constantFrom("bigint", "boolean", "number");
                }

                /* v8 ignore next */
                default: {
                    throw new Error("Unexpected literal union family");
                }
            }
        })();

        return keywordFamilyArbitrary.map((keywordFamily) => ({
            keywordFamily,
            literalCase,
        }));
    });

export const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;

export const buildGeneratedTypeAlias = ({
    keywordFamily,
    literalMembers,
}: Readonly<{
    keywordFamily: LiteralUnionFamily;
    literalMembers: readonly string[];
}>): string =>
    `type Generated = ${[...literalMembers, familyKeywordByFamily[keywordFamily]].join(" | ")};`;

export const parseUnionAliasAnnotation = (
    sourceText: string
): Readonly<{
    ast: ReturnType<typeof parser.parseForESLint>["ast"];
    unionType: Extract<
        ReturnType<typeof parser.parseForESLint>["ast"]["body"][number],
        {
            type: "TSTypeAliasDeclaration";
        }
    >["typeAnnotation"];
}> => {
    const parsedResult = parser.parseForESLint(sourceText, parserOptions);
    const [firstStatement] = parsedResult.ast.body;

    if (firstStatement?.type !== AST_NODE_TYPES.TSTypeAliasDeclaration) {
        throw new Error(
            "Expected the generated program to start with a type alias declaration"
        );
    }

    if (firstStatement.typeAnnotation.type !== AST_NODE_TYPES.TSUnionType) {
        throw new Error(
            "Expected generated type alias annotation to be a TSUnionType"
        );
    }

    return {
        ast: parsedResult.ast,
        unionType: firstStatement.typeAnnotation,
    };
};
