/**
 * @packageDocumentation
 * Shared testing utilities for eslint-plugin-typefest RuleTester and Vitest suites.
 */

import parser from "@typescript-eslint/parser";
import fc from "fast-check";
import ts from "typescript";
import { describe, expect, it, vi } from "vitest";

import * as typedRuleModule from "../src/_internal/typed-rule.js";
import { fastCheckRunConfig } from "./_internal/fast-check";
import {
    computedAccessValidCode,
    declaredUnionSetInvalidCode,
    declaredUnionSetInvalidOutput,
    inlineFixableCode,
    inlineFixableOutput,
    invalidFixtureName,
    mixedUnionValidCode,
    nonSetReceiverValidCode,
    readonlySetInvalidCode,
    readonlySetInvalidOutput,
    reversedMixedUnionValidCode,
    setDifferentMethodValidCode,
    unionSetInvalidCode,
    unionSetInvalidOutput,
    validFixtureName,
} from "./_internal/prefer-ts-extras-set-has-cases";
import {
    argumentTemplateIdArbitrary,
    assertIsReplaceFixFunction,
    buildArgumentTemplate,
    buildReceiverTemplate,
    getSourceTextForNode,
    parseCallExpressionFromCode,
    parserOptions,
    receiverTemplateIdArbitrary,
} from "./_internal/prefer-ts-extras-set-has-runtime-harness";
import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
import { getPluginRule } from "./_internal/ruleTester";
import { getSelectorAwareNodeListener } from "./_internal/selector-aware-listener";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleId = "prefer-ts-extras-set-has";
const defaultOptions = [{ unionBranchMatchingMode: "allBranches" }] as const;
const anyBranchUnionMatchingOptions = [
    { unionBranchMatchingMode: "anyBranch" },
] as const;
const docsDescription =
    "require direct ts-extras setHas over Set#has at membership call sites for stronger element narrowing.";
const docsUrl =
    "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-set-has";
const preferTsExtrasSetHasMessage =
    "Prefer `setHas` from `ts-extras` over `set.has(...)` for stronger element narrowing.";
const suggestTsExtrasSetHasMessage =
    "Replace this `set.has(...)` call with `setHas(...)` from `ts-extras`.";
const logicalGuardNoAutofixCode = [
    "const values = new Set([1, 2, 3]);",
    "declare const candidate: number;",
    "",
    "const shouldSkip = Math.random() > 0.5 || values.has(candidate);",
    "",
    "String(shouldSkip);",
].join("\n");
const logicalGuardSuggestionOutput = [
    'import { setHas } from "ts-extras";',
    "const values = new Set([1, 2, 3]);",
    "declare const candidate: number;",
    "",
    "const shouldSkip = Math.random() > 0.5 || setHas(values, candidate);",
    "",
    "String(shouldSkip);",
].join("\n");
const rule = getPluginRule(ruleId);
const ruleTester = createTypedRuleTester();

type TypedRuleModuleOverrides = Readonly<{
    getTypedRuleServices?: (...arguments_: readonly unknown[]) => unknown;
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
    const moduleValue = await import("../src/rules/prefer-ts-extras-set-has");

    if (!isRuleModuleWithDefaultExport(moduleValue)) {
        throw new TypeError("Expected rule module object");
    }

    return (context: unknown): RuleListenerMap =>
        toRuleListenerMap(moduleValue.default.create(context));
};

addTypeFestRuleMetadataSmokeTests(ruleId, {
    defaultOptions,
    docsDescription,
    messages: {
        preferTsExtrasSetHas: preferTsExtrasSetHasMessage,
        suggestTsExtrasSetHas: suggestTsExtrasSetHasMessage,
    },
    name: ruleId,
});

describe("prefer-ts-extras-set-has metadata literals", () => {
    it("declares the authored docs URL literal", () => {
        expect(rule.meta.docs?.url).toBe(docsUrl);
    });
});

describe("prefer-ts-extras-set-has internal listener guards", () => {
    it("ignores non-Identifier member property even when object type is Set-like", async () => {
        const reportCalls: { messageId?: string }[] = [];

        const fakeSetType = {
            isUnion: () => false,
        };

        try {
            vi.resetModules();

            mockTypedRuleModule({
                getTypedRuleServices: () => ({
                    checker: {
                        getTypeAtLocation: () => fakeSetType,
                        typeToString: () => "Set<number>",
                    },
                    parserServices: {
                        esTreeNodeToTSNodeMap: {
                            get: () => ({ kind: "Identifier" }),
                        },
                    },
                }),
            });

            vi.doMock(
                import("../src/_internal/imported-value-symbols.js"),
                () => ({
                    collectDirectNamedValueImportsFromSource: () =>
                        new Set<string>(),
                    createMethodToFunctionCallFix: () => null,
                })
            );

            const createRuleListeners = await loadCreateRuleListeners();

            const fallbackChecker = {
                getTypeAtLocation: () => fakeSetType,
                typeToString: () => "Set<number>",
            };

            const listeners = createRuleListeners({
                filename: "src/example.ts",
                languageOptions: {
                    parser: {
                        meta: {
                            name: "@typescript-eslint/parser",
                        },
                    },
                },
                report(descriptor: Readonly<{ messageId?: string }>) {
                    reportCalls.push(descriptor);
                },
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

            const callExpressionListener = getSelectorAwareNodeListener(
                listeners,
                "CallExpression"
            );

            expect(callExpressionListener).toBeTypeOf("function");

            const privatePropertyHasCallNode = {
                callee: {
                    computed: false,
                    object: {
                        type: "Identifier",
                    },
                    property: {
                        name: "has",
                        type: "PrivateIdentifier",
                    },
                    type: "MemberExpression",
                },
                type: "CallExpression",
            };

            callExpressionListener?.(privatePropertyHasCallNode);

            expect(reportCalls).toHaveLength(0);
        } finally {
            vi.doUnmock("../src/_internal/imported-value-symbols.js");
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });

    it("swallows parser-service failures without reporting", async () => {
        const reportCalls: { messageId?: string }[] = [];

        try {
            vi.resetModules();

            mockTypedRuleModule({
                getTypedRuleServices: () => ({
                    checker: {
                        getTypeAtLocation: () => ({ isUnion: () => false }),
                        typeToString: () => "Set<number>",
                    },
                    parserServices: {
                        esTreeNodeToTSNodeMap: {
                            get: () => {
                                throw new Error("lookup failed");
                            },
                        },
                    },
                }),
            });

            vi.doMock(
                import("../src/_internal/imported-value-symbols.js"),
                () => ({
                    collectDirectNamedValueImportsFromSource: () =>
                        new Set<string>(),
                    createMethodToFunctionCallFix: () => null,
                })
            );

            const createRuleListeners = await loadCreateRuleListeners();

            const fallbackChecker = {
                getTypeAtLocation: () => ({ isUnion: () => false }),
                typeToString: () => "Set<number>",
            };

            const listeners = createRuleListeners({
                filename: "src/example.ts",
                languageOptions: {
                    parser: {
                        meta: {
                            name: "@typescript-eslint/parser",
                        },
                    },
                },
                report(descriptor: Readonly<{ messageId?: string }>) {
                    reportCalls.push(descriptor);
                },
                sourceCode: {
                    ast: {
                        body: [],
                    },
                    parserServices: {
                        esTreeNodeToTSNodeMap: {
                            get: () => {
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

            const callExpressionListener = getSelectorAwareNodeListener(
                listeners,
                "CallExpression"
            );

            expect(callExpressionListener).toBeTypeOf("function");

            const identifierHasCallNode = {
                callee: {
                    computed: false,
                    object: {
                        type: "Identifier",
                    },
                    property: {
                        name: "has",
                        type: "Identifier",
                    },
                    type: "MemberExpression",
                },
                type: "CallExpression",
            };

            callExpressionListener?.(identifierHasCallNode);

            expect(reportCalls).toHaveLength(0);
        } finally {
            vi.doUnmock("../src/_internal/imported-value-symbols.js");
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });

    it("skips reporting when parser services cannot map the receiver expression", async () => {
        const reportCalls: { messageId?: string }[] = [];
        const getTypeAtLocation = vi.fn(() => ({ isUnion: () => false }));

        try {
            vi.resetModules();

            mockTypedRuleModule({
                getTypedRuleServices: () => ({
                    checker: {
                        getTypeAtLocation,
                        typeToString: () => "Set<number>",
                    },
                    parserServices: {
                        esTreeNodeToTSNodeMap: {
                            get: () => undefined,
                        },
                    },
                }),
            });

            vi.doMock(
                import("../src/_internal/imported-value-symbols.js"),
                () => ({
                    collectDirectNamedValueImportsFromSource: () =>
                        new Set<string>(),
                    createMethodToFunctionCallFix: () => null,
                })
            );

            const createRuleListeners = await loadCreateRuleListeners();

            const fallbackChecker = {
                getTypeAtLocation,
                typeToString: () => "Set<number>",
            };

            const listeners = createRuleListeners({
                filename: "src/example.ts",
                languageOptions: {
                    parser: {
                        meta: {
                            name: "@typescript-eslint/parser",
                        },
                    },
                },
                report(descriptor: Readonly<{ messageId?: string }>) {
                    reportCalls.push(descriptor);
                },
                sourceCode: {
                    ast: {
                        body: [],
                    },
                    parserServices: {
                        esTreeNodeToTSNodeMap: {
                            get: () => undefined,
                        },
                        program: {
                            getTypeChecker: () => fallbackChecker,
                        },
                        tsNodeToESTreeNodeMap: new WeakMap<object, object>(),
                    },
                },
            });

            const callExpressionListener = getSelectorAwareNodeListener(
                listeners,
                "CallExpression"
            );

            expect(callExpressionListener).toBeTypeOf("function");

            const identifierHasCallNode = {
                callee: {
                    computed: false,
                    object: {
                        type: "Identifier",
                    },
                    property: {
                        name: "has",
                        type: "Identifier",
                    },
                    type: "MemberExpression",
                },
                type: "CallExpression",
            };

            callExpressionListener?.(identifierHasCallNode);

            expect(reportCalls).toHaveLength(0);
            expect(getTypeAtLocation).not.toHaveBeenCalled();
        } finally {
            vi.doUnmock("../src/_internal/imported-value-symbols.js");
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });

    it("handles recursive unions, intersections, apparent types, and non-member callees", async () => {
        const reportCalls: { messageId?: string }[] = [];

        const setLeafType = {
            getSymbol: () => ({
                getDeclarations: () => [
                    {
                        getSourceFile: () => ({
                            fileName: "lib.es2015.collection.d.ts",
                        }),
                    },
                ],
                getName: () => "Set",
            }),
            isIntersection: () => false,
            isUnion: () => false,
        };

        const recursiveUnionType: {
            getSymbol: () => undefined;
            isIntersection: () => false;
            isUnion: () => true;
            types: unknown[];
        } = {
            getSymbol: () => undefined,
            isIntersection: () => false,
            isUnion: () => true,
            types: [],
        };

        recursiveUnionType.types = [recursiveUnionType];

        const intersectionType = {
            getSymbol: () => undefined,
            isIntersection: () => true,
            isUnion: () => false,
            types: [setLeafType],
        };

        const apparentTypeSource = {
            getSymbol: () => undefined,
            isIntersection: () => false,
            isUnion: () => false,
        };

        const nonClassLikeType = {
            getSymbol: () => ({
                declarations: [{ kind: -1 }],
                getName: () => "CustomType",
            }),
            isIntersection: () => false,
            isUnion: () => false,
        };

        const noSymbolLeafType = {
            getSymbol: () => undefined,
            isIntersection: () => false,
            isUnion: () => false,
        };

        const classLikeWithoutBaseTypes = {
            getSymbol: () => ({
                declarations: [{ kind: ts.SyntaxKind.InterfaceDeclaration }],
                getName: () => "CustomInterface",
            }),
            isIntersection: () => false,
            isUnion: () => false,
        };

        const classLikeSetBaseType = {
            getSymbol: () => ({
                declarations: [{ kind: ts.SyntaxKind.ClassDeclaration }],
                getName: () => "CustomClass",
            }),
            isIntersection: () => false,
            isUnion: () => false,
        };

        let currentObjectType: unknown = recursiveUnionType;

        try {
            vi.resetModules();

            mockTypedRuleModule({
                getTypedRuleServices: () => ({
                    checker: {
                        getApparentType: (type: unknown) =>
                            type === apparentTypeSource ? setLeafType : type,
                        getBaseTypes: (type: unknown) => {
                            if (type === classLikeSetBaseType) {
                                return [setLeafType];
                            }

                            if (type === classLikeWithoutBaseTypes) {
                                return undefined;
                            }

                            return [];
                        },
                        getTypeAtLocation: () => currentObjectType,
                        typeToString: () => "Set<number>",
                    },
                    parserServices: {
                        esTreeNodeToTSNodeMap: {
                            get: () => ({ kind: "Identifier" }),
                        },
                    },
                }),
            });

            vi.doMock(
                import("../src/_internal/imported-value-symbols.js"),
                () => ({
                    collectDirectNamedValueImportsFromSource: () =>
                        new Set<string>(),
                    createMethodToFunctionCallFix: () => null,
                })
            );

            const createRuleListeners = await loadCreateRuleListeners();

            const fallbackChecker = {
                getApparentType: (type: unknown) =>
                    type === apparentTypeSource ? setLeafType : type,
                getBaseTypes: (type: unknown) => {
                    if (type === classLikeSetBaseType) {
                        return [setLeafType];
                    }

                    if (type === classLikeWithoutBaseTypes) {
                        return undefined;
                    }

                    return [];
                },
                getTypeAtLocation: () => currentObjectType,
                typeToString: () => "Set<number>",
            };

            const listeners = createRuleListeners({
                filename: "src/example.ts",
                languageOptions: {
                    parser: {
                        meta: {
                            name: "@typescript-eslint/parser",
                        },
                    },
                },
                report(descriptor: Readonly<{ messageId?: string }>) {
                    reportCalls.push(descriptor);
                },
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
                            isSourceFileDefaultLibrary: () => true,
                        },
                        tsNodeToESTreeNodeMap: new WeakMap<object, object>(),
                    },
                },
            });

            const callExpressionListener = getSelectorAwareNodeListener(
                listeners,
                "CallExpression"
            );

            expect(callExpressionListener).toBeTypeOf("function");

            const createIdentifierHasCallNode = () => ({
                callee: {
                    computed: false,
                    object: {
                        type: "Identifier",
                    },
                    property: {
                        name: "has",
                        type: "Identifier",
                    },
                    type: "MemberExpression",
                },
                type: "CallExpression",
            });

            currentObjectType = recursiveUnionType;
            callExpressionListener?.(createIdentifierHasCallNode());

            currentObjectType = intersectionType;
            callExpressionListener?.(createIdentifierHasCallNode());

            currentObjectType = apparentTypeSource;
            callExpressionListener?.(createIdentifierHasCallNode());

            currentObjectType = nonClassLikeType;
            callExpressionListener?.(createIdentifierHasCallNode());

            currentObjectType = noSymbolLeafType;
            callExpressionListener?.(createIdentifierHasCallNode());

            currentObjectType = classLikeWithoutBaseTypes;
            callExpressionListener?.(createIdentifierHasCallNode());

            currentObjectType = classLikeSetBaseType;
            callExpressionListener?.(createIdentifierHasCallNode());

            callExpressionListener?.({
                callee: {
                    name: "has",
                    type: "Identifier",
                },
                type: "CallExpression",
            });

            expect(reportCalls).toHaveLength(3);
            expect(
                reportCalls.map((descriptor) => descriptor.messageId)
            ).toStrictEqual([
                "preferTsExtrasSetHas",
                "preferTsExtrasSetHas",
                "preferTsExtrasSetHas",
            ]);
        } finally {
            vi.doUnmock("../src/_internal/imported-value-symbols.js");
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });
});

describe("prefer-ts-extras-set-has fast-check fix safety", () => {
    it("fast-check: set.has calls report and produce parseable setHas replacements", async () => {
        expect.hasAssertions();

        const setLikeType = {
            getSymbol: () => ({
                getDeclarations: () => [
                    {
                        getSourceFile: () => ({
                            fileName: "lib.es2015.collection.d.ts",
                        }),
                    },
                ],
                getName: () => "Set",
            }),
            isIntersection: () => false,
            isUnion: () => false,
        };

        try {
            vi.resetModules();

            mockTypedRuleModule({
                getTypedRuleServices: () => ({
                    checker: {
                        getApparentType: (type: unknown) => type,
                        getBaseTypes: () => [],
                        getTypeAtLocation: () => setLikeType,
                        typeToString: () => "Set<number>",
                    },
                    parserServices: {
                        esTreeNodeToTSNodeMap: {
                            get: () => ({ kind: "Identifier" }),
                        },
                    },
                }),
            });

            const createRuleListeners = await loadCreateRuleListeners();

            fc.assert(
                fc.property(
                    receiverTemplateIdArbitrary,
                    argumentTemplateIdArbitrary,
                    (receiverTemplateId, argumentTemplateId) => {
                        const receiverTemplate =
                            buildReceiverTemplate(receiverTemplateId);
                        const argumentTemplate =
                            buildArgumentTemplate(argumentTemplateId);
                        const callArguments = argumentTemplate.argumentsText;
                        const code = [
                            'import { setHas } from "ts-extras";',
                            ...receiverTemplate.declarations,
                            ...argumentTemplate.declarations,
                            "",
                            `const hasValue = ${receiverTemplate.receiverText}.has(${callArguments});`,
                        ]
                            .filter((line) => line.length > 0)
                            .join("\n");

                        const {
                            ast,
                            callExpression,
                            callExpressionRange,
                            receiverText,
                        } = parseCallExpressionFromCode(code);
                        const reportCalls: Readonly<{
                            fix?: unknown;
                            messageId?: string;
                        }>[] = [];

                        const fallbackChecker = {
                            getApparentType: (type: unknown) => type,
                            getBaseTypes: () => [],
                            getTypeAtLocation: () => setLikeType,
                            typeToString: () => "Set<number>",
                        };

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
                                            "setHas",
                                            {
                                                defs: [
                                                    {
                                                        node: {
                                                            importKind: "value",
                                                            local: {
                                                                name: "setHas",
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
                                        isSourceFileDefaultLibrary: () => true,
                                    },
                                    tsNodeToESTreeNodeMap: new WeakMap<
                                        object,
                                        object
                                    >(),
                                },
                            },
                        });

                        const callExpressionListener =
                            getSelectorAwareNodeListener(
                                listeners,
                                "CallExpression"
                            );

                        callExpressionListener?.(callExpression);

                        expect(reportCalls).toHaveLength(1);
                        expect(reportCalls[0]).toMatchObject({
                            messageId: "preferTsExtrasSetHas",
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
                            callArguments.length > 0
                                ? `setHas(${receiverText}, ${callArguments})`
                                : `setHas(${receiverText})`;

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

ruleTester.run(ruleId, rule, {
    invalid: [
        {
            code: readTypedFixture(invalidFixtureName),
            errors: [
                {
                    messageId: "preferTsExtrasSetHas",
                },
                {
                    messageId: "preferTsExtrasSetHas",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture set.has usage",
        },
        {
            code: unionSetInvalidCode,
            errors: [{ messageId: "preferTsExtrasSetHas" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports union of set and readonly set",
            output: unionSetInvalidOutput,
        },
        {
            code: readonlySetInvalidCode,
            errors: [{ messageId: "preferTsExtrasSetHas" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports readonly set has call",
            output: readonlySetInvalidOutput,
        },
        {
            code: declaredUnionSetInvalidCode,
            errors: [{ messageId: "preferTsExtrasSetHas" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports declared set-like union has call",
            output: declaredUnionSetInvalidOutput,
        },
        {
            code: inlineFixableCode,
            errors: [{ messageId: "preferTsExtrasSetHas" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes set.has() when setHas import is in scope",
            output: inlineFixableOutput,
        },
        {
            code: logicalGuardNoAutofixCode,
            errors: [
                {
                    messageId: "preferTsExtrasSetHas",
                    suggestions: [
                        {
                            messageId: "suggestTsExtrasSetHas",
                            output: logicalGuardSuggestionOutput,
                        },
                    ],
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports logical-guard set.has() without autofix",
            output: null,
        },
        {
            code: mixedUnionValidCode,
            errors: [
                {
                    messageId: "preferTsExtrasSetHas",
                    suggestions: [],
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports mixed set/map unions when unionBranchMatchingMode is anyBranch",
            options: anyBranchUnionMatchingOptions,
            output: null,
        },
        {
            code: reversedMixedUnionValidCode,
            errors: [
                {
                    messageId: "preferTsExtrasSetHas",
                    suggestions: [],
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports map/set unions when unionBranchMatchingMode is anyBranch",
            options: anyBranchUnionMatchingOptions,
            output: null,
        },
        {
            code: [
                "function hasGeneric<T extends Set<number>>(value: T) {",
                "    return value.has(1);",
                "}",
            ].join("\n"),
            errors: [{ messageId: "preferTsExtrasSetHas" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports has calls on generic receivers constrained to Set",
            output: [
                'import { setHas } from "ts-extras";',
                "function hasGeneric<T extends Set<number>>(value: T) {",
                "    return setHas(value, 1);",
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
            name: "ignores computed has member access",
        },
        {
            code: nonSetReceiverValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores custom object has method",
        },
        {
            code: setDifferentMethodValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores non-has set method invocation",
        },
        {
            code: mixedUnionValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores union of set and map when calling has",
        },
        {
            code: reversedMixedUnionValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores union of map and set when calling has",
        },
        {
            code: [
                "namespace CustomTypes {",
                "    export class Set<T> {",
                "        has(_value: T): boolean {",
                "            return true;",
                "        }",
                "    }",
                "}",
                "const values = new CustomTypes.Set<number>();",
                "values.has(1);",
            ].join("\n"),
            filename: typedFixturePath(validFixtureName),
            name: "ignores namespaced user-defined Set class has method",
        },
    ],
});
