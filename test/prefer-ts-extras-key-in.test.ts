import type { TSESTree } from "@typescript-eslint/utils";

import parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import fc from "fast-check";
import { describe, expect, it, vi } from "vitest";

/**
 * @packageDocumentation
 * Vitest coverage for `prefer-ts-extras-key-in.test` behavior.
 */
import { fastCheckRunConfig } from "./_internal/fast-check";
import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleId = "prefer-ts-extras-key-in";
const docsDescription =
    "require ts-extras keyIn over `in` key checks for stronger narrowing.";
const docsUrl =
    "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-key-in";
const preferTsExtrasKeyInMessage =
    "Prefer `keyIn` from `ts-extras` over `key in object` checks for stronger narrowing.";

const rule = getPluginRule(ruleId);
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-key-in.valid.ts";
const invalidFixtureName = "prefer-ts-extras-key-in.invalid.ts";
const inlineInvalidInOperatorCode = [
    "type MonitorPayload = {",
    "    readonly id: string;",
    "};",
    "",
    "declare const dynamicKey: string;",
    "declare const payload: MonitorPayload;",
    "",
    "const hasDynamicKey = dynamicKey in payload;",
    "",
    "String(hasDynamicKey);",
].join("\n");
const inlineInvalidInOperatorOutput = [
    'import { keyIn } from "ts-extras";',
    "type MonitorPayload = {",
    "    readonly id: string;",
    "};",
    "",
    "declare const dynamicKey: string;",
    "declare const payload: MonitorPayload;",
    "",
    "const hasDynamicKey = keyIn(payload, dynamicKey);",
    "",
    "String(hasDynamicKey);",
].join("\n");
const inlineInvalidNoFilenameCode = [
    "type MonitorPayload = {",
    "    readonly id: string;",
    "};",
    "",
    "declare const dynamicKey: string;",
    "declare const payload: MonitorPayload;",
    "",
    "const hasDynamicKey = dynamicKey in payload;",
    "",
    "String(hasDynamicKey);",
].join("\n");
const inlineInvalidNoFilenameOutput = [
    'import { keyIn } from "ts-extras";',
    "type MonitorPayload = {",
    "    readonly id: string;",
    "};",
    "",
    "declare const dynamicKey: string;",
    "declare const payload: MonitorPayload;",
    "",
    "const hasDynamicKey = keyIn(payload, dynamicKey);",
    "",
    "String(hasDynamicKey);",
].join("\n");
const inlineValidNonInOperatorCode = [
    "type MonitorPayload = {",
    "    readonly id: string;",
    "};",
    "",
    "declare const payload: MonitorPayload;",
    "",
    'const hasId = payload.id === "id";',
    "",
    "String(hasId);",
].join("\n");
const inlineValidForInLoopCode = [
    "type MonitorPayload = Record<string, string>;",
    "",
    "declare const payload: MonitorPayload;",
    "",
    "for (const key in payload) {",
    "    String(key);",
    "}",
].join("\n");
const inlineFixableCode = [
    'import { keyIn } from "ts-extras";',
    "",
    "type MonitorPayload = {",
    "    readonly id: string;",
    "};",
    "",
    "declare const dynamicKey: string;",
    "declare const payload: MonitorPayload;",
    "",
    "const hasDynamicKey = dynamicKey in payload;",
    "",
    "String(hasDynamicKey);",
].join("\n");
const inlineFixableOutput = [
    'import { keyIn } from "ts-extras";',
    "",
    "type MonitorPayload = {",
    "    readonly id: string;",
    "};",
    "",
    "declare const dynamicKey: string;",
    "declare const payload: MonitorPayload;",
    "",
    "const hasDynamicKey = keyIn(payload, dynamicKey);",
    "",
    "String(hasDynamicKey);",
].join("\n");
const inlineInvalidLiteralLeftOperandCode = [
    "type MonitorPayload = {",
    "    readonly id: string;",
    "};",
    "",
    "declare const payload: MonitorPayload;",
    "",
    'const hasDynamicKey = "id" in payload;',
    "",
    "String(hasDynamicKey);",
].join("\n");
const inlineInvalidLiteralLeftOperandOutput = [
    'import { keyIn } from "ts-extras";',
    "type MonitorPayload = {",
    "    readonly id: string;",
    "};",
    "",
    "declare const payload: MonitorPayload;",
    "",
    'const hasDynamicKey = keyIn(payload, "id");',
    "",
    "String(hasDynamicKey);",
].join("\n");
const inlineInvalidMemberRightOperandCode = [
    "type MonitorState = {",
    "    readonly payload: { id: string };",
    "};",
    "",
    "declare const dynamicKey: string;",
    "declare const state: MonitorState;",
    "",
    "const hasDynamicKey = dynamicKey in state.payload;",
    "",
    "String(hasDynamicKey);",
].join("\n");
const inlineInvalidMemberRightOperandOutput = [
    'import { keyIn } from "ts-extras";',
    "type MonitorState = {",
    "    readonly payload: { id: string };",
    "};",
    "",
    "declare const dynamicKey: string;",
    "declare const state: MonitorState;",
    "",
    "const hasDynamicKey = keyIn(state.payload, dynamicKey);",
    "",
    "String(hasDynamicKey);",
].join("\n");
const inlineInvalidLogicalGuardCode = [
    "type MonitorPayload = Record<string, string>;",
    "",
    "declare const dynamicKey: string;",
    "declare const payload: MonitorPayload;",
    "",
    "const hasDynamicKey = Math.random() > 0.5 || dynamicKey in payload;",
    "",
    "String(hasDynamicKey);",
].join("\n");
const inlineInvalidSideEffectKeyCode = [
    "declare function getKey(): string;",
    "declare function getPayload(): Record<string, unknown>;",
    "",
    "const hasDynamicKey = getKey() in getPayload();",
    "",
    "String(hasDynamicKey);",
].join("\n");
const inlineInvalidUnboundKeyWithSideEffectfulObjectCode = [
    "declare function getPayload(): Record<string, unknown>;",
    "",
    "const hasDynamicKey = dynamicKey in getPayload();",
    "",
    "String(hasDynamicKey);",
].join("\n");
const inlineInvalidAstNodeTypeGuardCode = [
    "import type { TSESTree } from '@typescript-eslint/utils';",
    "",
    "type NodeWithOptionalParent = Readonly<TSESTree.Node> & {",
    "    parent?: Readonly<TSESTree.Node>;",
    "};",
    "",
    "const hasOptionalParentProperty = (",
    "    node: Readonly<TSESTree.Node>",
    ' ): node is NodeWithOptionalParent => "parent" in node;',
].join("\n");
const inlineInvalidAstNodeTypeGuardOutput = [
    "import type { TSESTree } from '@typescript-eslint/utils';",
    'import { keyIn } from "ts-extras";',
    "",
    "type NodeWithOptionalParent = Readonly<TSESTree.Node> & {",
    "    parent?: Readonly<TSESTree.Node>;",
    "};",
    "",
    "const hasOptionalParentProperty = (",
    "    node: Readonly<TSESTree.Node>",
    ' ): node is NodeWithOptionalParent => keyIn(node, "parent");',
].join("\n");
const inlineInvalidTypeParametersTypeGuardCode = [
    "import type { TSESTree } from '@typescript-eslint/utils';",
    "",
    "type NodeWithOptionalTypeParameters = Readonly<TSESTree.Node> & {",
    "    typeParameters?: Readonly<TSESTree.TSTypeParameterDeclaration>;",
    "};",
    "",
    "const hasOptionalTypeParametersProperty = (",
    "    node: Readonly<TSESTree.Node>",
    '): node is NodeWithOptionalTypeParameters => "typeParameters" in node;',
].join("\n");
const inlineInvalidTypeParametersTypeGuardOutput = [
    "import type { TSESTree } from '@typescript-eslint/utils';",
    'import { keyIn } from "ts-extras";',
    "",
    "type NodeWithOptionalTypeParameters = Readonly<TSESTree.Node> & {",
    "    typeParameters?: Readonly<TSESTree.TSTypeParameterDeclaration>;",
    "};",
    "",
    "const hasOptionalTypeParametersProperty = (",
    "    node: Readonly<TSESTree.Node>",
    '): node is NodeWithOptionalTypeParameters => keyIn(node, "typeParameters");',
].join("\n");

const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;

const createMinimalScopeWithBindings = (
    bindingNames: readonly string[]
): {
    readonly set: ReadonlyMap<string, Record<string, never>>;
    readonly upper: null;
} => ({
    set: new Map(bindingNames.map((bindingName) => [bindingName, {}])),
    upper: null,
});

type KeyInFixFactoryArguments = Readonly<{
    replacementTextFactory: (replacementName: string) => string;
}>;

type NonFixableInExpressionTemplateId =
    | "computedMemberRight"
    | "literalLeft"
    | "memberRight";

const generatedIdentifierArbitrary = fc.constantFrom(
    "$key",
    "candidateKey",
    "dynamicKey",
    "keyCandidate",
    "候補キー"
);

const generatedObjectIdentifierArbitrary = fc.constantFrom(
    "dataMap",
    "payload",
    "registry",
    "stateTable",
    "対象オブジェクト"
);

const parseInBinaryExpressionFromCode = (
    sourceText: string
): Readonly<{
    ast: ReturnType<typeof parser.parseForESLint>["ast"];
    binaryExpression: TSESTree.BinaryExpression;
    binaryRange: readonly [number, number];
}> => {
    const parsedResult = parser.parseForESLint(sourceText, parserOptions);

    for (const statement of parsedResult.ast.body) {
        if (statement.type === AST_NODE_TYPES.VariableDeclaration) {
            for (const declaration of statement.declarations) {
                if (
                    declaration.init?.type === AST_NODE_TYPES.BinaryExpression
                ) {
                    return {
                        ast: parsedResult.ast,
                        binaryExpression: declaration.init,
                        binaryRange: declaration.init.range,
                    };
                }
            }
        }
    }

    throw new Error(
        "Expected generated code to include a variable binary expression"
    );
};

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

    const nodeRange = (node as Readonly<{ range?: readonly [number, number] }>)
        .range;

    if (!nodeRange) {
        return "";
    }

    return code.slice(nodeRange[0], nodeRange[1]);
};

const buildNonFixableInExpressionText = ({
    keyIdentifier,
    objectIdentifier,
    templateId,
}: Readonly<{
    keyIdentifier: string;
    objectIdentifier: string;
    templateId: NonFixableInExpressionTemplateId;
}>): string => {
    if (templateId === "literalLeft") {
        return `"id" in ${objectIdentifier}`;
    }

    if (templateId === "memberRight") {
        return `${keyIdentifier} in ${objectIdentifier}.payload`;
    }

    return `${keyIdentifier} in ${objectIdentifier}[index]`;
};

addTypeFestRuleMetadataSmokeTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    enforceRuleShape: true,
    messages: {
        preferTsExtrasKeyIn: preferTsExtrasKeyInMessage,
    },
    name: ruleId,
});

describe("prefer-ts-extras-key-in metadata literals", () => {
    it("declares the authored docs URL literal", () => {
        expect(rule.meta.docs?.url).toBe(docsUrl);
    });
});

describe("prefer-ts-extras-key-in fast-check fix safety", () => {
    it("fast-check: identifier in-expressions report and produce parseable keyIn replacement", async () => {
        expect.hasAssertions();

        try {
            vi.resetModules();

            const createSafeValueNodeTextReplacementFixMock = vi.fn(
                (options: KeyInFixFactoryArguments): string => {
                    if (typeof options.replacementTextFactory !== "function") {
                        throw new TypeError(
                            "Expected replacementTextFactory to be callable"
                        );
                    }

                    return "FIX";
                }
            );

            vi.doMock(import("../src/_internal/typed-rule.js"), () => ({
                createTypedRule: createTypedRuleSelectorAwarePassThrough,
            }));

            vi.doMock(
                import("../src/_internal/imported-value-symbols.js"),
                () => ({
                    collectDirectNamedValueImportsFromSource: () =>
                        new Map<string, ReadonlySet<string>>(),
                    createSafeValueNodeTextReplacementFix:
                        createSafeValueNodeTextReplacementFixMock,
                    getFunctionCallArgumentText: ({
                        argumentNode,
                        sourceCode,
                    }: Readonly<{
                        argumentNode: unknown;
                        sourceCode: Readonly<{
                            getText: (node: unknown) => string;
                        }>;
                    }>): string => sourceCode.getText(argumentNode).trim(),
                })
            );

            const authoredRuleModule =
                (await import("../src/rules/prefer-ts-extras-key-in")) as {
                    default: {
                        create: (context: unknown) => {
                            BinaryExpression?: (node: unknown) => void;
                        };
                    };
                };

            fc.assert(
                fc.property(
                    generatedIdentifierArbitrary,
                    generatedObjectIdentifierArbitrary,
                    fc.boolean(),
                    (
                        keyIdentifier,
                        objectIdentifier,
                        includeUnicodeNoiseLine
                    ) => {
                        createSafeValueNodeTextReplacementFixMock.mockClear();

                        const code = [
                            `declare const ${keyIdentifier}: string;`,
                            `declare const ${objectIdentifier}: Record<string, unknown>;`,
                            includeUnicodeNoiseLine
                                ? 'const banner = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻  ";'
                                : "",
                            `const hasDynamicKey = ${keyIdentifier} in ${objectIdentifier};`,
                            "String(hasDynamicKey);",
                        ]
                            .filter((line) => line.length > 0)
                            .join("\n");

                        const { ast, binaryExpression, binaryRange } =
                            parseInBinaryExpressionFromCode(code);
                        const reportCalls: Readonly<{
                            fix?: unknown;
                            messageId?: string;
                        }>[] = [];

                        const listeners = authoredRuleModule.default.create({
                            filename: "src/example.ts",
                            report: (
                                descriptor: Readonly<{
                                    fix?: unknown;
                                    messageId?: string;
                                }>
                            ) => {
                                reportCalls.push(descriptor);
                            },
                            sourceCode: {
                                ast,
                                getScope() {
                                    return createMinimalScopeWithBindings([
                                        keyIdentifier,
                                        objectIdentifier,
                                    ]);
                                },
                                getText(node: unknown): string {
                                    return getSourceTextForNode({ code, node });
                                },
                            },
                        });

                        listeners.BinaryExpression?.(binaryExpression);

                        expect(reportCalls).toHaveLength(1);
                        expect(reportCalls[0]).toMatchObject({
                            messageId: "preferTsExtrasKeyIn",
                        });

                        const createSafeFixInvocationCount =
                            createSafeValueNodeTextReplacementFixMock.mock.calls
                                .length;

                        if (createSafeFixInvocationCount === 0) {
                            const reportFix = reportCalls[0]?.fix;

                            if (reportFix !== undefined) {
                                expect(typeof reportFix).toBe("function");
                            }

                            return;
                        }

                        expect(reportCalls[0]?.fix).toBe("FIX");
                        expect(
                            createSafeValueNodeTextReplacementFixMock
                        ).toHaveBeenCalledTimes(1);

                        const fixArguments =
                            createSafeValueNodeTextReplacementFixMock.mock
                                .calls[0]?.[0];

                        expect(fixArguments).toBeDefined();

                        if (fixArguments === undefined) {
                            throw new TypeError(
                                "Expected mock fix arguments to be defined"
                            );
                        }

                        const replacementText =
                            fixArguments.replacementTextFactory("keyIn");

                        expect(replacementText).toBe(
                            `keyIn(${objectIdentifier}, ${keyIdentifier})`
                        );

                        const fixedCode =
                            code.slice(0, binaryRange[0]) +
                            replacementText +
                            code.slice(binaryRange[1]);

                        expect(() => {
                            parser.parseForESLint(fixedCode, parserOptions);
                        }).not.toThrow();
                    }
                ),
                fastCheckRunConfig.default
            );
        } finally {
            vi.doUnmock("../src/_internal/imported-value-symbols.js");
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });

    it("fast-check: expression in-operands report and produce parseable keyIn replacements", async () => {
        expect.hasAssertions();

        try {
            vi.resetModules();

            const createSafeValueNodeTextReplacementFixMock = vi.fn(
                (options: KeyInFixFactoryArguments): string => {
                    if (typeof options.replacementTextFactory !== "function") {
                        throw new TypeError(
                            "Expected replacementTextFactory to be callable"
                        );
                    }

                    return "FIX";
                }
            );

            vi.doMock(import("../src/_internal/typed-rule.js"), () => ({
                createTypedRule: createTypedRuleSelectorAwarePassThrough,
            }));

            vi.doMock(
                import("../src/_internal/imported-value-symbols.js"),
                () => ({
                    collectDirectNamedValueImportsFromSource: () =>
                        new Map<string, ReadonlySet<string>>(),
                    createSafeValueNodeTextReplacementFix:
                        createSafeValueNodeTextReplacementFixMock,
                    getFunctionCallArgumentText: ({
                        argumentNode,
                        sourceCode,
                    }: Readonly<{
                        argumentNode: unknown;
                        sourceCode: Readonly<{
                            getText: (node: unknown) => string;
                        }>;
                    }>): string => sourceCode.getText(argumentNode).trim(),
                })
            );

            const authoredRuleModule =
                (await import("../src/rules/prefer-ts-extras-key-in")) as {
                    default: {
                        create: (context: unknown) => {
                            BinaryExpression?: (node: unknown) => void;
                        };
                    };
                };

            fc.assert(
                fc.property(
                    generatedIdentifierArbitrary,
                    generatedObjectIdentifierArbitrary,
                    fc.constantFrom(
                        "literalLeft",
                        "memberRight",
                        "computedMemberRight"
                    ),
                    (keyIdentifier, objectIdentifier, templateId) => {
                        createSafeValueNodeTextReplacementFixMock.mockClear();

                        const code = [
                            `declare const ${keyIdentifier}: string;`,
                            `declare const ${objectIdentifier}: Record<string, { readonly payload: unknown }>;`,
                            "declare const index: number;",
                            `const hasDynamicKey = ${buildNonFixableInExpressionText({ keyIdentifier, objectIdentifier, templateId })};`,
                            "String(hasDynamicKey);",
                        ].join("\n");

                        const { ast, binaryExpression, binaryRange } =
                            parseInBinaryExpressionFromCode(code);
                        const reportCalls: Readonly<{
                            fix?: unknown;
                            messageId?: string;
                        }>[] = [];

                        const listeners = authoredRuleModule.default.create({
                            filename: "src/example.ts",
                            report: (
                                descriptor: Readonly<{
                                    fix?: unknown;
                                    messageId?: string;
                                }>
                            ) => {
                                reportCalls.push(descriptor);
                            },
                            sourceCode: {
                                ast,
                                getScope() {
                                    return createMinimalScopeWithBindings([
                                        keyIdentifier,
                                        objectIdentifier,
                                        "index",
                                    ]);
                                },
                                getText(node: unknown): string {
                                    return getSourceTextForNode({ code, node });
                                },
                            },
                        });

                        listeners.BinaryExpression?.(binaryExpression);

                        expect(reportCalls).toHaveLength(1);

                        const [firstReport] = reportCalls;

                        expect(firstReport).toBeDefined();

                        if (!firstReport) {
                            throw new TypeError(
                                "Expected first prefer-ts-extras-key-in report"
                            );
                        }

                        expect(firstReport).toMatchObject({
                            messageId: "preferTsExtrasKeyIn",
                        });

                        let replacementText: null | string = null;

                        const fixArguments =
                            createSafeValueNodeTextReplacementFixMock.mock
                                .calls[0]?.[0];

                        if (fixArguments) {
                            replacementText =
                                fixArguments.replacementTextFactory("keyIn");
                        } else {
                            const reportFixCandidate: unknown = firstReport.fix;

                            if (typeof reportFixCandidate === "function") {
                                const reportFix = reportFixCandidate as (
                                    fixer: Readonly<{
                                        replaceText: (
                                            node: unknown,
                                            text: string
                                        ) => unknown;
                                    }>
                                ) => unknown;

                                reportFix({
                                    replaceText: (
                                        _node: unknown,
                                        text: string
                                    ) => {
                                        replacementText = text;

                                        return null;
                                    },
                                });
                            }
                        }

                        if (replacementText === null) {
                            return;
                        }

                        expect(replacementText.length).toBeGreaterThan(0);

                        const fixedCode =
                            code.slice(0, binaryRange[0]) +
                            replacementText +
                            code.slice(binaryRange[1]);

                        expect(() => {
                            parser.parseForESLint(fixedCode, parserOptions);
                        }).not.toThrow();
                    }
                ),
                fastCheckRunConfig.default
            );
        } finally {
            vi.doUnmock("../src/_internal/imported-value-symbols.js");
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });
});

ruleTester.run(ruleId, rule, {
    invalid: [
        {
            code: readTypedFixture(invalidFixtureName),
            errors: [
                {
                    messageId: "preferTsExtrasKeyIn",
                },
                {
                    messageId: "preferTsExtrasKeyIn",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture in-operator checks",
        },
        {
            code: inlineInvalidInOperatorCode,
            errors: [
                {
                    messageId: "preferTsExtrasKeyIn",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports direct in-operator membership check",
            output: inlineInvalidInOperatorOutput,
        },
        {
            code: inlineInvalidNoFilenameCode,
            errors: [
                {
                    messageId: "preferTsExtrasKeyIn",
                },
            ],
            name: "reports in-operator check without explicit filename",
            output: inlineInvalidNoFilenameOutput,
        },
        {
            code: inlineFixableCode,
            errors: [
                {
                    messageId: "preferTsExtrasKeyIn",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes identifier in-operator check when keyIn import is in scope",
            output: inlineFixableOutput,
        },
        {
            code: inlineInvalidLiteralLeftOperandCode,
            errors: [
                {
                    messageId: "preferTsExtrasKeyIn",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes literal-left in-operator check",
            output: inlineInvalidLiteralLeftOperandOutput,
        },
        {
            code: inlineInvalidMemberRightOperandCode,
            errors: [
                {
                    messageId: "preferTsExtrasKeyIn",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes member-right in-operator check",
            output: inlineInvalidMemberRightOperandOutput,
        },
        {
            code: inlineInvalidLogicalGuardCode,
            errors: [
                {
                    messageId: "preferTsExtrasKeyIn",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports logical-guard in-operator check without autofix",
            output: null,
        },
        {
            code: inlineInvalidSideEffectKeyCode,
            errors: [
                {
                    messageId: "preferTsExtrasKeyIn",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports side-effectful key expression without autofix",
            output: null,
        },
        {
            code: inlineInvalidUnboundKeyWithSideEffectfulObjectCode,
            errors: [
                {
                    messageId: "preferTsExtrasKeyIn",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports unbound identifier key with side-effectful object expression without autofix",
            output: null,
        },
        {
            code: inlineInvalidAstNodeTypeGuardCode,
            errors: [
                {
                    messageId: "preferTsExtrasKeyIn",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes ast-node style parent type-guard with object-first keyIn ordering",
            output: inlineInvalidAstNodeTypeGuardOutput,
        },
        {
            code: inlineInvalidTypeParametersTypeGuardCode,
            errors: [
                {
                    messageId: "preferTsExtrasKeyIn",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes imported-type-aliases style typeParameters guard with object-first keyIn ordering",
            output: inlineInvalidTypeParametersTypeGuardOutput,
        },
    ],
    valid: [
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
            name: "accepts fixture-safe patterns",
        },
        {
            code: inlineValidNonInOperatorCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores non-in-operator object property checks",
        },
        {
            code: inlineValidForInLoopCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores for-in loop iteration",
        },
    ],
});
