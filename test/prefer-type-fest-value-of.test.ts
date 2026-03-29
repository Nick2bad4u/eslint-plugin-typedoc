/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-value-of.test` behavior.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import fc from "fast-check";
import { describe, expect, it, vi } from "vitest";

import { fastCheckRunConfig } from "./_internal/fast-check";
import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

const ruleId = "prefer-type-fest-value-of";
const docsDescription =
    "require TypeFest ValueOf over direct T[keyof T] indexed-access unions for object value extraction.";
const preferValueOfMessage =
    "Prefer `ValueOf<T>` from type-fest over `T[keyof T]` for object value unions.";

const invalidFixtureName = "prefer-type-fest-value-of.invalid.ts";
const validFixtureName = "prefer-type-fest-value-of.valid.ts";
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
            `Expected prefer-type-fest-value-of fixture text to contain replaceable segment: ${target}`
        );
    }

    return replacedText;
};

const fixtureFixableOutputCode = `import type { ValueOf } from "type-fest";\n${replaceOrThrow(
    {
        replacement: "ValueOf<T>",
        sourceText: invalidFixtureCode,
        target: "T[keyof T]",
    }
)}`;
const fixtureFixableSecondPassOutputCode = replaceOrThrow({
    replacement: "ValueOf<SiteEventPayloadMap>",
    sourceText: fixtureFixableOutputCode,
    target: "SiteEventPayloadMap[keyof SiteEventPayloadMap]",
});
const fixtureFixableThirdPassOutputCode = replaceOrThrow({
    replacement: "ValueOf<TemplateVariableMap>",
    sourceText: fixtureFixableSecondPassOutputCode,
    target: "TemplateVariableMap[keyof TemplateVariableMap]",
});
const inlineInvalidCode = [
    "type Input = {",
    "    alpha: string;",
    "    beta: number;",
    "};",
    "type Output = Input[keyof Input];",
].join("\n");
const inlineInvalidOutputCode = [
    'import type { ValueOf } from "type-fest";',
    "type Input = {",
    "    alpha: string;",
    "    beta: number;",
    "};",
    "type Output = ValueOf<Input>;",
].join("\n");
const inlineInvalidSpacedCode = [
    "type Input = {",
    "    alpha: string;",
    "    beta: number;",
    "};",
    "type Output = Input[keyof Input ];",
].join("\n");
const inlineFixableInvalidCode = [
    'import type { ValueOf } from "type-fest";',
    "type Input = {",
    "    alpha: string;",
    "    beta: number;",
    "};",
    "type Output = Input[keyof Input];",
].join("\n");
const inlineFixableOutputCode = replaceOrThrow({
    replacement: "type Output = ValueOf<Input>;",
    sourceText: inlineFixableInvalidCode,
    target: "type Output = Input[keyof Input];",
});
const inlineInvalidWhitespaceFormattedLiteralCode = [
    "type Output = { alpha: string; beta: number; }[",
    "    keyof {",
    "        alpha: string;",
    "        beta: number;",
    "    }",
    "];",
].join("\n");
const inlineInvalidWhitespaceFormattedLiteralOutputCode = [
    'import type { ValueOf } from "type-fest";',
    "type Output = ValueOf<{ alpha: string; beta: number; }>;",
].join("\n");
const inlineNoFixShadowedValueOfInvalidCode = [
    'import type { ValueOf } from "type-fest";',
    "type Box<ValueOf extends object> = ValueOf[keyof ValueOf];",
].join("\n");
const inlineValidDifferentKeyCode = [
    "type Input = {",
    "    alpha: string;",
    "    beta: number;",
    "};",
    "type Output = Input['alpha'];",
].join("\n");
const inlineValidMismatchedObjectTextCode = [
    "type Input = {",
    "    alpha: string;",
    "    beta: number;",
    "};",
    "type Alias = Input;",
    "type Output = Input[keyof Alias];",
].join("\n");
const inlineValidReadonlyTypeOperatorCode = [
    "type Input = {",
    "    alpha: string;",
    "};",
    "type Output = Input[readonly Input];",
].join("\n");

type ValueOfReportDescriptor = Readonly<{
    fix?: unknown;
    messageId?: string;
}>;

const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;

const objectTypeExpressionArbitrary = fc.constantFrom(
    "Input",
    "{ readonly alpha: string; readonly beta: number }",
    "Record<string, number>",
    "Map<string, number>"
);

const getSourceTextForNode = ({
    code,
    node,
}: Readonly<{
    code: string;
    node: unknown;
}>): string => {
    if (typeof node !== "object" || node === null || !("range" in node)) {
        return "";
    }

    const nodeRange = (
        node as Readonly<{
            range?: readonly [number, number];
        }>
    ).range;

    if (nodeRange === undefined) {
        return "";
    }

    return code.slice(nodeRange[0], nodeRange[1]);
};

const parseIndexedAccessTypeFromCode = (
    sourceText: string
): Readonly<{
    ast: ReturnType<typeof parser.parseForESLint>["ast"];
    indexedAccessType: TSESTree.TSIndexedAccessType;
}> => {
    const parsed = parser.parseForESLint(sourceText, parserOptions);

    for (const statement of parsed.ast.body) {
        if (
            statement.type === AST_NODE_TYPES.TSTypeAliasDeclaration &&
            statement.typeAnnotation.type === AST_NODE_TYPES.TSIndexedAccessType
        ) {
            return {
                ast: parsed.ast,
                indexedAccessType: statement.typeAnnotation,
            };
        }
    }

    throw new Error(
        "Expected generated source text to include a type alias assigned from an indexed-access type"
    );
};

describe("prefer-type-fest-value-of source assertions", () => {
    it("fast-check: ValueOf replacement text remains parseable for keyed indexed-access matches", async () => {
        expect.hasAssertions();

        try {
            vi.resetModules();

            const createSafeTypeNodeTextReplacementFixMock = vi.fn(
                (...args: readonly unknown[]) =>
                    args.length >= 0 ? "FIX" : "UNREACHABLE"
            );

            vi.doMock(import("../src/_internal/typed-rule.js"), () => ({
                createTypedRule: createTypedRuleSelectorAwarePassThrough,
            }));

            vi.doMock(
                import("../src/_internal/normalize-expression-text.js"),
                () => ({
                    areEquivalentTypeNodes: () => true,
                })
            );

            vi.doMock(
                import("../src/_internal/imported-type-aliases.js"),
                () => ({
                    collectDirectNamedImportsFromSource: () =>
                        new Set<string>(),
                    createSafeTypeNodeTextReplacementFix:
                        createSafeTypeNodeTextReplacementFixMock,
                })
            );

            const authoredRuleModule =
                (await import("../src/rules/prefer-type-fest-value-of")) as {
                    default: {
                        create: (context: unknown) => {
                            TSIndexedAccessType?: (node: unknown) => void;
                        };
                    };
                };

            fc.assert(
                fc.property(
                    objectTypeExpressionArbitrary,
                    (objectTypeExpression) => {
                        createSafeTypeNodeTextReplacementFixMock.mockClear();

                        const code = [
                            "type Input = { alpha: string; beta: number };",
                            `type Candidate = ${objectTypeExpression}[keyof ${objectTypeExpression}];`,
                        ].join("\n");

                        const { ast, indexedAccessType } =
                            parseIndexedAccessTypeFromCode(code);
                        const reportCalls: ValueOfReportDescriptor[] = [];

                        const listeners = authoredRuleModule.default.create({
                            filename: "src/example.ts",
                            report: (descriptor: ValueOfReportDescriptor) => {
                                reportCalls.push(descriptor);
                            },
                            sourceCode: {
                                ast,
                                getText(node: unknown): string {
                                    return getSourceTextForNode({ code, node });
                                },
                            },
                        });

                        listeners.TSIndexedAccessType?.(indexedAccessType);

                        expect(reportCalls).toHaveLength(1);
                        expect(reportCalls[0]).toMatchObject({
                            fix: "FIX",
                            messageId: "preferValueOf",
                        });
                        expect(
                            createSafeTypeNodeTextReplacementFixMock
                        ).toHaveBeenCalledTimes(1);

                        const replacementText =
                            createSafeTypeNodeTextReplacementFixMock.mock
                                .calls[0]?.[2];

                        if (typeof replacementText !== "string") {
                            throw new TypeError(
                                "Expected ValueOf replacement text to be a string"
                            );
                        }

                        const fixedCode = `${code.slice(0, indexedAccessType.range[0])}${replacementText}${code.slice(indexedAccessType.range[1])}`;

                        expect(() => {
                            parser.parseForESLint(fixedCode, parserOptions);
                        }).not.toThrow();
                    }
                ),
                fastCheckRunConfig.default
            );
        } finally {
            vi.doUnmock("../src/_internal/imported-type-aliases.js");
            vi.doUnmock("../src/_internal/normalize-expression-text.js");
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });
});

addTypeFestRuleMetadataSmokeTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    enforceRuleShape: true,
    messages: {
        preferValueOf: preferValueOfMessage,
    },
    name: ruleId,
});

ruleTester.run(ruleId, getPluginRule(ruleId), {
    invalid: [
        {
            code: invalidFixtureCode,
            errors: [
                { messageId: "preferValueOf" },
                { messageId: "preferValueOf" },
                { messageId: "preferValueOf" },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture indexed-access value unions",
            output: [
                fixtureFixableOutputCode,
                fixtureFixableThirdPassOutputCode,
            ],
        },
        {
            code: inlineInvalidCode,
            errors: [{ messageId: "preferValueOf" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports direct T[keyof T] indexed-access alias",
            output: inlineInvalidOutputCode,
        },
        {
            code: inlineInvalidSpacedCode,
            errors: [{ messageId: "preferValueOf" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports indexed-access alias with spaced keyof token",
            output: inlineInvalidOutputCode,
        },
        {
            code: inlineFixableInvalidCode,
            errors: [{ messageId: "preferValueOf" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports and autofixes indexed-access alias with ValueOf import",
            output: inlineFixableOutputCode,
        },
        {
            code: inlineInvalidWhitespaceFormattedLiteralCode,
            errors: [{ messageId: "preferValueOf" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports differently formatted inline type literals with equivalent structure",
            output: inlineInvalidWhitespaceFormattedLiteralOutputCode,
        },
        {
            code: inlineNoFixShadowedValueOfInvalidCode,
            errors: [{ messageId: "preferValueOf" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports indexed-access alias when ValueOf identifier is shadowed",
            output: null,
        },
    ],
    valid: [
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
            name: "accepts fixture-safe patterns",
        },
        {
            code: inlineValidDifferentKeyCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores indexed access with explicit literal key",
        },
        {
            code: inlineValidMismatchedObjectTextCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores keyed access when object text and keyof target differ",
        },
        {
            code: inlineValidReadonlyTypeOperatorCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores indexed access when type operator is not keyof",
        },
    ],
});
