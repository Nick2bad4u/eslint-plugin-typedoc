/**
 * @packageDocumentation
 * Vitest coverage for `prefer-ts-extras-not.test` behavior.
 */
import parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";
import fc from "fast-check";
import { describe, expect, it, vi } from "vitest";

import {
    fastCheckRunConfig,
    isSafeGeneratedIdentifier,
} from "./_internal/fast-check";
import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
import { getPluginRule } from "./_internal/ruleTester";
import { getSelectorAwareNodeListener } from "./_internal/selector-aware-listener";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const rule = getPluginRule("prefer-ts-extras-not");
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-not.valid.ts";
const invalidFixtureName = "prefer-ts-extras-not.invalid.ts";
const inlineInvalidArrowNegatedPredicateCode = [
    "declare function isPresent<TValue>(value: TValue): value is NonNullable<TValue>;",
    "declare const nullableEntries: readonly (null | string)[];",
    "",
    "const missingEntries = nullableEntries.filter((value) => !isPresent(value));",
    "",
    "String(missingEntries.length);",
].join("\n");
const inlineInvalidArrowNegatedPredicateOutput = [
    'import { not } from "ts-extras";',
    "declare function isPresent<TValue>(value: TValue): value is NonNullable<TValue>;",
    "declare const nullableEntries: readonly (null | string)[];",
    "",
    "const missingEntries = nullableEntries.filter(not(isPresent));",
    "",
    "String(missingEntries.length);",
].join("\n");
const inlineValidFilterWithoutArgumentsCode = [
    "declare const nullableEntries: readonly (null | string)[];",
    "",
    "const maybeEntries = nullableEntries.filter();",
    "",
    "String(maybeEntries.length);",
].join("\n");
const inlineValidMapNegatedPredicateCode = [
    "declare function isPresent<TValue>(value: TValue): value is NonNullable<TValue>;",
    "declare const nullableEntries: readonly (null | string)[];",
    "",
    "const mappedEntries = nullableEntries.map((value) => !isPresent(value));",
    "",
    "String(mappedEntries.length);",
].join("\n");
const inlineValidPrivateFilterMethodCode = [
    "declare function isPresent<TValue>(value: TValue): value is NonNullable<TValue>;",
    "",
    "class Store {",
    "    #filter(predicate: (value: null | string) => boolean): readonly (null | string)[] {",
    '        return [null, "ok"].filter(predicate);',
    "    }",
    "",
    "    run(): readonly (null | string)[] {",
    "        return this.#filter((value) => !isPresent(value));",
    "    }",
    "}",
    "",
    "const instance = new Store();",
    "String(instance.run().length);",
].join("\n");
const inlineValidOptionalChainFilterCode = [
    "declare function isPresent<TValue>(value: TValue): value is NonNullable<TValue>;",
    "declare const nullableEntries: undefined | readonly (null | string)[];",
    "",
    "const missingEntries = nullableEntries?.filter((value) => !isPresent(value));",
    "",
    "String(missingEntries);",
].join("\n");
const inlineValidFunctionExpressionCallbackCode = [
    "declare function isPresent<TValue>(value: TValue): value is NonNullable<TValue>;",
    "declare const nullableEntries: readonly (null | string)[];",
    "",
    "const missingEntries = nullableEntries.filter(function (value) {",
    "    return !isPresent(value);",
    "});",
    "",
    "String(missingEntries.length);",
].join("\n");
const inlineValidTwoParamsCode = [
    "declare function isPresent<TValue>(value: TValue): value is NonNullable<TValue>;",
    "declare const nullableEntries: readonly (null | string)[];",
    "",
    "const missingEntries = nullableEntries.filter((value, index) => !isPresent(value));",
    "",
    "String(index);",
    "String(missingEntries.length);",
].join("\n");
const inlineValidNonIdentifierParameterCode = [
    "declare function isPresent<TValue>(value: TValue): value is NonNullable<TValue>;",
    "declare const nullableEntries: readonly (null | string)[];",
    "",
    "const missingEntries = nullableEntries.filter(([value]) => !isPresent(value));",
    "",
    "String(missingEntries.length);",
].join("\n");
const inlineValidNotUnaryExpressionCode = [
    "declare function isPresent<TValue>(value: TValue): value is NonNullable<TValue>;",
    "declare const nullableEntries: readonly (null | string)[];",
    "",
    "const missingEntries = nullableEntries.filter((value) => isPresent(value));",
    "",
    "String(missingEntries.length);",
].join("\n");
const inlineValidUnaryNotCallExpressionCode = [
    "declare const nullableEntries: readonly (null | string)[];",
    "",
    "const missingEntries = nullableEntries.filter((value) => !value);",
    "",
    "String(missingEntries.length);",
].join("\n");
const inlineValidPredicateWithTwoArgumentsCode = [
    "declare function isPresent<TValue>(value: TValue, fallback: TValue): value is NonNullable<TValue>;",
    "declare const nullableEntries: readonly (null | string)[];",
    "",
    "const missingEntries = nullableEntries.filter((value) => !isPresent(value, value));",
    "",
    "String(missingEntries.length);",
].join("\n");
const inlineValidMismatchedArgumentNameCode = [
    "declare function isPresent<TValue>(value: TValue): value is NonNullable<TValue>;",
    "declare const nullableEntries: readonly (null | string)[];",
    "declare const differentValue: null | string;",
    "",
    "const missingEntries = nullableEntries.filter((value) => !isPresent(differentValue));",
    "",
    "String(value);",
    "String(missingEntries.length);",
].join("\n");
const inlineValidIdentifierCallbackCode = [
    "declare function isPresent<TValue>(value: TValue): value is NonNullable<TValue>;",
    "declare const nullableEntries: readonly (null | string)[];",
    "",
    "const isMissing = (value: null | string): boolean => !isPresent(value);",
    "const missingEntries = nullableEntries.filter(isMissing);",
    "",
    "String(missingEntries.length);",
].join("\n");
const inlineValidUnaryPlusPredicateCallCode = [
    "declare function isPresent<TValue>(value: TValue): value is NonNullable<TValue>;",
    "declare const nullableEntries: readonly (null | string)[];",
    "",
    "const mapped = nullableEntries.filter((value) => +isPresent(value));",
    "",
    "String(mapped.length);",
].join("\n");
const inlineValidMemberCalleePredicateCode = [
    "declare const predicates: { isPresent<TValue>(value: TValue): value is NonNullable<TValue> };",
    "declare const nullableEntries: readonly (null | string)[];",
    "",
    "const missingEntries = nullableEntries.filter((value) => !predicates.isPresent(value));",
    "",
    "String(missingEntries.length);",
].join("\n");
const inlineFixableCode = [
    'import { not } from "ts-extras";',
    "",
    "declare function isPresent<TValue>(value: TValue): value is NonNullable<TValue>;",
    "declare const nullableEntries: readonly (null | string)[];",
    "",
    "const missingEntries = nullableEntries.filter((value) => !isPresent(value));",
    "",
    "String(missingEntries.length);",
].join("\n");
const inlineFixableOutput = [
    'import { not } from "ts-extras";',
    "",
    "declare function isPresent<TValue>(value: TValue): value is NonNullable<TValue>;",
    "declare const nullableEntries: readonly (null | string)[];",
    "",
    "const missingEntries = nullableEntries.filter(not(isPresent));",
    "",
    "String(missingEntries.length);",
].join("\n");

const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;

const callbackParameterNameArbitrary = fc
    .string({ maxLength: 9, minLength: 1 })
    .filter((candidate) => isSafeGeneratedIdentifier(candidate));
const predicateNameArbitrary = fc
    .string({ maxLength: 9, minLength: 1 })
    .filter((candidate) => isSafeGeneratedIdentifier(candidate))
    .filter((name) => name !== "not");

const parseFilterCallFromCode = (
    sourceText: string
): Readonly<{
    ast: ReturnType<typeof parser.parseForESLint>["ast"];
    callbackRange: readonly [number, number];
    callExpression: TSESTree.CallExpression;
}> => {
    const parsedResult = parser.parseForESLint(sourceText, parserOptions);
    let callExpression: null | TSESTree.CallExpression = null;

    for (const statement of parsedResult.ast.body) {
        if (statement.type === AST_NODE_TYPES.VariableDeclaration) {
            for (const declaration of statement.declarations) {
                if (declaration.init?.type === AST_NODE_TYPES.CallExpression) {
                    callExpression = declaration.init;
                    break;
                }
            }
        }

        if (callExpression) {
            break;
        }
    }

    if (!callExpression) {
        throw new Error(
            "Expected generated code to contain a variable declaration initialized from a call expression"
        );
    }

    const callback = callExpression.arguments[0];

    if (callback?.type !== AST_NODE_TYPES.ArrowFunctionExpression) {
        throw new Error(
            "Expected generated filter call to include an arrow function callback"
        );
    }

    return {
        ast: parsedResult.ast,
        callbackRange: callback.range,
        callExpression,
    };
};

addTypeFestRuleMetadataSmokeTests("prefer-ts-extras-not", {
    defaultOptions: [],
    docsDescription:
        "require ts-extras not helper over inline negated predicate callbacks in filter calls.",
    enforceRuleShape: true,
    messages: {
        preferTsExtrasNot:
            "Prefer `not(<predicate>)` from `ts-extras` over inline `value => !predicate(value)` callbacks.",
    },
    name: "prefer-ts-extras-not",
});

describe("prefer-ts-extras-not internal listener guards", () => {
    it("reports without a fix when predicate text trims to empty", async () => {
        const reportCalls: Readonly<{ fix?: unknown; messageId?: string }>[] =
            [];

        try {
            vi.resetModules();

            const authoredRuleModule =
                (await import("../src/rules/prefer-ts-extras-not")) as {
                    default: {
                        create: (context: unknown) => {
                            CallExpression?: (node: unknown) => void;
                        };
                    };
                };

            const listeners = authoredRuleModule.default.create({
                filename: "src/example.ts",
                report(
                    descriptor: Readonly<{ fix?: unknown; messageId?: string }>
                ) {
                    reportCalls.push(descriptor);
                },
                sourceCode: {
                    ast: {
                        body: [],
                    },
                    getText: () => "   ",
                },
            });

            const callExpressionListener = getSelectorAwareNodeListener(
                listeners,
                "CallExpression"
            );

            callExpressionListener?.({
                arguments: [
                    {
                        body: {
                            argument: {
                                arguments: [
                                    {
                                        name: "value",
                                        type: "Identifier",
                                    },
                                ],
                                callee: {
                                    name: "isPresent",
                                    type: "Identifier",
                                },
                                optional: false,
                                type: "CallExpression",
                            },
                            operator: "!",
                            prefix: true,
                            type: "UnaryExpression",
                        },
                        params: [
                            {
                                name: "value",
                                type: "Identifier",
                            },
                        ],
                        type: "ArrowFunctionExpression",
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
            });

            expect(reportCalls).toHaveLength(1);

            const [firstReport] = reportCalls;

            expect(firstReport).toBeDefined();

            if (!firstReport) {
                throw new TypeError(
                    "Expected first prefer-ts-extras-not report"
                );
            }

            expect(firstReport).toMatchObject({
                messageId: "preferTsExtrasNot",
            });
            expect("fix" in firstReport).toBeFalsy();
        } finally {
            vi.resetModules();
        }
    });

    it("fast-check: identifier predicate callbacks report with fix and parseable replacement", async () => {
        expect.hasAssertions();

        try {
            vi.resetModules();

            const createSafeValueNodeTextReplacementFixMock = vi.fn(
                () => "FIX"
            );

            vi.doMock(
                import("../src/_internal/imported-value-symbols.js"),
                () => ({
                    collectDirectNamedValueImportsFromSource: () =>
                        new Set<string>(),
                    createSafeValueNodeTextReplacementFix:
                        createSafeValueNodeTextReplacementFixMock,
                })
            );

            const authoredRuleModule =
                (await import("../src/rules/prefer-ts-extras-not")) as {
                    default: {
                        create: (context: unknown) => {
                            CallExpression?: (node: unknown) => void;
                        };
                    };
                };

            fc.assert(
                fc.property(
                    callbackParameterNameArbitrary,
                    predicateNameArbitrary,
                    fc.boolean(),
                    (
                        callbackParameterName,
                        predicateName,
                        includeUnicodeLine
                    ) => {
                        createSafeValueNodeTextReplacementFixMock.mockClear();

                        const unicodeLine = includeUnicodeLine
                            ? 'const note = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻";'
                            : "";

                        const generatedCode = [
                            "declare const nullableEntries: readonly (null | string)[];",
                            `declare function ${predicateName}<TValue>(value: TValue): boolean;`,
                            unicodeLine,
                            `const missingEntries = nullableEntries.filter((${callbackParameterName}) => !${predicateName}(${callbackParameterName}));`,
                            "String(missingEntries.length);",
                        ]
                            .filter((line) => line.length > 0)
                            .join("\n");

                        const { ast, callbackRange, callExpression } =
                            parseFilterCallFromCode(generatedCode);

                        const reports: Readonly<{
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
                                reports.push(descriptor);
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

                                    const maybeRange = (
                                        node as Readonly<{
                                            range?: readonly [number, number];
                                        }>
                                    ).range;

                                    if (!maybeRange) {
                                        return "";
                                    }

                                    const [start, end] = maybeRange;
                                    return generatedCode.slice(start, end);
                                },
                            },
                        });

                        const callExpressionListener =
                            getSelectorAwareNodeListener(
                                listeners,
                                "CallExpression"
                            );

                        callExpressionListener?.(callExpression);

                        expect(reports).toHaveLength(1);
                        expect(reports[0]).toMatchObject({
                            fix: "FIX",
                            messageId: "preferTsExtrasNot",
                        });
                        expect(
                            createSafeValueNodeTextReplacementFixMock
                        ).toHaveBeenCalledTimes(1);

                        const [callbackStart, callbackEnd] = callbackRange;
                        const replacedCode = `${generatedCode.slice(
                            0,
                            callbackStart
                        )}not(${predicateName})${generatedCode.slice(
                            callbackEnd
                        )}`;

                        expect(() => {
                            parser.parseForESLint(replacedCode, parserOptions);
                        }).not.toThrow();
                    }
                ),
                fastCheckRunConfig.default
            );
        } finally {
            vi.doUnmock("../src/_internal/imported-value-symbols.js");
            vi.resetModules();
        }
    });

    it("fast-check: member predicate callbacks report without fix", async () => {
        expect.hasAssertions();

        try {
            vi.resetModules();

            const createSafeValueNodeTextReplacementFixMock = vi.fn(
                () => "FIX"
            );

            vi.doMock(
                import("../src/_internal/imported-value-symbols.js"),
                () => ({
                    collectDirectNamedValueImportsFromSource: () =>
                        new Set<string>(),
                    createSafeValueNodeTextReplacementFix:
                        createSafeValueNodeTextReplacementFixMock,
                })
            );

            const authoredRuleModule =
                (await import("../src/rules/prefer-ts-extras-not")) as {
                    default: {
                        create: (context: unknown) => {
                            CallExpression?: (node: unknown) => void;
                        };
                    };
                };

            fc.assert(
                fc.property(
                    callbackParameterNameArbitrary,
                    predicateNameArbitrary,
                    (callbackParameterName, predicateName) => {
                        createSafeValueNodeTextReplacementFixMock.mockClear();

                        const generatedCode = [
                            "declare const nullableEntries: readonly (null | string)[];",
                            `declare const predicates: { ${predicateName}<TValue>(value: TValue): boolean };`,
                            `const missingEntries = nullableEntries.filter((${callbackParameterName}) => !predicates.${predicateName}(${callbackParameterName}));`,
                            "String(missingEntries.length);",
                        ].join("\n");

                        const { ast, callExpression } =
                            parseFilterCallFromCode(generatedCode);
                        const reports: Readonly<{
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
                                reports.push(descriptor);
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

                                    const maybeRange = (
                                        node as Readonly<{
                                            range?: readonly [number, number];
                                        }>
                                    ).range;

                                    if (!maybeRange) {
                                        return "";
                                    }

                                    const [start, end] = maybeRange;
                                    return generatedCode.slice(start, end);
                                },
                            },
                        });

                        const callExpressionListener =
                            getSelectorAwareNodeListener(
                                listeners,
                                "CallExpression"
                            );

                        callExpressionListener?.(callExpression);

                        expect(reports).toHaveLength(1);

                        const [firstReport] = reports;

                        expect(firstReport).toBeDefined();

                        if (!firstReport) {
                            throw new TypeError(
                                "Expected first prefer-ts-extras-not report"
                            );
                        }

                        expect(firstReport).toMatchObject({
                            messageId: "preferTsExtrasNot",
                        });
                        expect("fix" in firstReport).toBeFalsy();
                        expect(
                            createSafeValueNodeTextReplacementFixMock
                        ).not.toHaveBeenCalled();
                    }
                ),
                fastCheckRunConfig.default
            );
        } finally {
            vi.doUnmock("../src/_internal/imported-value-symbols.js");
            vi.resetModules();
        }
    });

    it("fast-check: optional-call predicate callbacks are ignored", async () => {
        expect.hasAssertions();

        try {
            vi.resetModules();

            const createSafeValueNodeTextReplacementFixMock = vi.fn(
                () => "FIX"
            );

            vi.doMock(
                import("../src/_internal/imported-value-symbols.js"),
                () => ({
                    collectDirectNamedValueImportsFromSource: () =>
                        new Set<string>(),
                    createSafeValueNodeTextReplacementFix:
                        createSafeValueNodeTextReplacementFixMock,
                })
            );

            const authoredRuleModule =
                (await import("../src/rules/prefer-ts-extras-not")) as {
                    default: {
                        create: (context: unknown) => {
                            CallExpression?: (node: unknown) => void;
                        };
                    };
                };

            fc.assert(
                fc.property(
                    callbackParameterNameArbitrary,
                    predicateNameArbitrary,
                    (callbackParameterName, predicateName) => {
                        createSafeValueNodeTextReplacementFixMock.mockClear();

                        const generatedCode = [
                            "declare const nullableEntries: readonly (null | string)[];",
                            `declare let ${predicateName}: undefined | ((value: null | string) => boolean);`,
                            `const missingEntries = nullableEntries.filter((${callbackParameterName}) => !${predicateName}?.(${callbackParameterName}));`,
                            "String(missingEntries.length);",
                        ].join("\n");

                        const { ast, callExpression } =
                            parseFilterCallFromCode(generatedCode);
                        const reports: Readonly<{
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
                                reports.push(descriptor);
                            },
                            sourceCode: {
                                ast,
                                getText: () => generatedCode,
                            },
                        });

                        const callExpressionListener =
                            getSelectorAwareNodeListener(
                                listeners,
                                "CallExpression"
                            );

                        callExpressionListener?.(callExpression);

                        expect(reports).toHaveLength(0);
                        expect(
                            createSafeValueNodeTextReplacementFixMock
                        ).not.toHaveBeenCalled();
                    }
                ),
                fastCheckRunConfig.default
            );
        } finally {
            vi.doUnmock("../src/_internal/imported-value-symbols.js");
            vi.resetModules();
        }
    });
});

ruleTester.run("prefer-ts-extras-not", rule, {
    invalid: [
        {
            code: readTypedFixture(invalidFixtureName),
            errors: [
                {
                    messageId: "preferTsExtrasNot",
                },
                {
                    messageId: "preferTsExtrasNot",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture negated predicate filter callbacks",
        },
        {
            code: inlineInvalidArrowNegatedPredicateCode,
            errors: [{ messageId: "preferTsExtrasNot" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports inline negated predicate in filter callback",
            output: inlineInvalidArrowNegatedPredicateOutput,
        },
        {
            code: inlineFixableCode,
            errors: [{ messageId: "preferTsExtrasNot" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes negated filter callback when not import is in scope",
            output: inlineFixableOutput,
        },
        {
            code: inlineValidMemberCalleePredicateCode,
            errors: [{ messageId: "preferTsExtrasNot" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports negated member-callee predicate callback without autofix",
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
            code: inlineValidFilterWithoutArgumentsCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores filter invocation without callback",
        },
        {
            code: inlineValidMapNegatedPredicateCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores negated predicate inside non-filter map callback",
        },
        {
            code: inlineValidPrivateFilterMethodCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores negated predicate inside private #filter method calls",
        },
        {
            code: inlineValidOptionalChainFilterCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores optional-chain filter calls",
        },
        {
            code: inlineValidFunctionExpressionCallbackCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores function-expression filter callback",
        },
        {
            code: inlineValidTwoParamsCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores filter callback with additional index parameter",
        },
        {
            code: inlineValidNonIdentifierParameterCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores callback with non-identifier parameter pattern",
        },
        {
            code: inlineValidNotUnaryExpressionCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores callback that does not use unary not",
        },
        {
            code: inlineValidUnaryNotCallExpressionCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores unary not expression not wrapping call expression",
        },
        {
            code: inlineValidPredicateWithTwoArgumentsCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores predicate call with extra arguments",
        },
        {
            code: inlineValidMismatchedArgumentNameCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores predicate call with mismatched callback argument",
        },
        {
            code: inlineValidIdentifierCallbackCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores filter callback provided as identifier",
        },
        {
            code: inlineValidUnaryPlusPredicateCallCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores unary expressions over predicate calls when operator is not not",
        },
    ],
});
