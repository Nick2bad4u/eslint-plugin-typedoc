import parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";
import fc from "fast-check";
import { describe, expect, it, vi } from "vitest";

import { fastCheckRunConfig } from "./_internal/fast-check";
/**
 * @packageDocumentation
 * Shared testing utilities for eslint-plugin-typefest RuleTester and Vitest suites.
 */
import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
import { getPluginRule } from "./_internal/ruleTester";
import { getSelectorAwareNodeListener } from "./_internal/selector-aware-listener";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleId = "prefer-ts-extras-is-defined-filter";
const docsDescription =
    "require ts-extras isDefined in Array.filter callbacks instead of inline undefined checks.";
const docsUrl =
    "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-is-defined-filter";
const preferTsExtrasIsDefinedFilterMessage =
    "Prefer `isDefined` from `ts-extras` in `filter(...)` callbacks over inline undefined comparisons.";

const rule = getPluginRule(ruleId);
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-is-defined-filter.valid.ts";
const invalidFixtureName = "prefer-ts-extras-is-defined-filter.invalid.ts";
const invalidFixtureCode = readTypedFixture(invalidFixtureName);

const inlineInvalidCode = [
    "const values: Array<number | undefined> = [1, undefined, 2];",
    "const definedValues = values.filter((value) => value !== undefined);",
    "String(definedValues);",
].join("\n");
const inlineInvalidOutput = [
    'import { isDefined } from "ts-extras";',
    "const values: Array<number | undefined> = [1, undefined, 2];",
    "const definedValues = values.filter(isDefined);",
    "String(definedValues);",
].join("\n");

const inlineInvalidRightSideCode = [
    "const values: Array<number | undefined> = [1, undefined, 2];",
    "const definedValues = values.filter((value) => undefined !== value);",
    "String(definedValues);",
].join("\n");
const inlineInvalidLooseCode = [
    "const values: Array<number | undefined> = [1, undefined, 2];",
    "const definedValues = values.filter((value) => value != undefined);",
    "String(definedValues);",
].join("\n");
const inlineInvalidLooseOutput = [
    'import { isDefined } from "ts-extras";',
    "const values: Array<number | undefined> = [1, undefined, 2];",
    "const definedValues = values.filter(isDefined);",
    "String(definedValues);",
].join("\n");
const inlineInvalidLooseRightSideCode = [
    "const values: Array<number | undefined> = [1, undefined, 2];",
    "const definedValues = values.filter((value) => undefined != value);",
    "String(definedValues);",
].join("\n");
const inlineInvalidLooseRightSideOutput = [
    'import { isDefined } from "ts-extras";',
    "const values: Array<number | undefined> = [1, undefined, 2];",
    "const definedValues = values.filter(isDefined);",
    "String(definedValues);",
].join("\n");
const inlineInvalidRightSideOutput = [
    'import { isDefined } from "ts-extras";',
    "const values: Array<number | undefined> = [1, undefined, 2];",
    "const definedValues = values.filter(isDefined);",
    "String(definedValues);",
].join("\n");
const typeofInvalidCode = [
    "const values: Array<number | undefined> = [1, undefined, 2];",
    "const definedValues = values.filter((value) => typeof value !== 'undefined');",
    "String(definedValues);",
].join("\n");
const typeofInvalidOutput = [
    'import { isDefined } from "ts-extras";',
    "const values: Array<number | undefined> = [1, undefined, 2];",
    "const definedValues = values.filter(isDefined);",
    "String(definedValues);",
].join("\n");
const typeofRightInvalidCode = [
    "const values: Array<number | undefined> = [1, undefined, 2];",
    "const definedValues = values.filter((value) => 'undefined' !== typeof value);",
    "String(definedValues);",
].join("\n");
const strictEqualityUndefinedValidCode = [
    "const values: Array<number | undefined> = [1, undefined, 2];",
    "const definedValues = values.filter((value) => value === undefined);",
    "String(definedValues);",
].join("\n");
const nonUndefinedLooseComparisonValidCode = [
    "const values: Array<number | null> = [1, null, 2];",
    "const definedValues = values.filter((value) => value != null);",
    "String(definedValues);",
].join("\n");
const differentIdentifierComparisonValidCode = [
    "const values: Array<number | undefined> = [1, undefined, 2];",
    "declare const otherValue: number | undefined;",
    "const definedValues = values.filter((value) => otherValue !== undefined);",
    "String(values.length + definedValues.length);",
].join("\n");
const undefinedAliasComparisonValidCode = [
    "const values: Array<number | undefined> = [1, undefined, 2];",
    "declare const undefinedAlias: undefined;",
    "const definedValues = values.filter((value) => value !== undefinedAlias);",
    "String(values.length + definedValues.length);",
].join("\n");
const typeofNonUndefinedLiteralValidCode = [
    "const values: Array<number | undefined> = [1, undefined, 2];",
    "const definedValues = values.filter((value) => typeof value !== 'void');",
    "String(values.length + definedValues.length);",
].join("\n");
const identifierBodyValidCode = [
    "const values: Array<number | undefined> = [1, undefined, 2];",
    "const definedValues = values.filter((value) => value);",
    "String(definedValues);",
].join("\n");
const shadowedUndefinedBindingValidCode = [
    "const values: Array<number | undefined> = [1, undefined, 2];",
    "const undefined = Symbol('undefined');",
    "const definedValues = values.filter((value) => value !== undefined);",
    "String(values.length + definedValues.length);",
].join("\n");

const nonFilterValidCode = [
    "const values: Array<number | undefined> = [1, undefined, 2];",
    "const definedValues = values.map((value) => value);",
    "String(definedValues);",
].join("\n");
const noArgumentValidCode = [
    "const values: Array<number | undefined> = [1, undefined, 2];",
    "const definedValues = values.filter();",
    "String(definedValues);",
].join("\n");
const functionExpressionValidCode = [
    "const values: Array<number | undefined> = [1, undefined, 2];",
    "const definedValues = values.filter(function (value) {",
    "    return value !== undefined;",
    "});",
    "String(definedValues);",
].join("\n");
const blockBodyArrowValidCode = [
    "const values: Array<number | undefined> = [1, undefined, 2];",
    "const definedValues = values.filter((value) => {",
    "    return value !== undefined;",
    "});",
    "String(definedValues);",
].join("\n");
const twoParamsArrowValidCode = [
    "const values: Array<number | undefined> = [1, undefined, 2];",
    "const definedValues = values.filter((value, index) => value !== undefined && index >= 0);",
    "String(definedValues);",
].join("\n");
const destructuredParamValidCode = [
    "const values: Array<{ value: number | undefined }> = [{ value: 1 }, { value: undefined }];",
    "const definedValues = values.filter(({ value }) => value !== undefined);",
    "String(definedValues);",
].join("\n");

const computedFilterValidCode = [
    "const values: Array<number | undefined> = [1, undefined, 2];",
    'const definedValues = values["filter"]((value) => value !== undefined);',
    "String(definedValues);",
].join("\n");
const optionalFilterCallValidCode = [
    "const values: Array<number | undefined> | undefined = [1, undefined, 2];",
    "const definedValues = values?.filter((value) => value !== undefined);",
    "String(definedValues);",
].join("\n");

const inlineFixableCode = [
    'import { isDefined } from "ts-extras";',
    "",
    "const values: Array<number | undefined> = [1, undefined, 2];",
    "const definedValues = values.filter((value) => value !== undefined);",
    "String(definedValues);",
].join("\n");
const inlineFixableOutput = [
    'import { isDefined } from "ts-extras";',
    "",
    "const values: Array<number | undefined> = [1, undefined, 2];",
    "const definedValues = values.filter(isDefined);",
    "String(definedValues);",
].join("\n");

type UndefinedGuardTemplateId =
    | "looseLeft"
    | "looseRight"
    | "strictLeft"
    | "strictRight"
    | "typeofLeft"
    | "typeofRight";

const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;

const callbackParameterNameArbitrary = fc.constantFrom(
    "value",
    "entry",
    "candidate"
);

const undefinedGuardTemplateIdArbitrary =
    fc.constantFrom<UndefinedGuardTemplateId>(
        "looseLeft",
        "looseRight",
        "strictLeft",
        "strictRight",
        "typeofLeft",
        "typeofRight"
    );

const formatUndefinedGuardExpression = (
    templateId: UndefinedGuardTemplateId,
    parameterName: string
): string => {
    if (templateId === "looseLeft") {
        return `${parameterName} != undefined`;
    }

    if (templateId === "looseRight") {
        return `undefined != ${parameterName}`;
    }

    if (templateId === "strictLeft") {
        return `${parameterName} !== undefined`;
    }

    if (templateId === "strictRight") {
        return `undefined !== ${parameterName}`;
    }

    if (templateId === "typeofLeft") {
        return `typeof ${parameterName} !== "undefined"`;
    }

    return `"undefined" !== typeof ${parameterName}`;
};

const parseFilterCallFromCode = (
    sourceText: string
): Readonly<{
    ast: ReturnType<typeof parser.parseForESLint>["ast"];
    callbackRange: readonly [number, number];
    callExpression: TSESTree.CallExpression;
}> => {
    const parsed = parser.parseForESLint(sourceText, parserOptions);
    let callExpression: null | TSESTree.CallExpression = null;

    for (const statement of parsed.ast.body) {
        if (statement.type === AST_NODE_TYPES.VariableDeclaration) {
            for (const declaration of statement.declarations) {
                if (declaration.init?.type === AST_NODE_TYPES.CallExpression) {
                    callExpression = declaration.init;
                    break;
                }
            }
        }

        if (callExpression !== null) {
            break;
        }
    }

    if (callExpression === null) {
        throw new Error(
            "Expected generated source text to initialize from a filter call"
        );
    }

    const callback = callExpression.arguments[0];

    if (callback?.type !== AST_NODE_TYPES.ArrowFunctionExpression) {
        throw new Error(
            "Expected generated filter call to include an arrow-function callback"
        );
    }

    return {
        ast: parsed.ast,
        callbackRange: callback.range,
        callExpression,
    };
};

addTypeFestRuleMetadataSmokeTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    enforceRuleShape: true,
    messages: {
        preferTsExtrasIsDefinedFilter: preferTsExtrasIsDefinedFilterMessage,
    },
    name: ruleId,
});

describe("prefer-ts-extras-is-defined-filter metadata literals", () => {
    it("declares the authored docs URL literal", () => {
        expect(rule.meta.docs?.url).toBe(docsUrl);
    });
});

describe("prefer-ts-extras-is-defined-filter internal listener guards", () => {
    it("ignores non-Identifier filter property and non-callback first argument", async () => {
        const reportCalls: { messageId?: string }[] = [];

        try {
            vi.resetModules();

            vi.doMock(import("../src/_internal/typed-rule.js"), () => ({
                createTypedRule: createTypedRuleSelectorAwarePassThrough,
                isGlobalUndefinedIdentifier: (
                    _context: unknown,
                    expression: Readonly<{ name?: string; type: string }>
                ) =>
                    expression.type === "Identifier" &&
                    expression.name === "undefined",
            }));

            vi.doMock(
                import("../src/_internal/imported-value-symbols.js"),
                () => ({
                    collectDirectNamedValueImportsFromSource: () =>
                        new Set<string>(),
                    createSafeValueReferenceReplacementFix: () => null,
                })
            );

            const authoredRuleModule =
                (await import("../src/rules/prefer-ts-extras-is-defined-filter")) as {
                    default: {
                        create: (context: unknown) => {
                            CallExpression?: (node: unknown) => void;
                        };
                    };
                };

            const listeners = authoredRuleModule.default.create({
                filename: "src/example.ts",
                report(descriptor: Readonly<{ messageId?: string }>) {
                    reportCalls.push(descriptor);
                },
                sourceCode: {
                    getText: () => "value",
                },
            });

            const callExpressionListener = listeners.CallExpression;

            expect(callExpressionListener).toBeTypeOf("function");

            const privateFilterPropertyCallNode = {
                arguments: [],
                callee: {
                    computed: false,
                    object: {
                        name: "values",
                        type: "Identifier",
                    },
                    property: {
                        name: "filter",
                        type: "PrivateIdentifier",
                    },
                    type: "MemberExpression",
                },
                type: "CallExpression",
            };

            const nonCallbackFirstArgumentCallNode = {
                arguments: [
                    {
                        name: "predicate",
                        type: "Identifier",
                    },
                ],
                callee: {
                    computed: false,
                    object: {
                        name: "values",
                        type: "Identifier",
                    },
                    property: {
                        name: "filter",
                        type: "Identifier",
                    },
                    type: "MemberExpression",
                },
                type: "CallExpression",
            };

            callExpressionListener?.(privateFilterPropertyCallNode);
            callExpressionListener?.(nonCallbackFirstArgumentCallNode);

            expect(reportCalls).toHaveLength(0);
        } finally {
            vi.doUnmock("../src/_internal/imported-value-symbols.js");
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });

    it("fast-check: supported undefined guard callbacks report and remain parseable after autofix", async () => {
        expect.hasAssertions();

        try {
            vi.resetModules();

            const createSafeValueReferenceReplacementFixMock = vi.fn(
                () => "FIX"
            );

            vi.doMock(import("../src/_internal/typed-rule.js"), () => ({
                createTypedRule: createTypedRuleSelectorAwarePassThrough,
                isGlobalUndefinedIdentifier: (
                    _context: unknown,
                    expression: Readonly<{ name?: string; type: string }>
                ) =>
                    expression.type === "Identifier" &&
                    expression.name === "undefined",
            }));

            vi.doMock(
                import("../src/_internal/imported-value-symbols.js"),
                () => ({
                    collectDirectNamedValueImportsFromSource: () => new Map(),
                    createSafeValueReferenceReplacementFix:
                        createSafeValueReferenceReplacementFixMock,
                })
            );

            const authoredRuleModule =
                (await import("../src/rules/prefer-ts-extras-is-defined-filter")) as {
                    default: {
                        create: (context: unknown) => {
                            CallExpression?: (node: unknown) => void;
                        };
                    };
                };

            fc.assert(
                fc.property(
                    callbackParameterNameArbitrary,
                    undefinedGuardTemplateIdArbitrary,
                    (parameterName, templateId) => {
                        createSafeValueReferenceReplacementFixMock.mockClear();

                        const guardExpression = formatUndefinedGuardExpression(
                            templateId,
                            parameterName
                        );

                        const code = [
                            'import { isDefined } from "ts-extras";',
                            "",
                            "declare const values: readonly (number | undefined)[];",
                            "",
                            `const definedValues = values.filter((${parameterName}) => ${guardExpression});`,
                            "",
                            "String(definedValues.length);",
                        ].join("\n");

                        const { ast, callbackRange, callExpression } =
                            parseFilterCallFromCode(code);
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
                                getText(node: unknown): string {
                                    if (
                                        typeof node !== "object" ||
                                        node === null ||
                                        !("range" in node)
                                    ) {
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

                                    return code.slice(
                                        nodeRange[0],
                                        nodeRange[1]
                                    );
                                },
                            },
                        });

                        const callExpressionListener =
                            getSelectorAwareNodeListener(
                                listeners as Readonly<Record<string, unknown>>,
                                "CallExpression"
                            );

                        callExpressionListener?.(callExpression);

                        expect(reportCalls).toHaveLength(1);
                        expect(reportCalls[0]).toMatchObject({
                            messageId: "preferTsExtrasIsDefinedFilter",
                        });

                        if (
                            createSafeValueReferenceReplacementFixMock.mock
                                .calls.length > 0
                        ) {
                            expect(
                                createSafeValueReferenceReplacementFixMock
                            ).toHaveBeenCalledTimes(1);
                        } else {
                            const reportFix = reportCalls[0]?.fix;

                            if (reportFix !== undefined) {
                                expect(typeof reportFix).toBe("function");
                            }
                        }

                        const fixedCode = `${code.slice(
                            0,
                            callbackRange[0]
                        )}isDefined${code.slice(callbackRange[1])}`;

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

const fixtureInvalidOutput = [
    "interface MonitorRecord {",
    "    readonly id: string;",
    "}",
    "",
    "declare const maybeNumbers: readonly unknown[];",
    "declare const maybeMonitors: readonly unknown[];",
    "declare const maybeStrings: readonly unknown[];",
    "",
    "const numbers = maybeNumbers.filter(",
    "    isDefined",
    ");",
    "const monitors = maybeMonitors.filter(",
    "    (monitor): monitor is MonitorRecord => monitor !== undefined",
    ");",
    "const strings = maybeStrings.filter((entry) => entry !== undefined);",
    "",
    "const totalCount = numbers.length + monitors.length + strings.length;",
    "if (totalCount < 0) {",
    '    throw new TypeError("Unreachable total count");',
    "}",
    "",
    'export const __typedFixtureModule = "typed-fixture-module";',
].join("\r\n");
const fixtureInvalidOutputWithMixedLineEndings = `import { isDefined } from "ts-extras";\n${fixtureInvalidOutput}\r\n`;
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
            `Expected prefer-ts-extras-is-defined-filter fixture text to contain replaceable segment: ${target}`
        );
    }

    return replacedText;
};

const fixtureInvalidSecondPassOutputWithMixedLineEndings = replaceOrThrow({
    replacement: "const strings = maybeStrings.filter(isDefined);\r\n",
    sourceText: replaceOrThrow({
        replacement:
            "const monitors = maybeMonitors.filter(\r\n    isDefined\r\n);\r\n",
        sourceText: fixtureInvalidOutputWithMixedLineEndings,
        target: "const monitors = maybeMonitors.filter(\r\n    (monitor): monitor is MonitorRecord => monitor !== undefined\r\n);\r\n",
    }),
    target: "const strings = maybeStrings.filter((entry) => entry !== undefined);\r\n",
});

ruleTester.run(ruleId, rule, {
    invalid: [
        {
            code: invalidFixtureCode,
            errors: [
                { messageId: "preferTsExtrasIsDefinedFilter" },
                { messageId: "preferTsExtrasIsDefinedFilter" },
                { messageId: "preferTsExtrasIsDefinedFilter" },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture filter guards for undefined",
            output: [
                fixtureInvalidOutputWithMixedLineEndings,
                fixtureInvalidSecondPassOutputWithMixedLineEndings,
            ],
        },
        {
            code: inlineInvalidCode,
            errors: [{ messageId: "preferTsExtrasIsDefinedFilter" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports arrow predicate value !== undefined",
            output: inlineInvalidOutput,
        },
        {
            code: inlineInvalidRightSideCode,
            errors: [{ messageId: "preferTsExtrasIsDefinedFilter" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports arrow predicate undefined !== value",
            output: inlineInvalidRightSideOutput,
        },
        {
            code: inlineInvalidLooseCode,
            errors: [{ messageId: "preferTsExtrasIsDefinedFilter" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports arrow predicate value != undefined",
            output: inlineInvalidLooseOutput,
        },
        {
            code: inlineInvalidLooseRightSideCode,
            errors: [{ messageId: "preferTsExtrasIsDefinedFilter" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports arrow predicate undefined != value",
            output: inlineInvalidLooseRightSideOutput,
        },
        {
            code: typeofInvalidCode,
            errors: [{ messageId: "preferTsExtrasIsDefinedFilter" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports typeof undefined predicate",
            output: typeofInvalidOutput,
        },
        {
            code: typeofRightInvalidCode,
            errors: [{ messageId: "preferTsExtrasIsDefinedFilter" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports reversed typeof undefined predicate",
            output: typeofInvalidOutput,
        },
        {
            code: inlineFixableCode,
            errors: [{ messageId: "preferTsExtrasIsDefinedFilter" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes filter callback to isDefined when import is in scope",
            output: inlineFixableOutput,
        },
    ],
    valid: [
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
            name: "accepts fixture-safe patterns",
        },
        {
            code: nonFilterValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores non-filter array method",
        },
        {
            code: noArgumentValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores filter call without callback",
        },
        {
            code: functionExpressionValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores function-expression callback",
        },
        {
            code: blockBodyArrowValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores block-body arrow callback",
        },
        {
            code: twoParamsArrowValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores callback using additional index parameter",
        },
        {
            code: destructuredParamValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores destructured callback parameter",
        },
        {
            code: strictEqualityUndefinedValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores strict equality comparison against undefined",
        },
        {
            code: nonUndefinedLooseComparisonValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores loose comparison against null",
        },
        {
            code: differentIdentifierComparisonValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores undefined comparison using non-parameter identifier",
        },
        {
            code: undefinedAliasComparisonValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores undefined alias identifier comparison",
        },
        {
            code: typeofNonUndefinedLiteralValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores typeof comparison against non-undefined literal",
        },
        {
            code: identifierBodyValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores callback returning identifier directly",
        },
        {
            code: computedFilterValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores computed filter property access",
        },
        {
            code: optionalFilterCallValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores optional-chain filter calls",
        },
        {
            code: shadowedUndefinedBindingValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores filter comparisons against shadowed undefined bindings",
        },
    ],
});
