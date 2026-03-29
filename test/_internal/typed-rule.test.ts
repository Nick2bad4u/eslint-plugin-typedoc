/**
 * @packageDocumentation
 * Property-based and unit tests for shared typed-rule internals.
 */
import type { TSESLint, TSESTree } from "@typescript-eslint/utils";
import type ts from "typescript";

import { describe, expect, it, vi } from "vitest";

import {
    getSignatureParameterTypeAt,
    getTypedRuleServices,
    getTypedRuleServicesOrUndefined,
    hasTypeServices,
    isGlobalIdentifierNamed,
    isGlobalUndefinedIdentifier,
    isTypeAssignableTo,
} from "../../src/_internal/typed-rule";

/** Minimal parser-services shape consumed by typed-rule helper tests. */
interface ParserServicesLike {
    esTreeNodeToTSNodeMap: WeakMap<object, object>;
    program: null | ts.Program;
    tsNodeToESTreeNodeMap: WeakMap<object, object>;
}

/**
 * Build a minimal typed-rule context fixture with caller-supplied parser
 * services.
 *
 * @param parserServices - Parser services payload injected into sourceCode.
 *
 * @returns Minimal context-like object accepted by tested helpers.
 */
const createTypedRuleContext = (
    parserServices: Readonly<ParserServicesLike>
) => ({
    languageOptions: {
        parser: {
            meta: {
                name: "@typescript-eslint/parser",
            },
        },
    },
    sourceCode: {
        parserServices,
    },
});

/**
 * Build parser-services test doubles with deterministic map instances.
 *
 * @param program - Optional TypeScript program under test.
 *
 * @returns Parser-services-like fixture for helper tests.
 */
const createParserServices = (
    program: Readonly<null | ts.Program>
): ParserServicesLike => ({
    esTreeNodeToTSNodeMap: new WeakMap<object, object>(),
    program,
    tsNodeToESTreeNodeMap: new WeakMap<object, object>(),
});

describe(isGlobalUndefinedIdentifier, () => {
    const createScope = ({
        defsLength,
        upper,
    }: Readonly<{
        defsLength?: number;
        upper?: null | Readonly<TSESLint.Scope.Scope>;
    }>): Readonly<TSESLint.Scope.Scope> => {
        const variableEntries =
            defsLength === undefined
                ? []
                : [
                      [
                          "undefined",
                          {
                              defs: Array.from(
                                  { length: defsLength },
                                  () => ({}) as TSESLint.Scope.Definition
                              ),
                          } as TSESLint.Scope.Variable,
                      ] as const,
                  ];

        return {
            set: new Map(variableEntries),
            upper: upper ?? null,
        } as TSESLint.Scope.Scope;
    };

    const createContextWithScope = (
        scopeFactory: () => Readonly<TSESLint.Scope.Scope>
    ): Readonly<TSESLint.RuleContext<string, readonly unknown[]>> =>
        ({
            sourceCode: {
                getScope: () => scopeFactory(),
            },
        }) as unknown as TSESLint.RuleContext<string, readonly unknown[]>;

    const undefinedIdentifierExpression = {
        name: "undefined",
        type: "Identifier",
    } as unknown as TSESTree.Expression;

    const undefinedLiteralExpression = {
        raw: '"undefined"',
        type: "Literal",
        value: "undefined",
    } as unknown as TSESTree.Expression;

    it("returns true for identifier references resolved to global undefined", () => {
        const context = createContextWithScope(() => createScope({}));

        expect(
            isGlobalUndefinedIdentifier(context, undefinedIdentifierExpression)
        ).toBeTruthy();
    });

    it("returns false when undefined is shadowed with local definitions", () => {
        const context = createContextWithScope(() =>
            createScope({
                defsLength: 1,
            })
        );

        expect(
            isGlobalUndefinedIdentifier(context, undefinedIdentifierExpression)
        ).toBeFalsy();
    });

    it("walks parent scopes when current scope does not define undefined", () => {
        const context = createContextWithScope(() =>
            createScope({
                upper: createScope({
                    defsLength: 0,
                }),
            })
        );

        expect(
            isGlobalUndefinedIdentifier(context, undefinedIdentifierExpression)
        ).toBeTruthy();
    });

    it("returns false when sourceCode.getScope throws", () => {
        const context = {
            sourceCode: {
                getScope: () => {
                    throw new TypeError("scope failure");
                },
            },
        } as unknown as TSESLint.RuleContext<string, readonly unknown[]>;

        expect(
            isGlobalUndefinedIdentifier(context, undefinedIdentifierExpression)
        ).toBeFalsy();
    });

    it("returns false for non-identifier expressions", () => {
        const context = createContextWithScope(() => createScope({}));

        expect(
            isGlobalUndefinedIdentifier(context, undefinedLiteralExpression)
        ).toBeFalsy();
    });
});

describe(isGlobalIdentifierNamed, () => {
    const createScopeWithBinding = ({
        defsLength,
        identifierName,
    }: Readonly<{
        defsLength: number;
        identifierName: string;
    }>): Readonly<TSESLint.Scope.Scope> =>
        ({
            set: new Map([
                [
                    identifierName,
                    {
                        defs: Array.from(
                            { length: defsLength },
                            () => ({}) as TSESLint.Scope.Definition
                        ),
                    } as TSESLint.Scope.Variable,
                ],
            ]),
            upper: null,
        }) as TSESLint.Scope.Scope;

    const createContextWithScope = (
        scope: Readonly<TSESLint.Scope.Scope>
    ): Readonly<TSESLint.RuleContext<string, readonly unknown[]>> =>
        ({
            sourceCode: {
                getScope: () => scope,
            },
        }) as unknown as TSESLint.RuleContext<string, readonly unknown[]>;

    it("returns true for unshadowed global-like identifier references", () => {
        const context = createContextWithScope(
            createScopeWithBinding({
                defsLength: 0,
                identifierName: "Infinity",
            })
        );

        expect(
            isGlobalIdentifierNamed(
                context,
                {
                    name: "Infinity",
                    type: "Identifier",
                } as unknown as TSESTree.Expression,
                "Infinity"
            )
        ).toBeTruthy();
    });

    it("returns false for shadowed identifier references", () => {
        const context = createContextWithScope(
            createScopeWithBinding({
                defsLength: 1,
                identifierName: "Infinity",
            })
        );

        expect(
            isGlobalIdentifierNamed(
                context,
                {
                    name: "Infinity",
                    type: "Identifier",
                } as unknown as TSESTree.Expression,
                "Infinity"
            )
        ).toBeFalsy();
    });

    it("returns false for non-identifier expressions", () => {
        const context = createContextWithScope(
            createScopeWithBinding({
                defsLength: 0,
                identifierName: "Infinity",
            })
        );

        expect(
            isGlobalIdentifierNamed(
                context,
                {
                    type: "Literal",
                    value: "Infinity",
                } as unknown as TSESTree.Expression,
                "Infinity"
            )
        ).toBeFalsy();
    });

    it("returns false when scope resolution throws", () => {
        const context = {
            sourceCode: {
                getScope: () => {
                    throw new TypeError("scope failure");
                },
            },
        } as unknown as TSESLint.RuleContext<string, readonly unknown[]>;

        expect(
            isGlobalIdentifierNamed(
                context,
                {
                    name: "Infinity",
                    type: "Identifier",
                } as unknown as TSESTree.Expression,
                "Infinity"
            )
        ).toBeFalsy();
    });
});

describe(isTypeAssignableTo, () => {
    const sourceType = {} as ts.Type;
    const targetType = {} as ts.Type;

    it("uses checker.isTypeAssignableTo when available", () => {
        const isTypeAssignableToMock = vi
            .fn<
                (
                    source: Readonly<ts.Type>,
                    target: Readonly<ts.Type>
                ) => boolean
            >()
            .mockReturnValue(true);

        const checker = {
            isTypeAssignableTo: isTypeAssignableToMock,
        } as unknown as ts.TypeChecker;

        expect(
            isTypeAssignableTo(checker, sourceType, targetType)
        ).toBeTruthy();
        expect(isTypeAssignableToMock).toHaveBeenCalledWith(
            sourceType,
            targetType
        );
    });

    it("falls back to strict identity when native assignability API is unavailable", () => {
        const checker = {
            typeToString: vi.fn<(type: Readonly<ts.Type>) => string>(),
        } as unknown as ts.TypeChecker;

        expect(
            isTypeAssignableTo(checker, sourceType, sourceType)
        ).toBeTruthy();
    });

    it("fails gracefully and falls back to identity when native assignability API throws", () => {
        const checker = {
            isTypeAssignableTo: vi
                .fn<
                    (
                        source: Readonly<ts.Type>,
                        target: Readonly<ts.Type>
                    ) => boolean
                >()
                .mockImplementation(() => {
                    throw new TypeError("checker failure");
                }),
            typeToString: vi.fn<(type: Readonly<ts.Type>) => string>(),
        } as unknown as ts.TypeChecker;

        expect(
            isTypeAssignableTo(checker, sourceType, sourceType)
        ).toBeTruthy();
        expect(isTypeAssignableTo(checker, sourceType, targetType)).toBeFalsy();
    });

    it("returns false for non-identical types when assignability API is unavailable", () => {
        const checker = {
            typeToString: vi.fn<(type: Readonly<ts.Type>) => string>(),
        } as unknown as ts.TypeChecker;

        expect(isTypeAssignableTo(checker, sourceType, targetType)).toBeFalsy();
    });
});

describe(getTypedRuleServices, () => {
    it("returns parser services and type checker when program is available", () => {
        const checker = {} as ts.TypeChecker;
        const parserServices = createParserServices({
            getTypeChecker: () => checker,
        } as ts.Program);

        const context = createTypedRuleContext(parserServices);

        const result = getTypedRuleServices(context as never);

        expect(result.parserServices).toBe(parserServices);
        expect(result.checker).toBe(checker);
    });

    it("throws when parser services do not expose a TypeScript program", () => {
        const parserServices = createParserServices(null);

        const context = createTypedRuleContext(parserServices);

        expect(() => getTypedRuleServices(context as never)).toThrow(
            /requires parserServices\.program/v
        );
    });
});

describe(hasTypeServices, () => {
    it("returns true when parser services expose a TypeScript program", () => {
        const parserServices = createParserServices({
            getTypeChecker: () => ({}) as ts.TypeChecker,
        } as ts.Program);

        const context = createTypedRuleContext(parserServices);

        expect(hasTypeServices(context as never)).toBeTruthy();
    });

    it("returns false when parser services do not expose a program", () => {
        const parserServices = createParserServices(null);

        const context = createTypedRuleContext(parserServices);

        expect(hasTypeServices(context as never)).toBeFalsy();
    });

    it("returns false when parser-services lookup throws", () => {
        const context = {
            sourceCode: {},
        } as unknown;

        expect(hasTypeServices(context as never)).toBeFalsy();
    });
});

describe(getTypedRuleServicesOrUndefined, () => {
    it("returns typed services when parser services include a program", () => {
        const checker = {} as ts.TypeChecker;
        const parserServices = createParserServices({
            getTypeChecker: () => checker,
        } as ts.Program);

        const context = createTypedRuleContext(parserServices);
        const typedServices = getTypedRuleServicesOrUndefined(context as never);

        expect(typedServices).toBeDefined();
        expect(typedServices?.checker).toBe(checker);
        expect(typedServices?.parserServices).toBe(parserServices);
    });

    it("returns undefined when parser services do not expose a program", () => {
        const parserServices = createParserServices(null);

        const context = createTypedRuleContext(parserServices);

        expect(
            getTypedRuleServicesOrUndefined(context as never)
        ).toBeUndefined();
    });

    it("returns undefined when parser-services lookup throws", () => {
        const context = {
            sourceCode: {},
        } as unknown;

        expect(
            getTypedRuleServicesOrUndefined(context as never)
        ).toBeUndefined();
    });
});

describe(getSignatureParameterTypeAt, () => {
    const location = {} as ts.Node;

    it("returns undefined when the parameter index is out of range", () => {
        const checker = {
            getTypeOfSymbolAtLocation: vi.fn(),
        } as unknown as ts.TypeChecker;
        const signature = {
            parameters: [],
        } as unknown as ts.Signature;

        expect(
            getSignatureParameterTypeAt({
                checker,
                index: 0,
                location,
                signature,
            })
        ).toBeUndefined();
    });

    it("delegates to checker.getTypeOfSymbolAtLocation when parameter exists", () => {
        const parameter = {} as ts.Symbol;
        const signature = {
            parameters: [parameter],
        } as unknown as ts.Signature;
        const expectedType = {} as ts.Type;

        const checkerWithSpy = {
            getTypeOfSymbolAtLocation: vi.fn().mockReturnValue(expectedType),
        } as unknown as ts.TypeChecker;

        expect(
            getSignatureParameterTypeAt({
                checker: checkerWithSpy,
                index: 0,
                location,
                signature,
            })
        ).toBe(expectedType);
        expect(checkerWithSpy.getTypeOfSymbolAtLocation).toHaveBeenCalledWith(
            parameter,
            location
        );
    });
});
