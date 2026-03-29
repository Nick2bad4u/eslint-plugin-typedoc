/**
 * @packageDocumentation
 * Shared testing utilities for eslint-plugin-typefest RuleTester and Vitest suites.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import fc from "fast-check";
import { describe, expect, it, vi } from "vitest";

import { createMethodToFunctionCallFix } from "../src/_internal/imported-value-symbols.js";
import * as typedRuleModule from "../src/_internal/typed-rule.js";
import { fastCheckRunConfig } from "./_internal/fast-check";
import {
    computedAccessValidCode,
    declaredStringObjectInvalidCode,
    declaredStringObjectInvalidOutput,
    declaredStringUnionInvalidCode,
    declaredStringUnionInvalidOutput,
    differentStringMethodValidCode,
    inlineFixableCode,
    inlineFixableOutput,
    inlineInvalidCode,
    inlineInvalidOutput,
    intersectionStringInvalidCode,
    intersectionStringInvalidOutput,
    invalidFixtureName,
    mixedUnionInvalidCode,
    mixedUnionInvalidOutput,
    nonStringReceiverValidCode,
    unionStringInvalidCode,
    unionStringInvalidOutput,
    validFixtureName,
} from "./_internal/prefer-ts-extras-string-split-cases";
import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
import { getPluginRule } from "./_internal/ruleTester";
import { getSelectorAwareNodeListener } from "./_internal/selector-aware-listener";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;

type SplitArgumentTemplateId =
    | "empty"
    | "identifier"
    | "literal"
    | "multiple"
    | "spread";

type SplitReceiverTemplateId =
    | "callExpression"
    | "identifier"
    | "memberExpression"
    | "parenthesizedIdentifier";

const splitArgumentTemplateIdArbitrary = fc.constantFrom(
    "empty",
    "identifier",
    "literal",
    "multiple",
    "spread"
);

const splitReceiverTemplateIdArbitrary = fc.constantFrom(
    "identifier",
    "memberExpression",
    "callExpression",
    "parenthesizedIdentifier"
);

const buildSplitArgumentTemplate = (
    templateId: SplitArgumentTemplateId
): Readonly<{
    argumentsText: string;
    declarations: readonly string[];
}> => {
    if (templateId === "identifier") {
        return {
            argumentsText: "separator",
            declarations: ["declare const separator: string;"],
        };
    }

    if (templateId === "literal") {
        return {
            argumentsText: "','",
            declarations: [],
        };
    }

    if (templateId === "multiple") {
        return {
            argumentsText: "separator, 1",
            declarations: ["declare const separator: string;"],
        };
    }

    if (templateId === "spread") {
        return {
            argumentsText: "...separators",
            declarations: ["declare const separators: string[];"],
        };
    }

    return {
        argumentsText: "",
        declarations: [],
    };
};

const buildSplitReceiverTemplate = (
    templateId: SplitReceiverTemplateId
): Readonly<{
    declarations: readonly string[];
    receiverText: string;
}> => {
    if (templateId === "identifier") {
        return {
            declarations: ["declare const value: string;"],
            receiverText: "value",
        };
    }

    if (templateId === "memberExpression") {
        return {
            declarations: [
                "declare const holder: { readonly current: string };",
            ],
            receiverText: "holder.current",
        };
    }

    if (templateId === "callExpression") {
        return {
            declarations: ["declare function readValue(): string;"],
            receiverText: "readValue()",
        };
    }

    return {
        declarations: ["declare const value: string;"],
        receiverText: "(value)",
    };
};

const getPartsSplitCallExpressionFromDeclarator = (
    declaration: Readonly<TSESTree.VariableDeclarator>
): null | TSESTree.CallExpression => {
    if (
        declaration.id.type === AST_NODE_TYPES.Identifier &&
        declaration.id.name === "parts" &&
        declaration.init?.type === AST_NODE_TYPES.CallExpression
    ) {
        return declaration.init;
    }

    return null;
};

const getPartsSplitCallExpressionFromStatement = (
    statement: Readonly<TSESTree.ProgramStatement>
): null | TSESTree.CallExpression => {
    if (statement.type !== AST_NODE_TYPES.VariableDeclaration) {
        return null;
    }

    for (const declaration of statement.declarations) {
        const callExpression =
            getPartsSplitCallExpressionFromDeclarator(declaration);

        if (callExpression) {
            return callExpression;
        }
    }

    return null;
};

const parseSplitCallExpressionFromCode = (
    code: string
): Readonly<{
    ast: ReturnType<typeof parser.parseForESLint>["ast"];
    callExpression: TSESTree.CallExpression;
    callExpressionRange: readonly [number, number];
    receiverText: string;
}> => {
    const parsedResult = parser.parseForESLint(code, parserOptions);

    for (const statement of parsedResult.ast.body) {
        const callExpression =
            getPartsSplitCallExpressionFromStatement(statement);

        if (callExpression) {
            if (
                callExpression.callee.type !== AST_NODE_TYPES.MemberExpression
            ) {
                throw new Error(
                    "Expected generated parts initializer to use a member-expression callee"
                );
            }

            return {
                ast: parsedResult.ast,
                callExpression,
                callExpressionRange: callExpression.range,
                receiverText: code.slice(
                    callExpression.callee.object.range[0],
                    callExpression.callee.object.range[1]
                ),
            };
        }
    }

    throw new Error("Expected generated code to include parts call expression");
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

type ReplaceTextOnlyFixer = Readonly<{
    replaceText: (node: unknown, text: string) => unknown;
}>;

const assertIsReplaceFixFunction: (
    value: unknown
) => asserts value is (fixer: ReplaceTextOnlyFixer) => unknown = (value) => {
    if (typeof value !== "function") {
        throw new TypeError("Expected report descriptor fix to be a function");
    }
};

type TypedRuleModuleOverrides = Readonly<{
    getTypedRuleServices?: (...arguments_: readonly unknown[]) => unknown;
    isTypeAssignableTo?: (...arguments_: readonly unknown[]) => boolean;
}>;

const mockTypedRuleModule = (overrides: TypedRuleModuleOverrides): void => {
    vi.doMock(import("../src/_internal/typed-rule.js"), () => ({
        ...typedRuleModule,
        createTypedRule: createTypedRuleSelectorAwarePassThrough,
        ...overrides,
    }));
};

type RuleDefaultExport = Readonly<{
    create: UnknownFunction;
}>;
type RuleListenerMap = Readonly<{
    CallExpression?: (node: unknown) => void;
}>;
type RuleModuleWithDefaultExport = Readonly<{
    default: RuleDefaultExport;
}>;
type UnknownFunction = (...arguments_: readonly unknown[]) => unknown;

const isObjectRecord = (
    value: unknown
): value is Record<PropertyKey, unknown> =>
    typeof value === "object" && value !== null;

const isUnknownFunction = (value: unknown): value is UnknownFunction =>
    typeof value === "function";

const isRuleDefaultExport = (value: unknown): value is RuleDefaultExport => {
    if (!isObjectRecord(value)) {
        return false;
    }

    return isUnknownFunction(Reflect.get(value, "create"));
};

const isRuleModuleWithDefaultExport = (
    value: unknown
): value is RuleModuleWithDefaultExport => {
    if (!isObjectRecord(value)) {
        return false;
    }

    return isRuleDefaultExport(Reflect.get(value, "default"));
};

const toRuleListenerMap = (value: unknown): RuleListenerMap => {
    if (!isObjectRecord(value)) {
        throw new TypeError("Expected listener map object");
    }

    const callExpressionListenerDirect = Reflect.get(value, "CallExpression");
    const callExpressionListener = isUnknownFunction(
        callExpressionListenerDirect
    )
        ? callExpressionListenerDirect
        : getSelectorAwareNodeListener(
              value as RuleListenerMap,
              "CallExpression"
          );

    if (callExpressionListener === undefined) {
        return {};
    }

    if (!isUnknownFunction(callExpressionListener)) {
        throw new TypeError("Expected CallExpression listener function");
    }

    return {
        CallExpression: (node: unknown): void => {
            callExpressionListener(node);
        },
    };
};

const loadCreateRuleListeners = async (): Promise<
    (context: unknown) => RuleListenerMap
> => {
    const moduleValue =
        await import("../src/rules/prefer-ts-extras-string-split");

    if (!isRuleModuleWithDefaultExport(moduleValue)) {
        throw new TypeError("Expected rule module object");
    }

    return (context: unknown): RuleListenerMap =>
        toRuleListenerMap(moduleValue.default.create(context));
};

addTypeFestRuleMetadataSmokeTests("prefer-ts-extras-string-split", {
    defaultOptions: [],
    docsDescription:
        "require ts-extras stringSplit over String#split for stronger tuple inference.",
    enforceRuleShape: true,
    messages: {
        preferTsExtrasStringSplit:
            "Prefer `stringSplit` from `ts-extras` over `string.split(...)` for stronger tuple inference.",
    },
    name: "prefer-ts-extras-string-split",
});

describe("prefer-ts-extras-string-split runtime safety assertions", () => {
    it("handles parser-service lookup failures without reporting", async () => {
        try {
            vi.resetModules();

            mockTypedRuleModule({
                getTypedRuleServices: () => ({
                    checker: {
                        getTypeAtLocation: () => ({
                            isUnion: () => false,
                        }),
                        typeToString: () => "string",
                    },
                    parserServices: {
                        esTreeNodeToTSNodeMap: {
                            get: (): never => {
                                throw new Error("lookup failed");
                            },
                        },
                    },
                }),
            });

            const createRuleListeners = await loadCreateRuleListeners();

            const parsedResult = parser.parseForESLint(
                [
                    "const value = 'a,b';",
                    "const parts = value.split(',');",
                ].join("\n"),
                {
                    ecmaVersion: "latest",
                    loc: true,
                    range: true,
                    sourceType: "module",
                }
            );

            const secondStatement = parsedResult.ast.body[1];

            expect(secondStatement?.type).toBe("VariableDeclaration");

            if (secondStatement?.type !== AST_NODE_TYPES.VariableDeclaration) {
                throw new Error("Expected variable declaration for split call");
            }

            const firstDeclarator = secondStatement.declarations[0];
            if (firstDeclarator?.init?.type !== AST_NODE_TYPES.CallExpression) {
                throw new Error(
                    "Expected call expression initializer for split call"
                );
            }

            const splitCallExpression = firstDeclarator.init;
            const report = vi.fn();

            const fallbackChecker = {
                getTypeAtLocation: () => ({
                    isIntersection: () => false,
                    isUnion: () => false,
                }),
                typeToString: () => "string",
            };

            const listenerMap = createRuleListeners({
                filename:
                    "fixtures/typed/prefer-ts-extras-string-split.invalid.ts",
                languageOptions: {
                    parser: {
                        meta: {
                            name: "@typescript-eslint/parser",
                        },
                    },
                },
                report,
                sourceCode: {
                    ast: parsedResult.ast,
                    parserServices: {
                        esTreeNodeToTSNodeMap: {
                            get: (): never => {
                                throw new Error("lookup failed");
                            },
                        },
                        program: {
                            getTypeChecker: () => fallbackChecker,
                        },
                        tsNodeToESTreeNodeMap: new WeakMap<object, object>(),
                    },
                },
            });

            expect(() => {
                listenerMap.CallExpression?.(splitCallExpression);
            }).not.toThrow();

            expect(report).not.toHaveBeenCalled();
        } finally {
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });

    it("skips reporting when parser services cannot map the receiver expression", async () => {
        const getTypeAtLocation = vi.fn(() => ({
            isIntersection: () => false,
            isUnion: () => false,
        }));

        try {
            vi.resetModules();

            mockTypedRuleModule({
                getTypedRuleServices: () => ({
                    checker: {
                        getTypeAtLocation,
                        typeToString: () => "string",
                    },
                    parserServices: {
                        esTreeNodeToTSNodeMap: {
                            get: (): undefined => undefined,
                        },
                    },
                }),
            });

            const createRuleListeners = await loadCreateRuleListeners();

            const parsedResult = parser.parseForESLint(
                [
                    "const value = 'a,b';",
                    "const parts = value.split(',');",
                ].join("\n"),
                parserOptions
            );

            const secondStatement = parsedResult.ast.body[1];

            expect(secondStatement?.type).toBe("VariableDeclaration");

            if (secondStatement?.type !== AST_NODE_TYPES.VariableDeclaration) {
                throw new Error("Expected variable declaration for split call");
            }

            const firstDeclarator = secondStatement.declarations[0];

            if (firstDeclarator?.init?.type !== AST_NODE_TYPES.CallExpression) {
                throw new Error(
                    "Expected call expression initializer for split call"
                );
            }

            const splitCallExpression = firstDeclarator.init;
            const report = vi.fn();

            const fallbackChecker = {
                getTypeAtLocation,
                typeToString: () => "string",
            };

            const listenerMap = createRuleListeners({
                filename:
                    "fixtures/typed/prefer-ts-extras-string-split.invalid.ts",
                languageOptions: {
                    parser: {
                        meta: {
                            name: "@typescript-eslint/parser",
                        },
                    },
                },
                report,
                sourceCode: {
                    ast: parsedResult.ast,
                    parserServices: {
                        esTreeNodeToTSNodeMap: {
                            get: (): undefined => undefined,
                        },
                        program: {
                            getTypeChecker: () => fallbackChecker,
                        },
                        tsNodeToESTreeNodeMap: new WeakMap<object, object>(),
                    },
                },
            });

            listenerMap.CallExpression?.(splitCallExpression);

            expect(report).not.toHaveBeenCalled();
            expect(getTypeAtLocation).not.toHaveBeenCalled();
        } finally {
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });

    it("guards apparent-type recursion cycles without reporting", async () => {
        try {
            vi.resetModules();

            const apparentA = {
                getSymbol: (): undefined => undefined,
                isIntersection: (): boolean => false,
                isUnion: (): boolean => false,
            };
            const apparentB = {
                getSymbol: (): undefined => undefined,
                isIntersection: (): boolean => false,
                isUnion: (): boolean => false,
            };

            const getApparentType = vi.fn((candidate: unknown): unknown => {
                if (candidate === apparentA) {
                    return apparentB;
                }

                if (candidate === apparentB) {
                    return apparentA;
                }

                return candidate;
            });

            mockTypedRuleModule({
                getTypedRuleServices: () => ({
                    checker: {
                        getApparentType,
                        getStringType: () => ({
                            isIntersection: (): boolean => false,
                            isUnion: (): boolean => false,
                        }),
                        getTypeAtLocation: () => apparentA,
                        typeToString: () => "NonStringLike",
                    },
                    parserServices: {
                        esTreeNodeToTSNodeMap: {
                            get: (): object => ({
                                kind: "MockTypeNode",
                            }),
                        },
                    },
                }),
                isTypeAssignableTo: (): boolean => false,
            });

            const createRuleListeners = await loadCreateRuleListeners();

            const fallbackChecker = {
                getApparentType,
                getStringType: () => ({
                    isIntersection: (): boolean => false,
                    isUnion: (): boolean => false,
                }),
                getTypeAtLocation: () => apparentA,
                typeToString: () => "NonStringLike",
            };

            const parsedResult = parser.parseForESLint(
                [
                    "const value = { split(separator: string) { return [separator]; } };",
                    "const parts = value.split(',');",
                ].join("\n"),
                {
                    ecmaVersion: "latest",
                    loc: true,
                    range: true,
                    sourceType: "module",
                }
            );

            const secondStatement = parsedResult.ast.body[1];
            if (secondStatement?.type !== AST_NODE_TYPES.VariableDeclaration) {
                throw new Error("Expected variable declaration for split call");
            }

            const firstDeclarator = secondStatement.declarations[0];
            if (firstDeclarator?.init?.type !== AST_NODE_TYPES.CallExpression) {
                throw new Error(
                    "Expected call expression initializer for split call"
                );
            }

            const splitCallExpression = firstDeclarator.init;
            const report = vi.fn();

            const listenerMap = createRuleListeners({
                filename:
                    "fixtures/typed/prefer-ts-extras-string-split.invalid.ts",
                languageOptions: {
                    parser: {
                        meta: {
                            name: "@typescript-eslint/parser",
                        },
                    },
                },
                report,
                sourceCode: {
                    ast: parsedResult.ast,
                    parserServices: {
                        esTreeNodeToTSNodeMap: {
                            get: (): object => ({
                                kind: "MockTypeNode",
                            }),
                        },
                        program: {
                            getTypeChecker: () => fallbackChecker,
                        },
                        tsNodeToESTreeNodeMap: new WeakMap<object, object>(),
                    },
                },
            });

            listenerMap.CallExpression?.(splitCallExpression);

            expect(getApparentType).toHaveBeenCalled();
            expect(report).not.toHaveBeenCalled();
        } finally {
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });

    it("reuses cached type resolutions for duplicate union branches and across expressions", async () => {
        const report = vi.fn();

        const nonStringLeafType: Readonly<{
            getSymbol: () => undefined;
            isIntersection: () => false;
            isUnion: () => false;
        }> = {
            getSymbol: () => undefined,
            isIntersection: () => false,
            isUnion: () => false,
        };

        const duplicateBranchUnionType = {
            getSymbol: () => undefined,
            isIntersection: () => false,
            isUnion: () => true,
            types: [nonStringLeafType, nonStringLeafType],
        };

        const getTypeAtLocation = vi.fn(() => duplicateBranchUnionType);

        try {
            vi.resetModules();

            mockTypedRuleModule({
                getTypedRuleServices: () => ({
                    checker: {
                        getApparentType: (type: unknown) => type,
                        getStringType: () => undefined,
                        getTypeAtLocation,
                        typeToString: () => "NonStringLike",
                    },
                    parserServices: {
                        esTreeNodeToTSNodeMap: {
                            get: () => ({ kind: "MockTypeNode" }),
                        },
                    },
                }),
                isTypeAssignableTo: () => false,
            });

            const createRuleListeners = await loadCreateRuleListeners();

            const fallbackChecker = {
                getApparentType: (type: unknown) => type,
                getStringType: () => undefined,
                getTypeAtLocation,
                typeToString: () => "NonStringLike",
            };

            const parsedResult = parser.parseForESLint(
                [
                    "declare const firstValue: { split(separator: string): string[] };",
                    "declare const secondValue: { split(separator: string): string[] };",
                    "const firstParts = firstValue.split(',');",
                    "const secondParts = secondValue.split(',');",
                ].join("\n"),
                parserOptions
            );

            const splitCallExpressions = parsedResult.ast.body.flatMap(
                (statement) => {
                    if (statement.type !== AST_NODE_TYPES.VariableDeclaration) {
                        return [];
                    }

                    return statement.declarations.flatMap((declaration) =>
                        declaration.init?.type === AST_NODE_TYPES.CallExpression
                            ? [declaration.init]
                            : []
                    );
                }
            );

            expect(splitCallExpressions).toHaveLength(2);

            const listenerMap = createRuleListeners({
                filename:
                    "fixtures/typed/prefer-ts-extras-string-split.invalid.ts",
                languageOptions: {
                    parser: {
                        meta: {
                            name: "@typescript-eslint/parser",
                        },
                    },
                },
                report,
                sourceCode: {
                    ast: parsedResult.ast,
                    parserServices: {
                        esTreeNodeToTSNodeMap: {
                            get: () => ({ kind: "MockTypeNode" }),
                        },
                        program: {
                            getTypeChecker: () => fallbackChecker,
                        },
                        tsNodeToESTreeNodeMap: new WeakMap<object, object>(),
                    },
                },
            });

            listenerMap.CallExpression?.(splitCallExpressions[0]);
            listenerMap.CallExpression?.(splitCallExpressions[1]);

            expect(report).not.toHaveBeenCalled();
            expect(getTypeAtLocation).toHaveBeenCalledTimes(2);
        } finally {
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });

    it("fast-check: split() calls report and produce parseable stringSplit replacements", async () => {
        expect.hasAssertions();

        const stringLikeType = {
            getSymbol: () => ({
                getName: () => "String",
            }),
            isIntersection: () => false,
            isUnion: () => false,
        };

        try {
            vi.resetModules();

            vi.doMock(
                import("../src/_internal/imported-value-symbols.js"),
                () => ({
                    collectDirectNamedValueImportsFromSource: () =>
                        new Map([["stringSplit", new Set(["stringSplit"])]]),
                    createMethodToFunctionCallFix,
                })
            );

            mockTypedRuleModule({
                getTypedRuleServices: () => ({
                    checker: {
                        getApparentType: (type: unknown) => type,
                        getStringType: () => stringLikeType,
                        getTypeAtLocation: () => stringLikeType,
                    },
                    parserServices: {
                        esTreeNodeToTSNodeMap: {
                            get: () => ({ kind: "Identifier" }),
                        },
                    },
                }),
                isTypeAssignableTo: (): boolean => true,
            });

            const createRuleListeners = await loadCreateRuleListeners();

            const fallbackChecker = {
                getApparentType: (type: unknown) => type,
                getStringType: () => stringLikeType,
                getTypeAtLocation: () => stringLikeType,
            };

            fc.assert(
                fc.property(
                    splitReceiverTemplateIdArbitrary,
                    splitArgumentTemplateIdArbitrary,
                    (receiverTemplateId, argumentTemplateId) => {
                        const receiverTemplate =
                            buildSplitReceiverTemplate(receiverTemplateId);
                        const argumentTemplate =
                            buildSplitArgumentTemplate(argumentTemplateId);
                        const splitArguments = argumentTemplate.argumentsText;
                        const code = [
                            'import { stringSplit } from "ts-extras";',
                            ...receiverTemplate.declarations,
                            ...argumentTemplate.declarations,
                            "",
                            `const parts = ${receiverTemplate.receiverText}.split(${splitArguments});`,
                        ]
                            .filter((line) => line.length > 0)
                            .join("\n");

                        const {
                            ast,
                            callExpression,
                            callExpressionRange,
                            receiverText,
                        } = parseSplitCallExpressionFromCode(code);
                        const reportCalls: Readonly<{
                            fix?: unknown;
                            messageId?: string;
                        }>[] = [];

                        const listeners = createRuleListeners({
                            filename: "src/example.ts",
                            languageOptions: {
                                parser: {
                                    meta: {
                                        name: "@typescript-eslint/parser",
                                    },
                                },
                            },
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
                                getScope: () => ({
                                    set: new Map([
                                        [
                                            "stringSplit",
                                            {
                                                defs: [
                                                    {
                                                        node: {
                                                            importKind: "value",
                                                            local: {
                                                                name: "stringSplit",
                                                            },
                                                            parent: {
                                                                importKind:
                                                                    "value",
                                                                source: {
                                                                    type: "Literal",
                                                                    value: "ts-extras",
                                                                },
                                                                type: "ImportDeclaration",
                                                            },
                                                            type: "ImportSpecifier",
                                                        },
                                                        type: "ImportBinding",
                                                    },
                                                ],
                                            },
                                        ],
                                    ]),
                                    upper: null,
                                }),
                                getText(node: unknown): string {
                                    return getSourceTextForNode({ code, node });
                                },
                                parserServices: {
                                    esTreeNodeToTSNodeMap: {
                                        get: () => ({ kind: "Identifier" }),
                                    },
                                    program: {
                                        getTypeChecker: () => fallbackChecker,
                                    },
                                    tsNodeToESTreeNodeMap: new WeakMap<
                                        object,
                                        object
                                    >(),
                                },
                            },
                        });

                        listeners.CallExpression?.(callExpression);

                        expect(reportCalls).toHaveLength(1);
                        expect(reportCalls[0]).toMatchObject({
                            messageId: "preferTsExtrasStringSplit",
                        });
                        expect(reportCalls[0]?.fix).toBeDefined();

                        const fixFunction: unknown = reportCalls[0]?.fix;
                        assertIsReplaceFixFunction(fixFunction);

                        let replacementText = "";

                        fixFunction({
                            replaceText(node, text): unknown {
                                expect(node).toBe(callExpression);

                                replacementText = text;

                                return text;
                            },
                        });

                        const expectedReplacementText =
                            splitArguments.length > 0
                                ? `stringSplit(${receiverText}, ${splitArguments})`
                                : `stringSplit(${receiverText})`;

                        expect(replacementText).toBe(expectedReplacementText);

                        const fixedCode =
                            code.slice(0, callExpressionRange[0]) +
                            replacementText +
                            code.slice(callExpressionRange[1]);

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

ruleTester.run(
    "prefer-ts-extras-string-split",
    getPluginRule("prefer-ts-extras-string-split"),
    {
        invalid: [
            {
                code: readTypedFixture(invalidFixtureName),
                errors: [
                    {
                        messageId: "preferTsExtrasStringSplit",
                    },
                    {
                        messageId: "preferTsExtrasStringSplit",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports fixture string.split usage",
            },
            {
                code: inlineInvalidCode,
                errors: [{ messageId: "preferTsExtrasStringSplit" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports direct string.split call",
                output: inlineInvalidOutput,
            },
            {
                code: unionStringInvalidCode,
                errors: [{ messageId: "preferTsExtrasStringSplit" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports literal string union split call",
                output: unionStringInvalidOutput,
            },
            {
                code: mixedUnionInvalidCode,
                errors: [{ messageId: "preferTsExtrasStringSplit" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports mixed union split call",
                output: mixedUnionInvalidOutput,
            },
            {
                code: declaredStringUnionInvalidCode,
                errors: [{ messageId: "preferTsExtrasStringSplit" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports declared string object union split call",
                output: declaredStringUnionInvalidOutput,
            },
            {
                code: declaredStringObjectInvalidCode,
                errors: [{ messageId: "preferTsExtrasStringSplit" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports declared String object split call",
                output: declaredStringObjectInvalidOutput,
            },
            {
                code: intersectionStringInvalidCode,
                errors: [{ messageId: "preferTsExtrasStringSplit" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports string intersections that preserve string split semantics",
                output: intersectionStringInvalidOutput,
            },
            {
                code: inlineFixableCode,
                errors: [{ messageId: "preferTsExtrasStringSplit" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "autofixes string.split() when stringSplit import is in scope",
                output: inlineFixableOutput,
            },
            {
                code: [
                    "function splitGeneric<T extends String>(value: T) {",
                    "    return value.split(',');",
                    "}",
                ].join("\n"),
                errors: [{ messageId: "preferTsExtrasStringSplit" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports split calls on generic receivers constrained to String",
                output: [
                    'import { stringSplit } from "ts-extras";',
                    "function splitGeneric<T extends String>(value: T) {",
                    "    return stringSplit(value, ',');",
                    "}",
                ].join("\n"),
            },
        ],
        valid: [
            {
                code: readTypedFixture(validFixtureName),
                filename: typedFixturePath(validFixtureName),
                name: "accepts fixture-safe patterns",
            },
            {
                code: computedAccessValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores computed split member access",
            },
            {
                code: nonStringReceiverValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores custom non-string split method",
            },
            {
                code: differentStringMethodValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores non-split string method call",
            },
            {
                code: [
                    "namespace CustomTypes {",
                    "    export class String {",
                    "        split(separator: string): string[] {",
                    "            return [separator];",
                    "        }",
                    "    }",
                    "}",
                    "const value = new CustomTypes.String();",
                    "value.split(',');",
                ].join("\n"),
                filename: typedFixturePath(validFixtureName),
                name: "ignores namespaced user-defined String class split method",
            },
        ],
    }
);
