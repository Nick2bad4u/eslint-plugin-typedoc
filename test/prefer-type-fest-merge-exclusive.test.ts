/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-merge-exclusive.test` behavior.
 */
import parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { fastCheckRunConfig } from "./_internal/fast-check";
import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();
const ruleId = "prefer-type-fest-merge-exclusive";
const docsDescription = "require TypeFest MergeExclusive over `XOR` aliases.";
const preferMergeExclusiveMessage =
    "Prefer `MergeExclusive` from type-fest over `XOR`.";

const validFixtureName = "prefer-type-fest-merge-exclusive.valid.ts";
const invalidFixtureName = "prefer-type-fest-merge-exclusive.invalid.ts";
const invalidFixtureCode = readTypedFixture(invalidFixtureName);
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
            `Expected prefer-type-fest-merge-exclusive fixture text to contain replaceable segment: ${target}`
        );
    }

    return replacedText;
};

const fixtureFixableOutputCode = `import type { MergeExclusive } from "type-fest";\n${replaceOrThrow(
    {
        replacement: "MergeExclusive<UserQuery, UserLookup>",
        sourceText: invalidFixtureCode,
        target: "XOR<UserQuery, UserLookup>",
    }
)}`;
const inlineFixableInvalidCode = [
    'import type { XOR } from "type-aliases";',
    'import type { MergeExclusive } from "type-fest";',
    "",
    "type A = { a: string };",
    "type B = { b: string };",
    "",
    "type AB = XOR<A, B>;",
].join("\n");

const inlineFixableOutputCode = replaceOrThrow({
    replacement: "type AB = MergeExclusive<A, B>;",
    sourceText: inlineFixableInvalidCode,
    target: "type AB = XOR<A, B>;",
});
const inlineNoFixShadowedReplacementInvalidCode = [
    'import type { XOR } from "type-aliases";',
    "",
    "type Wrapper<MergeExclusive> = XOR<{ a: string }, { b: string }>;",
].join("\n");

const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;

const candidateNameArbitrary = fc.constantFrom(
    "Alpha",
    "Beta",
    "UserQuery",
    "UserLookup",
    "Payload"
);

const parseMergeExclusiveTypeReferenceFromCode = (sourceText: string) => {
    const parsed = parser.parseForESLint(sourceText, parserOptions);

    for (const statement of parsed.ast.body) {
        if (
            statement.type === AST_NODE_TYPES.TSTypeAliasDeclaration &&
            statement.typeAnnotation.type === AST_NODE_TYPES.TSTypeReference
        ) {
            return statement.typeAnnotation;
        }
    }

    throw new Error(
        "Expected generated source text to include a type alias assigned from MergeExclusive<TLeft, TRight>"
    );
};

addTypeFestRuleMetadataSmokeTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    enforceRuleShape: true,
    messages: {
        preferMergeExclusive: preferMergeExclusiveMessage,
    },
    name: ruleId,
});

describe("prefer-type-fest-merge-exclusive parse-safety guards", () => {
    it("fast-check: MergeExclusive replacement remains parseable", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                candidateNameArbitrary,
                candidateNameArbitrary,
                (leftType, rightType) => {
                    const generatedCode = [
                        'import type { MergeExclusive } from "type-fest";',
                        `type Candidate = XOR<${leftType}, ${rightType}>;`,
                    ].join("\n");

                    const replacedCode = replaceOrThrow({
                        replacement: `MergeExclusive<${leftType}, ${rightType}>`,
                        sourceText: generatedCode,
                        target: `XOR<${leftType}, ${rightType}>`,
                    });

                    const tsReference =
                        parseMergeExclusiveTypeReferenceFromCode(replacedCode);

                    expect(tsReference.typeName.type).toBe(
                        AST_NODE_TYPES.Identifier
                    );

                    if (
                        tsReference.typeName.type === AST_NODE_TYPES.Identifier
                    ) {
                        expect(tsReference.typeName.name).toBe(
                            "MergeExclusive"
                        );
                    }
                }
            ),
            fastCheckRunConfig.default
        );
    });
});

ruleTester.run(ruleId, getPluginRule(ruleId), {
    invalid: [
        {
            code: invalidFixtureCode,
            errors: [{ messageId: "preferMergeExclusive" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture XOR alias usage",
            output: fixtureFixableOutputCode,
        },
        {
            code: inlineFixableInvalidCode,
            errors: [{ messageId: "preferMergeExclusive" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports and autofixes inline XOR alias import",
            output: inlineFixableOutputCode,
        },
        {
            code: inlineNoFixShadowedReplacementInvalidCode,
            errors: [{ messageId: "preferMergeExclusive" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports XOR alias when replacement identifier is shadowed",
            output: null,
        },
    ],
    valid: [
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
            name: "accepts fixture-safe patterns",
        },
    ],
});
