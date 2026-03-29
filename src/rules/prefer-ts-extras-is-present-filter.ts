/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-is-present-filter`.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import { getSingleParameterExpressionArrowFilterCallback } from "../_internal/filter-callback.js";
import {
    collectDirectNamedValueImportsFromSource,
    createSafeValueReferenceReplacementFix,
} from "../_internal/imported-value-symbols.js";
import { TS_EXTRAS_MODULE_SOURCE } from "../_internal/module-source.js";
import { areEquivalentExpressions } from "../_internal/normalize-expression-text.js";
import {
    flattenLogicalTerms,
    getNullishComparison,
    isExpressionPair,
} from "../_internal/nullish-comparison.js";
import { reportWithOptionalFix } from "../_internal/rule-reporting.js";
import {
    createTypedRule,
    isGlobalUndefinedIdentifier,
} from "../_internal/typed-rule.js";

/**
 * Normalized metadata for one nullish inequality comparison part.
 */
type NullishInequalityPart = {
    readonly expression: TSESTree.Expression;
    readonly kind: "null" | "undefined";
    readonly operator: "!=" | "!==";
};

/** Concrete rule context type inferred from `createTypedRule`. */
type RuleContext = Readonly<
    Parameters<ReturnType<typeof createTypedRule>["create"]>[0]
>;

const nullishInequalityOperators = ["!=", "!=="] as const;

/**
 * Extract one nullish inequality comparison part from an expression.
 *
 * @param context - Active rule context for global-binding checks.
 * @param expression - Expression to inspect.
 * @param parameterName - Callback parameter name.
 *
 * @returns Comparison metadata when matched; otherwise `null`.
 */
const extractNullishInequalityPart = (
    context: RuleContext,
    expression: Readonly<TSESTree.Expression>,
    parameterName: string
): null | NullishInequalityPart => {
    const comparison = getNullishComparison({
        allowedOperators: nullishInequalityOperators,
        allowTypeofComparedIdentifierForUndefined: true,
        comparedIdentifierName: parameterName,
        expression,
        isGlobalUndefinedIdentifier: (candidateExpression) =>
            isGlobalUndefinedIdentifier(context, candidateExpression),
    });

    if (!comparison) {
        return null;
    }

    if (comparison.operator !== "!=" && comparison.operator !== "!==") {
        return null;
    }

    return {
        expression: comparison.comparedExpression,
        kind: comparison.kind,
        operator: comparison.operator,
    };
};

/**
 * Check whether an expression contains a supported null-inequality comparison
 * part for the callback parameter.
 *
 * @param context - Active rule context for global-binding checks.
 * @param node - Expression to inspect.
 * @param parameterName - Callback parameter name.
 *
 * @returns `true` when the expression represents a null comparison.
 */
const isNullComparison = (
    context: RuleContext,
    node: Readonly<TSESTree.Expression>,
    parameterName: string
): node is TSESTree.BinaryExpression => {
    const comparison = extractNullishInequalityPart(
        context,
        node,
        parameterName
    );

    return comparison?.kind === "null";
};

/**
 * Check whether an expression contains a supported undefined-inequality
 * comparison part for the callback parameter.
 *
 * @param context - Active rule context for global-binding checks.
 * @param node - Expression to inspect.
 * @param parameterName - Callback parameter name.
 *
 * @returns `true` when the expression represents an undefined comparison.
 */
const isUndefinedComparison = (
    context: RuleContext,
    node: Readonly<TSESTree.Expression>,
    parameterName: string
): node is TSESTree.BinaryExpression => {
    const comparison = extractNullishInequalityPart(
        context,
        node,
        parameterName
    );

    return comparison?.kind === "undefined";
};

/**
 * Check whether a filter callback body is a supported nullish guard pattern.
 *
 * @param context - Active rule context for global-binding checks.
 * @param callback - Arrow callback to inspect.
 * @param parameterName - Callback parameter name.
 *
 * @returns `true` when the callback can be replaced by `isPresent` (with
 *   possible suggestion fallback based on strictness of operators).
 */
const isNullishFilterGuardBody = (
    context: RuleContext,
    callback: Readonly<
        TSESTree.ArrowFunctionExpression & { body: TSESTree.Expression }
    >,
    parameterName: string
): boolean => {
    const { body } = callback;

    if (
        isNullComparison(context, body, parameterName) ||
        isUndefinedComparison(context, body, parameterName)
    ) {
        if (body.operator === "!=") {
            return true;
        }

        return callback.returnType?.typeAnnotation.type === "TSTypePredicate";
    }

    const andTerms = flattenLogicalTerms({
        expression: body,
        operator: "&&",
    });

    let hasNullComparison = false;
    let hasUndefinedComparison = false;

    for (const term of andTerms) {
        const comparison = extractNullishInequalityPart(
            context,
            term,
            parameterName
        );

        if (comparison) {
            if (comparison.kind === "null") {
                hasNullComparison = true;
            }

            if (comparison.kind === "undefined") {
                hasUndefinedComparison = true;
            }

            if (hasNullComparison && hasUndefinedComparison) {
                return true;
            }
        }
    }

    return hasNullComparison && hasUndefinedComparison;
};

/**
 * Check whether the callback is safe to auto-fix directly to `isPresent`.
 *
 * @param callback - Arrow callback to inspect.
 * @param context - Active rule context for global-binding checks.
 * @param parameterName - Callback parameter name.
 *
 * @returns `true` when the callback is safely auto-fixable; otherwise `false`.
 */
const isSafePresentFilterAutoFixableCallback = ({
    callback,
    context,
    parameterName,
}: Readonly<{
    callback: TSESTree.ArrowFunctionExpression & { body: TSESTree.Expression };
    context: RuleContext;
    parameterName: string;
}>): boolean => {
    const { body } = callback;

    const singlePart = extractNullishInequalityPart(
        context,
        body,
        parameterName
    );
    if (singlePart?.operator === "!=") {
        return true;
    }

    if (body.type !== "LogicalExpression") {
        return false;
    }

    /* v8 ignore start */
    if (body.operator !== "&&") {
        return false;
    }
    /* v8 ignore stop */

    const andTerms = flattenLogicalTerms({
        expression: body,
        operator: "&&",
    });
    if (!isExpressionPair(andTerms)) {
        return false;
    }

    const [firstTerm, secondTerm] = andTerms;

    const first = extractNullishInequalityPart(
        context,
        firstTerm,
        parameterName
    );
    const second = extractNullishInequalityPart(
        context,
        secondTerm,
        parameterName
    );

    if (first?.operator !== "!==" || second?.operator !== "!==") {
        return false;
    }

    return areEquivalentExpressions(first.expression, second.expression);
};

/**
 * ESLint rule definition for `prefer-ts-extras-is-present-filter`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTsExtrasIsPresentFilterRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const tsExtrasImports = collectDirectNamedValueImportsFromSource(
                context.sourceCode,
                TS_EXTRAS_MODULE_SOURCE
            );

            return {
                'CallExpression[callee.type="MemberExpression"][callee.property.type="Identifier"][callee.property.name="filter"]'(
                    node
                ) {
                    const callbackMatch =
                        getSingleParameterExpressionArrowFilterCallback(node);
                    if (!callbackMatch) {
                        return;
                    }

                    const { callback: expressionCallback, parameter } =
                        callbackMatch;

                    if (
                        !isNullishFilterGuardBody(
                            context,
                            expressionCallback,
                            parameter.name
                        )
                    ) {
                        return;
                    }

                    const isAutoFixable =
                        isSafePresentFilterAutoFixableCallback({
                            callback: expressionCallback,
                            context,
                            parameterName: parameter.name,
                        });

                    reportWithOptionalFix({
                        context,
                        fix: isAutoFixable
                            ? createSafeValueReferenceReplacementFix({
                                  context,
                                  importedName: "isPresent",
                                  imports: tsExtrasImports,
                                  sourceModuleName: TS_EXTRAS_MODULE_SOURCE,
                                  targetNode: expressionCallback,
                              })
                            : null,
                        messageId: "preferTsExtrasIsPresentFilter",
                        node: expressionCallback,
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            deprecated: false,
            docs: {
                description:
                    "require ts-extras isPresent in Array.filter callbacks instead of inline nullish checks.",
                frozen: false,
                recommended: true,
                requiresTypeChecking: false,
                typefestConfigs: [
                    "typefest.configs.minimal",
                    "typefest.configs.recommended",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                    "typefest.configs.ts-extras/type-guards",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-is-present-filter",
            },
            fixable: "code",
            messages: {
                preferTsExtrasIsPresentFilter:
                    "Prefer `isPresent` from `ts-extras` in `filter(...)` callbacks over inline nullish comparisons.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-is-present-filter",
    });

/**
 * Default export for the `prefer-ts-extras-is-present-filter` rule module.
 */
export default preferTsExtrasIsPresentFilterRule;
