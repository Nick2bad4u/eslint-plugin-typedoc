import parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";
import fc from "fast-check";
import { describe, expect, it, vi } from "vitest";

import { fastCheckRunConfig } from "./_internal/fast-check";
/**
 * @packageDocumentation
 * Vitest coverage for `prefer-ts-extras-assert-error.test` behavior.
 */
import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleId = "prefer-ts-extras-assert-error";
const docsDescription =
    "require ts-extras assertError over manual instanceof Error throw guards.";
const docsUrl =
    "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-assert-error";
const preferTsExtrasAssertErrorMessage =
    "Prefer `assertError` from `ts-extras` over manual `instanceof Error` throw guards.";
const suggestTsExtrasAssertErrorMessage =
    "Replace this manual guard with `assertError(...)` from `ts-extras`.";

const rule = getPluginRule(ruleId);
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-assert-error.valid.ts";
const invalidFixtureName = "prefer-ts-extras-assert-error.invalid.ts";
const inlineInvalidCode = [
    "function ensureError(value: unknown): asserts value is Error {",
    "    if (!(value instanceof Error)) {",
    "        throw new TypeError('Expected Error');",
    "    }",
    "}",
].join("\n");
const inlineInvalidDirectThrowConsequentCode = [
    "function ensureError(value: unknown): asserts value is Error {",
    "    if (!(value instanceof Error))",
    "        throw new TypeError('Expected Error');",
    "}",
].join("\n");
const nonErrorInstanceofValidCode = [
    "function ensureError(value: unknown): void {",
    "    if (!(value instanceof TypeError)) {",
    "        throw new TypeError('Expected TypeError');",
    "    }",
    "}",
].join("\n");
const nonThrowOnlyValidCode = [
    "function ensureError(value: unknown): void {",
    "    if (!(value instanceof Error)) {",
    "        String(value);",
    "        throw new TypeError('Expected Error');",
    "    }",
    "}",
].join("\n");
const singleExpressionConsequentValidCode = [
    "function ensureError(value: unknown): void {",
    "    if (!(value instanceof Error)) {",
    "        String(value);",
    "    }",
    "}",
].join("\n");
const throwThenTrailingStatementValidCode = [
    "function ensureError(value: unknown): void {",
    "    if (!(value instanceof Error)) {",
    "        throw new TypeError('Expected Error');",
    "        String(value);",
    "    }",
    "}",
].join("\n");
const nonNegatedInstanceofValidCode = [
    "function ensureError(value: unknown): void {",
    "    if (value instanceof Error) {",
    "        throw new TypeError('Unexpected Error');",
    "    }",
    "}",
].join("\n");
const nonInstanceofBinaryValidCode = [
    "function ensureError(value: unknown): void {",
    "    if (!(value !== Error)) {",
    "        throw new TypeError('Expected Error constructor mismatch');",
    "    }",
    "}",
].join("\n");
const nonBlockNonThrowConsequentValidCode = [
    "function ensureError(value: unknown): void {",
    "    if (!(value instanceof Error))",
    "        String(value);",
    "}",
].join("\n");
const unaryNonBinaryArgumentValidCode = [
    "function ensureError(value: unknown): void {",
    "    if (!value) {",
    "        throw new TypeError('Expected Error');",
    "    }",
    "}",
].join("\n");
const nonIdentifierInstanceofRightValidCode = [
    "declare const ErrorNamespace: { Error: new (...arguments_: readonly unknown[]) => Error };",
    "function ensureError(value: unknown): void {",
    "    if (!(value instanceof ErrorNamespace.Error)) {",
    "        throw new TypeError('Expected Error');",
    "    }",
    "}",
].join("\n");
const unaryNonNegationValidCode = [
    "function ensureError(value: unknown): void {",
    "    if (void (value instanceof Error)) {",
    "        throw new TypeError('Expected Error');",
    "    }",
    "}",
].join("\n");
const shadowedErrorBindingValidCode = [
    "class Error extends TypeError {}",
    "function ensureError(value: unknown): void {",
    "    if (!(value instanceof Error)) {",
    "        throw new TypeError('Expected local Error');",
    "    }",
    "}",
].join("\n");
const privateIdentifierValidCode = [
    "class ErrorContainer {",
    "    #value: unknown;",
    "",
    "    constructor(value: unknown) {",
    "        this.#value = value;",
    "    }",
    "",
    "    ensureError(): void {",
    "        if (!(this.#value instanceof Error)) {",
    "            throw new TypeError('Expected Error');",
    "        }",
    "    }",
    "}",
].join("\n");
const inlineSuggestableCode = [
    'import { assertError } from "ts-extras";',
    "",
    "function ensureError(value: unknown): asserts value is Error {",
    "    if (!(value instanceof Error)) {",
    "        throw new TypeError('Expected Error');",
    "    }",
    "}",
].join("\n");
const inlineSuggestableOutput = [
    'import { assertError } from "ts-extras";',
    "",
    "function ensureError(value: unknown): asserts value is Error {",
    "    assertError(value);",
    "}",
].join("\n");
const inlineInvalidSuggestionOutputCode = [
    'import { assertError } from "ts-extras";',
    "function ensureError(value: unknown): asserts value is Error {",
    "    assertError(value);",
    "}",
].join("\n");
const privateIdentifierInvalidSuggestionOutputCode = [
    'import { assertError } from "ts-extras";',
    "class ErrorContainer {",
    "    #value: unknown;",
    "",
    "    constructor(value: unknown) {",
    "        this.#value = value;",
    "    }",
    "",
    "    ensureError(): void {",
    "        assertError(this.#value);",
    "    }",
    "}",
].join("\n");

const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;

type ErrorTargetExpressionTemplateId = "identifier" | "member";

const errorTargetExpressionTemplateIdArbitrary = fc.constantFrom(
    "identifier",
    "member"
);

const variableNameArbitrary = fc.constantFrom("value", "errorValue", "候補値");

const buildErrorTargetExpressionTemplate = ({
    templateId,
    variableName,
}: Readonly<{
    templateId: ErrorTargetExpressionTemplateId;
    variableName: string;
}>): Readonly<{
    expressionText: string;
    preIfStatements: readonly string[];
}> => {
    if (templateId === "member") {
        return {
            expressionText: `container.${variableName}`,
            preIfStatements: [`const container = { ${variableName} };`],
        };
    }

    return {
        expressionText: variableName,
        preIfStatements: [],
    };
};

const buildAssertErrorGuardCode = ({
    directThrowConsequent,
    expressionTemplate,
    includeUnicodeBanner,
    variableName,
}: Readonly<{
    directThrowConsequent: boolean;
    expressionTemplate: Readonly<{
        expressionText: string;
        preIfStatements: readonly string[];
    }>;
    includeUnicodeBanner: boolean;
    variableName: string;
}>): string => {
    const ifStatementLines = directThrowConsequent
        ? [
              `if (!(${expressionTemplate.expressionText} instanceof Error))`,
              '        throw new TypeError("Expected Error");',
          ]
        : [
              `if (!(${expressionTemplate.expressionText} instanceof Error)) {`,
              '        throw new TypeError("Expected Error");',
              "    }",
          ];

    const lines = [
        'import { assertError } from "ts-extras";',
        includeUnicodeBanner
            ? 'const banner = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻";'
            : "",
        `function ensureError(${variableName}: unknown): void {`,
        ...expressionTemplate.preIfStatements.map(
            (statement) => `    ${statement}`
        ),
        ...ifStatementLines.map((line) => `    ${line}`),
        "}",
        includeUnicodeBanner ? "String(banner);" : "",
    ];

    return lines.filter((line) => line.length > 0).join("\n");
};

const isRangeNode = (
    value: unknown
): value is Readonly<{
    range: readonly [number, number];
}> => {
    if (typeof value !== "object" || value === null || !("range" in value)) {
        return false;
    }

    const candidateRange = value.range;

    if (!Array.isArray(candidateRange) || candidateRange.length !== 2) {
        return false;
    }

    const [start, end] = candidateRange;

    return typeof start === "number" && typeof end === "number";
};

const getSourceTextForNode = ({
    code,
    node,
}: Readonly<{
    code: string;
    node: unknown;
}>): string => {
    if (!isRangeNode(node)) {
        return "";
    }

    return code.slice(node.range[0], node.range[1]);
};

const parseEnsureErrorIfStatementFromCode = (
    code: string
): Readonly<{
    ast: ReturnType<typeof parser.parseForESLint>["ast"];
    ifNode: TSESTree.IfStatement;
}> => {
    const parsed = parser.parseForESLint(code, parserOptions);

    for (const statement of parsed.ast.body) {
        if (
            statement.type === AST_NODE_TYPES.FunctionDeclaration &&
            statement.id?.name === "ensureError"
        ) {
            for (const bodyStatement of statement.body.body) {
                if (bodyStatement.type === AST_NODE_TYPES.IfStatement) {
                    return {
                        ast: parsed.ast,
                        ifNode: bodyStatement,
                    };
                }
            }
        }
    }

    throw new Error("Expected ensureError function containing an IfStatement");
};

type ReplaceTextOnlyFixer = Readonly<{
    replaceText: (node: unknown, text: string) => unknown;
}>;

const assertIsFixFunction: (
    value: unknown
) => asserts value is (fixer: ReplaceTextOnlyFixer) => unknown = (value) => {
    if (typeof value !== "function") {
        throw new TypeError("Expected fixer function");
    }
};

type ReportDescriptor = Readonly<{
    fix?: unknown;
    messageId?: string;
    suggest?: readonly Readonly<{
        fix?: unknown;
        messageId?: string;
    }>[];
}>;

addTypeFestRuleMetadataSmokeTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    messages: {
        preferTsExtrasAssertError: preferTsExtrasAssertErrorMessage,
        suggestTsExtrasAssertError: suggestTsExtrasAssertErrorMessage,
    },
    name: ruleId,
});

describe("prefer-ts-extras-assert-error metadata literals", () => {
    it("declares authored docs URL and hasSuggestions literals", () => {
        expect(rule.meta.docs?.url).toBe(docsUrl);
        expect(rule.meta.hasSuggestions).toBeTruthy();
    });
});

describe("prefer-ts-extras-assert-error internal listener guards", () => {
    it("ignores synthetic PrivateIdentifier instanceof guards without crashing", () => {
        const reportCalls: { messageId?: string }[] = [];

        const listeners = rule.create({
            filename: "src/example.ts",
            report(descriptor: Readonly<{ messageId?: string }>) {
                reportCalls.push(descriptor);
            },
            sourceCode: {
                ast: {
                    body: [],
                },
                getText: () => "value",
            },
        } as never);

        const ifStatementListener = listeners.IfStatement;

        expect(ifStatementListener).toBeTypeOf("function");

        expect(() =>
            ifStatementListener?.({
                alternate: null,
                consequent: {
                    type: "ThrowStatement",
                },
                test: {
                    argument: {
                        left: {
                            name: "#value",
                            type: "PrivateIdentifier",
                        },
                        operator: "instanceof",
                        right: {
                            name: "Error",
                            type: "Identifier",
                        },
                        type: "BinaryExpression",
                    },
                    operator: "!",
                    type: "UnaryExpression",
                },
                type: "IfStatement",
            } as never)
        ).not.toThrow();
        expect(reportCalls).toHaveLength(0);
    });

    it("returns early for bare PrivateIdentifier targets under mocked global Error resolution", async () => {
        const reportCalls: { messageId?: string }[] = [];

        try {
            vi.resetModules();

            vi.doMock(import("../src/_internal/typed-rule.js"), () => ({
                createTypedRule: createTypedRuleSelectorAwarePassThrough,
                isGlobalIdentifierNamed: (
                    _context: unknown,
                    identifier: Readonly<{ name?: string; type?: string }>,
                    name: string
                ) =>
                    identifier.type === "Identifier" &&
                    identifier.name === name,
            }));

            vi.doMock(
                import("../src/_internal/imported-value-symbols.js"),
                () => ({
                    collectDirectNamedValueImportsFromSource: () =>
                        new Set<string>(),
                    createSafeValueNodeTextReplacementFix: () => null,
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
                (await import("../src/rules/prefer-ts-extras-assert-error")) as {
                    default: {
                        create: (context: unknown) => {
                            IfStatement?: (node: unknown) => void;
                        };
                    };
                };

            const listeners = authoredRuleModule.default.create({
                filename: "src/example.ts",
                report(descriptor: Readonly<{ messageId?: string }>) {
                    reportCalls.push(descriptor);
                },
                sourceCode: {
                    ast: {
                        body: [],
                    },
                    getText: () => "value",
                },
            });

            listeners.IfStatement?.({
                alternate: null,
                consequent: {
                    type: "ThrowStatement",
                },
                test: {
                    argument: {
                        left: {
                            name: "#value",
                            type: "PrivateIdentifier",
                        },
                        operator: "instanceof",
                        right: {
                            name: "Error",
                            type: "Identifier",
                        },
                        type: "BinaryExpression",
                    },
                    operator: "!",
                    type: "UnaryExpression",
                },
                type: "IfStatement",
            });

            expect(reportCalls).toHaveLength(0);
        } finally {
            vi.doUnmock("../src/_internal/imported-value-symbols.js");
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });
});

describe("prefer-ts-extras-assert-error fast-check suggestion safety", () => {
    it("fast-check: instanceof Error guards report parseable assertError suggestions", async () => {
        expect.hasAssertions();

        try {
            vi.resetModules();

            vi.doMock(import("../src/_internal/typed-rule.js"), () => ({
                createTypedRule: createTypedRuleSelectorAwarePassThrough,
                isGlobalIdentifierNamed: (): boolean => true,
            }));

            vi.doMock(
                import("../src/_internal/imported-value-symbols.js"),
                () => ({
                    collectDirectNamedValueImportsFromSource: () =>
                        new Set(["assertError"]),
                    createSafeValueNodeTextReplacementFix:
                        (
                            options: Readonly<{
                                replacementTextFactory: (
                                    replacementName: string
                                ) => string;
                                targetNode: unknown;
                            }>
                        ) =>
                        (fixer: ReplaceTextOnlyFixer) =>
                            fixer.replaceText(
                                options.targetNode,
                                options.replacementTextFactory("assertError")
                            ),
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
                (await import("../src/rules/prefer-ts-extras-assert-error")) as {
                    default: {
                        create: (context: unknown) => {
                            IfStatement?: (node: unknown) => void;
                        };
                    };
                };

            fc.assert(
                fc.property(
                    errorTargetExpressionTemplateIdArbitrary,
                    variableNameArbitrary,
                    fc.boolean(),
                    fc.boolean(),
                    (
                        expressionTemplateId,
                        variableName,
                        directThrowConsequent,
                        includeUnicodeBanner
                    ) => {
                        const expressionTemplate =
                            buildErrorTargetExpressionTemplate({
                                templateId: expressionTemplateId,
                                variableName,
                            });
                        const code = buildAssertErrorGuardCode({
                            directThrowConsequent,
                            expressionTemplate,
                            includeUnicodeBanner,
                            variableName,
                        });
                        const { ast, ifNode } =
                            parseEnsureErrorIfStatementFromCode(code);
                        const reportCalls: ReportDescriptor[] = [];

                        const listeners = authoredRuleModule.default.create({
                            filename: "src/example.ts",
                            report(descriptor: ReportDescriptor) {
                                reportCalls.push(descriptor);
                            },
                            sourceCode: {
                                ast,
                                getText(node: unknown): string {
                                    return getSourceTextForNode({ code, node });
                                },
                            },
                        });

                        listeners.IfStatement?.(ifNode);

                        expect(reportCalls).toHaveLength(1);
                        expect(reportCalls[0]).toMatchObject({
                            messageId: "preferTsExtrasAssertError",
                        });
                        expect(reportCalls[0]?.fix).toBeUndefined();

                        const firstSuggestion = reportCalls[0]?.suggest?.[0];

                        expect(firstSuggestion?.messageId).toBe(
                            "suggestTsExtrasAssertError"
                        );
                        expect(firstSuggestion?.fix).toBeDefined();

                        const suggestionFix: unknown = firstSuggestion?.fix;
                        assertIsFixFunction(suggestionFix);

                        let replacementText = "";

                        suggestionFix({
                            replaceText(node, text): unknown {
                                expect(node).toEqual(ifNode);

                                replacementText = text;

                                return text;
                            },
                        });

                        expect(replacementText).toBe(
                            `assertError(${expressionTemplate.expressionText});`
                        );

                        const suggestedCode =
                            code.slice(0, ifNode.range[0]) +
                            replacementText +
                            code.slice(ifNode.range[1]);

                        expect(() => {
                            parser.parseForESLint(suggestedCode, parserOptions);
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
                    messageId: "preferTsExtrasAssertError",
                },
                {
                    messageId: "preferTsExtrasAssertError",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture assert-error guard patterns",
        },
        {
            code: inlineInvalidCode,
            errors: [
                {
                    messageId: "preferTsExtrasAssertError",
                    suggestions: [
                        {
                            messageId: "suggestTsExtrasAssertError",
                            output: inlineInvalidSuggestionOutputCode,
                        },
                    ],
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports negated instanceof Error guard",
        },
        {
            code: privateIdentifierValidCode,
            errors: [
                {
                    messageId: "preferTsExtrasAssertError",
                    suggestions: [
                        {
                            messageId: "suggestTsExtrasAssertError",
                            output: privateIdentifierInvalidSuggestionOutputCode,
                        },
                    ],
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports private field instanceof Error guard",
        },
        {
            code: inlineInvalidDirectThrowConsequentCode,
            errors: [
                {
                    messageId: "preferTsExtrasAssertError",
                    suggestions: [
                        {
                            messageId: "suggestTsExtrasAssertError",
                            output: inlineInvalidSuggestionOutputCode,
                        },
                    ],
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports direct-throw instanceof Error guard",
        },
        {
            code: inlineSuggestableCode,
            errors: [
                {
                    messageId: "preferTsExtrasAssertError",
                    suggestions: [
                        {
                            messageId: "suggestTsExtrasAssertError",
                            output: inlineSuggestableOutput,
                        },
                    ],
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "suggests assertError() replacement when import is in scope",
        },
    ],
    valid: [
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
            name: "accepts fixture-safe patterns",
        },
        {
            code: nonErrorInstanceofValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores instanceof TypeError guard",
        },
        {
            code: nonThrowOnlyValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores guard block with extra side effect",
        },
        {
            code: singleExpressionConsequentValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores guard block without throw statement",
        },
        {
            code: throwThenTrailingStatementValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores guard block with throw plus trailing statement",
        },
        {
            code: nonNegatedInstanceofValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores non-negated instanceof Error guard",
        },
        {
            code: nonInstanceofBinaryValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores non-instanceof binary guard",
        },
        {
            code: nonBlockNonThrowConsequentValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores non-block non-throw consequent guards",
        },
        {
            code: unaryNonBinaryArgumentValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores negated guards with non-binary expressions",
        },
        {
            code: nonIdentifierInstanceofRightValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores instanceof guards whose right-hand side is not an identifier",
        },
        {
            code: unaryNonNegationValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores unary guards that are not logical negation",
        },
        {
            code: shadowedErrorBindingValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores instanceof guard when Error binding is shadowed",
        },
    ],
});
