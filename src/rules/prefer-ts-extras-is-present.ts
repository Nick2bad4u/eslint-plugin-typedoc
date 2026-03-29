/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-is-present`.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import { isWithinFilterCallback } from "../_internal/filter-callback.js";
import {
    collectDirectNamedValueImportsFromSource,
    createSafeValueArgumentFunctionCallFix,
} from "../_internal/imported-value-symbols.js";
import { TS_EXTRAS_MODULE_SOURCE } from "../_internal/module-source.js";
import { areEquivalentExpressions } from "../_internal/normalize-expression-text.js";
import {
    flattenLogicalTerms,
    getNullishComparison as getSharedNullishComparison,
    isExpressionPair,
} from "../_internal/nullish-comparison.js";
import { reportWithOptionalFix } from "../_internal/rule-reporting.js";
import { isTypePredicateExpressionAutofixSafe } from "../_internal/type-predicate-autofix-safety.js";
import {
    createTypedRule,
    getTypedRuleServicesOrUndefined,
    isGlobalUndefinedIdentifier,
} from "../_internal/typed-rule.js";
import { createTypeScriptEslintNodeExpressionSkipChecker } from "../_internal/typescript-eslint-node-autofix.js";

/**
 * Concrete rule context type derived from `createTypedRule`.
 */
type RuleContext = Readonly<
    Parameters<ReturnType<typeof createTypedRule>["create"]>[0]
>;

/**
 * Adapter for shared nullish comparison parsing with this rule's context.
 */
const getRuleNullishComparison = (
    context: RuleContext,
    expression: Readonly<TSESTree.Expression>
): ReturnType<typeof getSharedNullishComparison> =>
    getSharedNullishComparison({
        expression,
        isGlobalUndefinedIdentifier: (candidateExpression) =>
            isGlobalUndefinedIdentifier(context, candidateExpression),
    });

/**
 * Checks whether two expressions are syntactically equivalent targets.
 *
 * @param options - Pair of expressions to compare.
 *
 * @returns `true` when both expressions resolve to the same normalized text.
 */

const haveSameComparedExpression = ({
    first,
    second,
}: Readonly<{
    first: TSESTree.Expression;
    second: TSESTree.Expression;
}>): boolean => areEquivalentExpressions(first, second);

/**
 * Detects the strict two-term present check pattern: value !== null && value
 * !== undefined.
 *
 * @param options - Context plus logical expression to inspect.
 *
 * @returns `true` when the logical expression is a strict present check.
 */

const isStrictPresentCheck = ({
    context,
    expression,
}: Readonly<{
    context: RuleContext;
    expression: TSESTree.LogicalExpression;
}>): boolean => {
    if (expression.operator !== "&&") {
        return false;
    }

    const terms = flattenLogicalTerms({
        expression,
        operator: "&&",
    });

    if (!isExpressionPair(terms)) {
        return false;
    }

    const [firstTerm, secondTerm] = terms;

    const first = getRuleNullishComparison(context, firstTerm);
    const second = getRuleNullishComparison(context, secondTerm);

    if (!first || !second) {
        return false;
    }

    if (first.operator !== "!==" || second.operator !== "!==") {
        return false;
    }

    if (first.kind === second.kind) {
        return false;
    }

    return haveSameComparedExpression({
        first: first.comparedExpression,
        second: second.comparedExpression,
    });
};

/**
 * Detects the strict two-term absent check pattern: value === null || value ===
 * undefined.
 *
 * @param options - Context plus logical expression to inspect.
 *
 * @returns `true` when the logical expression is a strict absent check.
 */

const isStrictAbsentCheck = ({
    context,
    expression,
}: Readonly<{
    context: RuleContext;
    expression: TSESTree.LogicalExpression;
}>): boolean => {
    if (expression.operator !== "||") {
        return false;
    }

    const terms = flattenLogicalTerms({
        expression,
        operator: "||",
    });

    if (!isExpressionPair(terms)) {
        return false;
    }

    const [firstTerm, secondTerm] = terms;

    const first = getRuleNullishComparison(context, firstTerm);
    const second = getRuleNullishComparison(context, secondTerm);

    if (!first || !second) {
        return false;
    }

    if (first.operator !== "===" || second.operator !== "===") {
        return false;
    }

    if (first.kind === second.kind) {
        return false;
    }

    return haveSameComparedExpression({
        first: first.comparedExpression,
        second: second.comparedExpression,
    });
};

/**
 * ESLint rule definition for `prefer-ts-extras-is-present`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTsExtrasIsPresentRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const tsExtrasImports = collectDirectNamedValueImportsFromSource(
                context.sourceCode,
                TS_EXTRAS_MODULE_SOURCE
            );
            const typedServices = getTypedRuleServicesOrUndefined(context);
            const shouldSkipComparedExpression =
                createTypeScriptEslintNodeExpressionSkipChecker(
                    context,
                    typedServices
                );

            return {
                BinaryExpression(node) {
                    if (isWithinFilterCallback(node)) {
                        return;
                    }

                    const comparison = getRuleNullishComparison(context, node);
                    if (comparison?.kind !== "null") {
                        return;
                    }

                    if (
                        shouldSkipComparedExpression(
                            comparison.comparedExpression
                        )
                    ) {
                        return;
                    }

                    const canAutofix =
                        isTypePredicateExpressionAutofixSafe(node);

                    if (comparison.operator === "!=") {
                        reportWithOptionalFix({
                            context,
                            fix: canAutofix
                                ? createSafeValueArgumentFunctionCallFix({
                                      argumentNode:
                                          comparison.comparedExpression,
                                      context,
                                      importedName: "isPresent",
                                      imports: tsExtrasImports,
                                      sourceModuleName: TS_EXTRAS_MODULE_SOURCE,
                                      targetNode: node,
                                  })
                                : null,
                            messageId: "preferTsExtrasIsPresent",
                            node,
                        });
                    }

                    if (comparison.operator === "==") {
                        reportWithOptionalFix({
                            context,
                            fix: canAutofix
                                ? createSafeValueArgumentFunctionCallFix({
                                      argumentNode:
                                          comparison.comparedExpression,
                                      context,
                                      importedName: "isPresent",
                                      imports: tsExtrasImports,
                                      negated: true,
                                      sourceModuleName: TS_EXTRAS_MODULE_SOURCE,
                                      targetNode: node,
                                  })
                                : null,
                            messageId: "preferTsExtrasIsPresentNegated",
                            node,
                        });
                    }
                },
                LogicalExpression(node) {
                    if (isWithinFilterCallback(node)) {
                        return;
                    }

                    if (
                        isStrictPresentCheck({
                            context,
                            expression: node,
                        })
                    ) {
                        reportWithOptionalFix({
                            context,
                            fix: null,
                            messageId: "preferTsExtrasIsPresent",
                            node,
                        });
                        return;
                    }

                    if (
                        isStrictAbsentCheck({
                            context,
                            expression: node,
                        })
                    ) {
                        reportWithOptionalFix({
                            context,
                            fix: null,
                            messageId: "preferTsExtrasIsPresentNegated",
                            node,
                        });
                    }
                },
            };
        },
        defaultOptions: [],
        meta: {
            deprecated: false,
            docs: {
                description:
                    "require ts-extras isPresent over inline nullish comparisons outside filter callbacks.",
                frozen: false,
                recommended: true,
                requiresTypeChecking: false,
                typefestConfigs: [
                    "typefest.configs.recommended",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                    "typefest.configs.ts-extras/type-guards",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-is-present",
            },
            fixable: "code",
            messages: {
                preferTsExtrasIsPresent:
                    "Prefer `isPresent(value)` from `ts-extras` over inline nullish comparisons.",
                preferTsExtrasIsPresentNegated:
                    "Prefer `!isPresent(value)` from `ts-extras` over inline nullish comparisons.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-is-present",
    });

/**
 * Default export for the `prefer-ts-extras-is-present` rule module.
 */
export default preferTsExtrasIsPresentRule;
