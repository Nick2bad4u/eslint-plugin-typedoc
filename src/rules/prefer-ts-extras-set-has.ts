/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-set-has`.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import {
    containsAllTypesByName,
    getTypeName,
    isBuiltinSymbolLike,
    isTypeAnyType,
    isTypeUnknownType,
} from "@typescript-eslint/type-utils";
import { isDefined, isPresent } from "ts-extras";
import ts from "typescript";

import { getConstrainedTypeAtLocationWithFallback } from "../_internal/constrained-type-at-location.js";
import { collectDirectNamedValueImportsFromSource } from "../_internal/imported-value-symbols.js";
import { getIdentifierPropertyMemberCall } from "../_internal/member-call.js";
import { TS_EXTRAS_MODULE_SOURCE } from "../_internal/module-source.js";
import { reportWithTypefestPolicy } from "../_internal/rule-reporting.js";
import { safeTypeOperation } from "../_internal/safe-type-operation.js";
import { setContainsValue } from "../_internal/set-membership.js";
import {
    getTypeCheckerApparentType,
    getTypeCheckerBaseTypes,
} from "../_internal/type-checker-compat.js";
import { isTypePredicateAutofixSafe } from "../_internal/type-predicate-autofix-safety.js";
import { reportTsExtrasTypedMemberCall } from "../_internal/typed-member-call-rule.js";
import {
    createTypedRule,
    getTypedRuleServices,
} from "../_internal/typed-rule.js";

const UNION_SET_MATCHING_MODE_ALL_BRANCHES = "allBranches";
const UNION_SET_MATCHING_MODE_ANY_BRANCH = "anyBranch";
const DEFAULT_UNION_SET_MATCHING_MODE = UNION_SET_MATCHING_MODE_ALL_BRANCHES;
const unionSetMatchingModeValues = [
    UNION_SET_MATCHING_MODE_ALL_BRANCHES,
    UNION_SET_MATCHING_MODE_ANY_BRANCH,
] as const;

type PreferTsExtrasSetHasOption = Readonly<{
    unionBranchMatchingMode?: UnionSetMatchingMode;
}>;

type SetHasCallAnalysis = Readonly<{
    canAutofix: boolean;
    matchesDefaultUnionMode: boolean;
}>;

type UnionSetMatchingMode = (typeof unionSetMatchingModeValues)[number];

const defaultOption = {
    unionBranchMatchingMode: DEFAULT_UNION_SET_MATCHING_MODE,
} as const;

const defaultOptions = [defaultOption] as const;
const setTypeNameList = ["ReadonlySet", "Set"];
const setTypeNames = new Set(setTypeNameList);

/**
 * ESLint rule definition for `prefer-ts-extras-set-has`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTsExtrasSetHasRule: ReturnType<typeof createTypedRule> =
    createTypedRule<
        readonly [PreferTsExtrasSetHasOption],
        "preferTsExtrasSetHas" | "suggestTsExtrasSetHas"
    >({
        create(context, [options] = defaultOptions) {
            const unionSetMatchingMode: UnionSetMatchingMode =
                options.unionBranchMatchingMode ??
                DEFAULT_UNION_SET_MATCHING_MODE;

            const tsExtrasImports = collectDirectNamedValueImportsFromSource(
                context.sourceCode,
                TS_EXTRAS_MODULE_SOURCE
            );

            const { checker, parserServices } = getTypedRuleServices(context);
            const program = parserServices.program;
            const setTypeResolutionCaches: Readonly<
                Record<UnionSetMatchingMode, Map<Readonly<ts.Type>, boolean>>
            > = {
                [UNION_SET_MATCHING_MODE_ALL_BRANCHES]: new Map<
                    Readonly<ts.Type>,
                    boolean
                >(),
                [UNION_SET_MATCHING_MODE_ANY_BRANCH]: new Map<
                    Readonly<ts.Type>,
                    boolean
                >(),
            };
            const setLikeExpressionResolutionCache = new WeakMap<
                Readonly<TSESTree.Expression>,
                Partial<Record<UnionSetMatchingMode, boolean>>
            >();
            const setHasCallAnalysisCache = new WeakMap<
                Readonly<TSESTree.CallExpression>,
                SetHasCallAnalysis
            >();

            const hasClassOrInterfaceLikeDeclaration = (
                candidateType: Readonly<ts.Type>
            ): boolean => {
                const declarations = candidateType.getSymbol()?.declarations;
                if (!isDefined(declarations)) {
                    return false;
                }

                return declarations.some(
                    (declaration) =>
                        declaration.kind === ts.SyntaxKind.ClassDeclaration ||
                        declaration.kind === ts.SyntaxKind.InterfaceDeclaration
                );
            };

            /**
             * Determine whether a type resolves to `Set`/`ReadonlySet`,
             * traversing unions, intersections, and apparent types.
             */
            const isSetType = (
                type: Readonly<ts.Type>,
                unionMatchingMode: UnionSetMatchingMode
            ): boolean => {
                const setTypeResolutionCache =
                    setTypeResolutionCaches[unionMatchingMode];

                const cachedRootResult = setTypeResolutionCache.get(type);
                if (isDefined(cachedRootResult)) {
                    return cachedRootResult;
                }

                const seenTypes = new Set<ts.Type>();

                const isSetTypeInternal = (
                    candidateType: Readonly<ts.Type>
                ): boolean => {
                    const cachedResult =
                        setTypeResolutionCache.get(candidateType);

                    if (isDefined(cachedResult)) {
                        return cachedResult;
                    }

                    if (setContainsValue(seenTypes, candidateType)) {
                        return false;
                    }

                    seenTypes.add(candidateType);

                    if (candidateType.isUnion()) {
                        const isSetLike =
                            unionMatchingMode ===
                            UNION_SET_MATCHING_MODE_ALL_BRANCHES
                                ? candidateType.types.every((partType) =>
                                      isSetTypeInternal(partType)
                                  )
                                : candidateType.types.some((partType) =>
                                      isSetTypeInternal(partType)
                                  );

                        setTypeResolutionCache.set(candidateType, isSetLike);

                        return isSetLike;
                    }

                    if (candidateType.isIntersection()) {
                        const isSetLike = candidateType.types.some((partType) =>
                            isSetTypeInternal(partType)
                        );
                        setTypeResolutionCache.set(candidateType, isSetLike);

                        return isSetLike;
                    }

                    if (
                        isTypeAnyType(candidateType) ||
                        isTypeUnknownType(candidateType)
                    ) {
                        setTypeResolutionCache.set(candidateType, false);

                        return false;
                    }

                    const builtinSetLikeResult = safeTypeOperation({
                        operation: () => {
                            if (!isPresent(program)) {
                                return false;
                            }

                            return isBuiltinSymbolLike(
                                program,
                                candidateType,
                                setTypeNameList
                            );
                        },
                        reason: "set-has-builtin-symbol-analysis-failed",
                    });

                    if (builtinSetLikeResult.ok && builtinSetLikeResult.value) {
                        setTypeResolutionCache.set(candidateType, true);

                        return true;
                    }

                    const shouldUseNameBasedFallback = !isPresent(program);

                    if (shouldUseNameBasedFallback) {
                        const candidateTypeNameResult = safeTypeOperation({
                            operation: () =>
                                getTypeName(checker, candidateType),
                            reason: "set-has-type-name-analysis-failed",
                        });

                        const candidateTypeName = candidateTypeNameResult.ok
                            ? candidateTypeNameResult.value
                            : "";
                        const candidateSymbolName = candidateType
                            .getSymbol()
                            ?.getName();

                        if (
                            candidateTypeName === "ReadonlySet" ||
                            candidateTypeName === "Set" ||
                            candidateSymbolName === "ReadonlySet" ||
                            candidateSymbolName === "Set"
                        ) {
                            setTypeResolutionCache.set(candidateType, true);

                            return true;
                        }
                    }

                    const containsSetLikeResult = safeTypeOperation({
                        operation: () =>
                            isPresent(program)
                                ? false
                                : containsAllTypesByName(
                                      candidateType,
                                      true,
                                      setTypeNames,
                                      true
                                  ),
                        reason: "set-has-contains-all-types-analysis-failed",
                    });

                    if (
                        containsSetLikeResult.ok &&
                        containsSetLikeResult.value
                    ) {
                        setTypeResolutionCache.set(candidateType, true);

                        return true;
                    }

                    const apparentType = getTypeCheckerApparentType(
                        checker,
                        candidateType
                    );
                    if (
                        isDefined(apparentType) &&
                        apparentType !== candidateType &&
                        isSetTypeInternal(apparentType)
                    ) {
                        setTypeResolutionCache.set(candidateType, true);

                        return true;
                    }

                    if (!hasClassOrInterfaceLikeDeclaration(candidateType)) {
                        setTypeResolutionCache.set(candidateType, false);

                        return false;
                    }

                    const baseTypesResult = safeTypeOperation({
                        operation: () =>
                            getTypeCheckerBaseTypes(checker, candidateType),
                        reason: "set-has-base-type-analysis-failed",
                    });

                    if (!baseTypesResult.ok) {
                        setTypeResolutionCache.set(candidateType, false);

                        return false;
                    }

                    const baseTypes = baseTypesResult.value;

                    const isSetLike =
                        baseTypes?.some((baseType) =>
                            isSetTypeInternal(baseType)
                        ) ?? false;

                    setTypeResolutionCache.set(candidateType, isSetLike);

                    return isSetLike;
                };

                return isSetTypeInternal(type);
            };

            const isSetLikeExpression = (
                expression: Readonly<TSESTree.Expression>,
                unionMatchingMode: UnionSetMatchingMode
            ): boolean => {
                const cachedExpressionModes =
                    setLikeExpressionResolutionCache.get(expression);
                const cachedModeResult =
                    cachedExpressionModes?.[unionMatchingMode];

                if (isDefined(cachedModeResult)) {
                    return cachedModeResult;
                }

                const result = safeTypeOperation({
                    operation: () => {
                        const objectType =
                            getConstrainedTypeAtLocationWithFallback(
                                checker,
                                expression,
                                parserServices,
                                "set-has-expression-type-resolution-failed"
                            );

                        if (!isDefined(objectType)) {
                            return false;
                        }

                        return isSetType(objectType, unionMatchingMode);
                    },
                    reason: "set-has-type-analysis-failed",
                });

                const isSetLike = result.ok && result.value;
                const nextExpressionModes = {
                    ...cachedExpressionModes,
                    [unionMatchingMode]: isSetLike,
                };

                setLikeExpressionResolutionCache.set(
                    expression,
                    nextExpressionModes
                );

                return isSetLike;
            };

            const analyzeSetHasCall = (
                node: Readonly<TSESTree.CallExpression>
            ): SetHasCallAnalysis => {
                const cachedAnalysis = setHasCallAnalysisCache.get(node);

                if (isDefined(cachedAnalysis)) {
                    return cachedAnalysis;
                }

                const receiverExpression = getIdentifierPropertyMemberCall({
                    memberName: "has",
                    node,
                })?.callee.object;

                if (!isDefined(receiverExpression)) {
                    const notSetLikeAnalysis: SetHasCallAnalysis = {
                        canAutofix: false,
                        matchesDefaultUnionMode: false,
                    };

                    setHasCallAnalysisCache.set(node, notSetLikeAnalysis);

                    return notSetLikeAnalysis;
                }

                const matchesConfiguredUnionMode = isSetLikeExpression(
                    receiverExpression,
                    unionSetMatchingMode
                );
                const matchesDefaultUnionMode =
                    unionSetMatchingMode === DEFAULT_UNION_SET_MATCHING_MODE
                        ? matchesConfiguredUnionMode
                        : isSetLikeExpression(
                              receiverExpression,
                              DEFAULT_UNION_SET_MATCHING_MODE
                          );

                const analysis: SetHasCallAnalysis = {
                    canAutofix:
                        matchesDefaultUnionMode &&
                        isTypePredicateAutofixSafe(node),
                    matchesDefaultUnionMode,
                };

                setHasCallAnalysisCache.set(node, analysis);

                return analysis;
            };

            return {
                'CallExpression[callee.type="MemberExpression"][callee.computed=false][callee.property.type="Identifier"][callee.property.name="has"]'(
                    node
                ) {
                    reportTsExtrasTypedMemberCall({
                        canAutofix: (callNode) =>
                            analyzeSetHasCall(callNode).canAutofix,
                        context,
                        importedName: "setHas",
                        imports: tsExtrasImports,
                        isMatchingObjectExpression: (expression) =>
                            isSetLikeExpression(
                                expression,
                                unionSetMatchingMode
                            ),
                        memberName: "has",
                        messageId: "preferTsExtrasSetHas",
                        node,
                        reportSuggestion: ({ fix, node: suggestionNode }) => {
                            const callAnalysis =
                                analyzeSetHasCall(suggestionNode);

                            if (!callAnalysis.matchesDefaultUnionMode) {
                                reportWithTypefestPolicy({
                                    context,
                                    descriptor: {
                                        messageId: "preferTsExtrasSetHas",
                                        node: suggestionNode,
                                    },
                                });

                                return;
                            }

                            reportWithTypefestPolicy({
                                context,
                                descriptor: {
                                    messageId: "preferTsExtrasSetHas",
                                    node: suggestionNode,
                                    suggest: [
                                        {
                                            fix,
                                            messageId: "suggestTsExtrasSetHas",
                                        },
                                    ],
                                },
                            });
                        },
                        suggestionMessageId: "suggestTsExtrasSetHas",
                    });
                },
            };
        },
        defaultOptions,
        meta: {
            defaultOptions: [defaultOption],
            deprecated: false,
            docs: {
                description:
                    "require direct ts-extras setHas over Set#has at membership call sites for stronger element narrowing.",
                frozen: false,
                recommended: false,
                requiresTypeChecking: true,
                typefestConfigs: [
                    "typefest.configs.recommended-type-checked",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                    "typefest.configs.ts-extras/type-guards",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-set-has",
            },
            fixable: "code",
            hasSuggestions: true,
            messages: {
                preferTsExtrasSetHas:
                    "Prefer `setHas` from `ts-extras` over `set.has(...)` for stronger element narrowing.",
                suggestTsExtrasSetHas:
                    "Replace this `set.has(...)` call with `setHas(...)` from `ts-extras`.",
            },
            schema: [
                {
                    additionalProperties: false,
                    description:
                        "Configuration for mixed-union matching in prefer-ts-extras-set-has.",
                    minProperties: 1,
                    properties: {
                        unionBranchMatchingMode: {
                            description:
                                "How union-typed receivers are matched: allBranches requires every union branch to be Set-like, anyBranch reports when at least one branch is Set-like.",
                            enum: [...unionSetMatchingModeValues],
                            type: "string",
                        },
                    },
                    type: "object",
                },
            ],
            type: "suggestion",
        },
        name: "prefer-ts-extras-set-has",
    });

/**
 * Default export for the `prefer-ts-extras-set-has` rule module.
 */
export default preferTsExtrasSetHasRule;
