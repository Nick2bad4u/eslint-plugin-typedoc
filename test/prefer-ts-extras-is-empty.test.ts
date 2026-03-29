/**
 * @packageDocumentation
 * Shared testing utilities for eslint-plugin-typefest RuleTester and Vitest suites.
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

const rule = getPluginRule("prefer-ts-extras-is-empty");
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-is-empty.valid.ts";
const invalidFixtureName = "prefer-ts-extras-is-empty.invalid.ts";
const leftLiteralInvalidCode = [
    "const values = [1, 2, 3];",
    "const isEmpty = 0 === values.length;",
    "String(isEmpty);",
].join("\n");
const unionTupleInvalidCode = [
    "const values: [number, ...number[]] | [string, ...string[]] = [1];",
    "const isEmpty = values.length === 0;",
    "String(isEmpty);",
].join("\n");
const mutableTupleInvalidCode = [
    "const values: [number, ...number[]] = [1, 2];",
    "const isEmpty = values.length === 0;",
    "String(isEmpty);",
].join("\n");
const arrayUnionInvalidCode = [
    "declare const values: readonly number[] | string[];",
    "const isEmpty = values.length === 0;",
    "String(isEmpty);",
].join("\n");
const nonLengthValidCode = [
    "const values = [1, 2, 3];",
    "const meta = { size: values.length };",
    "const isEmpty = meta.size === 0;",
    "String(isEmpty);",
].join("\n");
const nonEqualityValidCode = [
    "const values = [1, 2, 3];",
    "const isEmpty = values.length !== 0;",
    "String(isEmpty);",
].join("\n");
const nonZeroRightLiteralValidCode = [
    "const values = [1, 2, 3];",
    "const isEmpty = values.length === 1;",
    "String(isEmpty);",
].join("\n");
const nonZeroLeftLiteralValidCode = [
    "const values = [1, 2, 3];",
    "const isEmpty = 1 === values.length;",
    "String(isEmpty);",
].join("\n");
const nonLengthArrayLikeValidCode = [
    "declare const values: readonly number[] & { readonly size: number };",
    "const isEmpty = values.size === 0;",
    "String(isEmpty);",
].join("\n");
const mixedUnionValidCode = [
    "const values: string | string[] = 'a';",
    "const isEmpty = values.length === 0;",
    "String(isEmpty);",
].join("\n");
const unresolvedMixedUnionValidCode = [
    "declare const values: string | string[];",
    "const isEmpty = values.length === 0;",
    "String(isEmpty);",
].join("\n");
const anyTypedLengthValidCode = [
    "declare const values: any;",
    "const isEmpty = values.length === 0;",
    "String(isEmpty);",
].join("\n");
const looseEqualityInvalidCode = [
    "declare const values: readonly number[];",
    "const isEmpty = values.length == 0;",
    "String(isEmpty);",
].join("\n");
const inlineFixableCode = [
    'import { isEmpty } from "ts-extras";',
    "",
    "const values = [1, 2, 3] as const;",
    "const empty = values.length === 0;",
].join("\n");
const inlineFixableOutput = [
    'import { isEmpty } from "ts-extras";',
    "",
    "const values = [1, 2, 3] as const;",
    "const empty = isEmpty(values);",
].join("\n");

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
            `Expected prefer-ts-extras-is-empty text to contain replaceable segment: ${target}`
        );
    }

    return replacedText;
};

const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;

const includeUnicodeBannerArbitrary = fc.boolean();

const arrayExpressionKindArbitrary = fc.constantFrom<
    "arrayLiteral" | "callExpression" | "identifier" | "memberExpression"
>("arrayLiteral", "callExpression", "identifier", "memberExpression");
const comparisonOperatorFormArbitrary = fc.constantFrom<
    "leftLoose" | "leftStrict" | "rightLoose" | "rightStrict"
>("leftLoose", "leftStrict", "rightLoose", "rightStrict");

const buildArrayExpressionTemplate = (
    kind: "arrayLiteral" | "callExpression" | "identifier" | "memberExpression"
): Readonly<{
    declarations: readonly string[];
    expressionText: string;
}> => {
    if (kind === "identifier") {
        return {
            declarations: ["const values = [1, 2, 3] as const;"],
            expressionText: "values",
        };
    }

    if (kind === "memberExpression") {
        return {
            declarations: [
                "const holder = { values: [1, 2, 3] as const } as const;",
            ],
            expressionText: "holder.values",
        };
    }

    if (kind === "callExpression") {
        return {
            declarations: [
                "const getValues = (): ReadonlyArray<number> => [1, 2, 3];",
            ],
            expressionText: "getValues()",
        };
    }

    return {
        declarations: [],
        expressionText: "[1, 2, 3]",
    };
};

const buildLengthComparisonExpression = ({
    arrayExpressionText,
    comparisonOperatorForm,
}: Readonly<{
    arrayExpressionText: string;
    comparisonOperatorForm:
        | "leftLoose"
        | "leftStrict"
        | "rightLoose"
        | "rightStrict";
}>): string => {
    if (comparisonOperatorForm === "leftStrict") {
        return `0 === ${arrayExpressionText}.length`;
    }

    if (comparisonOperatorForm === "rightLoose") {
        return `${arrayExpressionText}.length == 0`;
    }

    if (comparisonOperatorForm === "rightStrict") {
        return `${arrayExpressionText}.length === 0`;
    }

    return `0 == ${arrayExpressionText}.length`;
};

const parseIsEmptyCallFromCode = (
    sourceText: string
): Readonly<{
    ast: ReturnType<typeof parser.parseForESLint>["ast"];
    callExpression: TSESTree.CallExpression;
}> => {
    const parsed = parser.parseForESLint(sourceText, parserOptions);

    for (const statement of parsed.ast.body) {
        if (
            statement.type === AST_NODE_TYPES.VariableDeclaration &&
            statement.declarations.length === 1
        ) {
            const declaration = statement.declarations[0];

            if (
                declaration?.type === AST_NODE_TYPES.VariableDeclarator &&
                declaration.init !== null &&
                declaration.init.type === AST_NODE_TYPES.CallExpression
            ) {
                return {
                    ast: parsed.ast,
                    callExpression: declaration.init,
                };
            }
        }
    }

    throw new Error(
        "Expected generated source text to include a variable initialized from an isEmpty call"
    );
};

addTypeFestRuleMetadataSmokeTests("prefer-ts-extras-is-empty", {
    defaultOptions: [],
    docsDescription:
        "require ts-extras isEmpty over direct array.length === 0 checks for consistent emptiness guards.",
    enforceRuleShape: true,
    messages: {
        preferTsExtrasIsEmpty:
            "Prefer `isEmpty` from `ts-extras` over direct `array.length === 0` checks.",
    },
    name: "prefer-ts-extras-is-empty",
});

describe("prefer-ts-extras-is-empty runtime safety assertions", () => {
    it("skips reports when parser services fail during type lookup", async () => {
        try {
            vi.resetModules();

            vi.doMock(import("../src/_internal/typed-rule.js"), () => ({
                createTypedRule: createTypedRuleSelectorAwarePassThrough,
                getTypedRuleServices: () => ({
                    checker: {
                        getTypeAtLocation: (): unknown => ({}),
                        typeToString: (): string => "never",
                    },
                    parserServices: {
                        esTreeNodeToTSNodeMap: {
                            get: (): never => {
                                throw new Error("type lookup failed");
                            },
                        },
                    },
                }),
            }));

            const undecoratedRuleModule =
                (await import("../src/rules/prefer-ts-extras-is-empty")) as {
                    default: {
                        create: (context: unknown) => {
                            BinaryExpression?: (node: unknown) => void;
                        };
                    };
                };

            const parsedResult = parser.parseForESLint(
                [
                    "const values = [1, 2, 3];",
                    "const isEmpty = values.length === 0;",
                ].join("\n"),
                {
                    ecmaVersion: "latest",
                    loc: true,
                    range: true,
                    sourceType: "module",
                }
            );

            const declarationStatement = parsedResult.ast.body[1];

            expect(declarationStatement?.type).toBe("VariableDeclaration");

            if (
                declarationStatement?.type !==
                AST_NODE_TYPES.VariableDeclaration
            ) {
                throw new Error(
                    "Expected variable declaration for length check"
                );
            }

            const firstDeclarator = declarationStatement.declarations[0];
            if (
                firstDeclarator?.init?.type !== AST_NODE_TYPES.BinaryExpression
            ) {
                throw new Error("Expected binary expression initializer");
            }

            const report = vi.fn();
            const listenerMap = undecoratedRuleModule.default.create({
                filename: "fixtures/typed/prefer-ts-extras-is-empty.invalid.ts",
                report,
                sourceCode: {
                    ast: parsedResult.ast,
                },
            });

            expect(() => {
                listenerMap.BinaryExpression?.(firstDeclarator.init);
            }).not.toThrow();

            expect(report).not.toHaveBeenCalled();
        } finally {
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });

    it("handles unstable synthetic length members without reporting", async () => {
        const report = vi.fn();

        try {
            vi.resetModules();

            vi.doMock(import("../src/_internal/typed-rule.js"), () => ({
                createTypedRule: createTypedRuleSelectorAwarePassThrough,
                getTypedRuleServices: () => ({
                    checker: {},
                    parserServices: {
                        esTreeNodeToTSNodeMap: {
                            get: () => ({ kind: "Identifier" }),
                        },
                    },
                }),
            }));

            vi.doMock(
                import("../src/_internal/imported-value-symbols.js"),
                () => ({
                    collectDirectNamedValueImportsFromSource: () =>
                        new Set<string>(),
                    createSafeValueArgumentFunctionCallFix: () => null,
                })
            );

            const authoredRuleModule =
                (await import("../src/rules/prefer-ts-extras-is-empty")) as {
                    default: {
                        create: (context: unknown) => {
                            BinaryExpression?: (node: unknown) => void;
                        };
                    };
                };

            const fallbackChecker = {
                getTypeAtLocation: () => ({
                    getProperty: () => undefined,
                    isIntersection: () => false,
                    isUnion: () => false,
                }),
            };

            const listenerMap = authoredRuleModule.default.create({
                filename: "src/example.ts",
                languageOptions: {
                    parser: {
                        meta: {
                            name: "@typescript-eslint/parser",
                        },
                    },
                },
                report,
                sourceCode: {
                    ast: {
                        body: [],
                    },
                    parserServices: {
                        esTreeNodeToTSNodeMap: {
                            get: () => ({ kind: "Identifier" }),
                        },
                        program: {
                            getTypeChecker: () => fallbackChecker,
                        },
                        tsNodeToESTreeNodeMap: new WeakMap<object, object>(),
                    },
                },
            });

            let leftTypeReadCount = 0;

            listenerMap.BinaryExpression?.({
                left: {
                    computed: false,
                    object: {
                        name: "values",
                        type: "Identifier",
                    },
                    property: {
                        name: "length",
                        type: "Identifier",
                    },
                    get type() {
                        leftTypeReadCount += 1;

                        return leftTypeReadCount === 1
                            ? "MemberExpression"
                            : "Identifier";
                    },
                },
                operator: "===",
                right: {
                    type: "Literal",
                    value: 0,
                },
                type: "BinaryExpression",
            });

            expect(report).not.toHaveBeenCalled();
        } finally {
            vi.doUnmock("../src/_internal/imported-value-symbols.js");
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });
});

describe("prefer-ts-extras-is-empty parse-safety guards", () => {
    it("fast-check: isEmpty replacement remains parseable across length-comparison variants", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                arrayExpressionKindArbitrary,
                comparisonOperatorFormArbitrary,
                includeUnicodeBannerArbitrary,
                (
                    arrayExpressionKind,
                    comparisonOperatorForm,
                    includeUnicodeBanner
                ) => {
                    const unicodeBanner = includeUnicodeBanner
                        ? 'const unicodeBanner = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻";'
                        : "";
                    const arrayExpressionTemplate =
                        buildArrayExpressionTemplate(arrayExpressionKind);
                    const comparisonExpression =
                        buildLengthComparisonExpression({
                            arrayExpressionText:
                                arrayExpressionTemplate.expressionText,
                            comparisonOperatorForm,
                        });
                    const originalCheckStatement = `const empty = ${comparisonExpression};`;
                    const replacementCheckStatement = `const empty = isEmpty(${arrayExpressionTemplate.expressionText});`;
                    const generatedCode = [
                        unicodeBanner,
                        'import { isEmpty } from "ts-extras";',
                        ...arrayExpressionTemplate.declarations,
                        originalCheckStatement,
                    ]
                        .filter((line) => line.length > 0)
                        .join("\n");

                    const replacedCode = replaceOrThrow({
                        replacement: replacementCheckStatement,
                        sourceText: generatedCode,
                        target: originalCheckStatement,
                    });

                    const { callExpression } =
                        parseIsEmptyCallFromCode(replacedCode);

                    expect(callExpression.callee.type).toBe(
                        AST_NODE_TYPES.Identifier
                    );

                    if (
                        callExpression.callee.type === AST_NODE_TYPES.Identifier
                    ) {
                        expect(callExpression.callee.name).toBe("isEmpty");
                    }

                    expect(callExpression.arguments).toHaveLength(1);
                }
            ),
            fastCheckRunConfig.default
        );
    });
});

ruleTester.run("prefer-ts-extras-is-empty", rule, {
    invalid: [
        {
            code: readTypedFixture(invalidFixtureName),
            errors: [
                {
                    messageId: "preferTsExtrasIsEmpty",
                },
                {
                    messageId: "preferTsExtrasIsEmpty",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture length===0 checks",
        },
        {
            code: leftLiteralInvalidCode,
            errors: [
                {
                    messageId: "preferTsExtrasIsEmpty",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports 0===array.length comparison",
        },
        {
            code: unionTupleInvalidCode,
            errors: [{ messageId: "preferTsExtrasIsEmpty" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports union of non-empty tuples compared against zero length",
        },
        {
            code: mutableTupleInvalidCode,
            errors: [{ messageId: "preferTsExtrasIsEmpty" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports mutable non-empty tuple length check",
        },
        {
            code: arrayUnionInvalidCode,
            errors: [{ messageId: "preferTsExtrasIsEmpty" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports union of array-like values length check",
        },
        {
            code: inlineFixableCode,
            errors: [{ messageId: "preferTsExtrasIsEmpty" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes array length equality when isEmpty import is in scope",
            output: inlineFixableOutput,
        },
        {
            code: looseEqualityInvalidCode,
            errors: [{ messageId: "preferTsExtrasIsEmpty" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports loose equality array length checks",
        },
    ],
    valid: [
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
            name: "accepts fixture-safe patterns",
        },
        {
            code: nonLengthValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores non-length property comparison",
        },
        {
            code: nonEqualityValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores non-equality length comparison",
        },
        {
            code: nonZeroRightLiteralValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores array length comparison against non-zero literal on right",
        },
        {
            code: nonZeroLeftLiteralValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores array length comparison against non-zero literal on left",
        },
        {
            code: nonLengthArrayLikeValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores non-length property comparisons even on array-like values",
        },
        {
            code: mixedUnionValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores mixed string-or-array union length check",
        },
        {
            code: unresolvedMixedUnionValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores unresolved mixed string-or-array unions when not all members are array-like",
        },
        {
            code: anyTypedLengthValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores any-typed length checks where array-likeness is not statically knowable",
        },
    ],
});
