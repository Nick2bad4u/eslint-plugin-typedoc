/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-not`.
 */
import type { TSESLint, TSESTree } from "@typescript-eslint/utils";

import { getFilterCallbackFunctionArgument } from "../_internal/filter-callback.js";
import {
    collectDirectNamedValueImportsFromSource,
    createSafeValueNodeTextReplacementFix,
} from "../_internal/imported-value-symbols.js";
import { TS_EXTRAS_MODULE_SOURCE } from "../_internal/module-source.js";
import { reportWithOptionalFix } from "../_internal/rule-reporting.js";
import { createTypedRule } from "../_internal/typed-rule.js";

/**
 * Checks whether a call argument refers to the callback parameter identifier.
 *
 * @param argument - Predicate call argument candidate.
 * @param parameterName - Callback parameter name expected by the rule.
 *
 * @returns `true` when the argument is the same identifier as the callback's
 *   sole parameter.
 */

const isTargetCallbackParameter = (
    argument: Readonly<TSESTree.CallExpressionArgument>,
    parameterName: string
): boolean => argument.type === "Identifier" && argument.name === parameterName;

/**
 * Extracts predicate calls from callbacks that negate a predicate call applied
 * to the callback parameter.
 *
 * @param callback - Filter callback candidate.
 *
 * @returns The inner predicate call when callback structure is compatible with
 *   `not(predicate)` replacement; otherwise `null`.
 */

const getNegatedPredicateCall = (
    callback: Readonly<
        TSESTree.ArrowFunctionExpression | TSESTree.FunctionExpression
    >
): null | TSESTree.CallExpression => {
    if (callback.params.length !== 1) {
        return null;
    }

    const [firstParameter] = callback.params;
    if (firstParameter?.type !== "Identifier") {
        return null;
    }

    const callbackBody = callback.body;
    if (
        callbackBody.type !== "UnaryExpression" ||
        callbackBody.operator !== "!" ||
        callbackBody.argument.type !== "CallExpression"
    ) {
        return null;
    }

    const predicateCall = callbackBody.argument;
    if (predicateCall.arguments.length !== 1) {
        return null;
    }

    const [firstArgument] = predicateCall.arguments;
    return firstArgument &&
        isTargetCallbackParameter(firstArgument, firstParameter.name)
        ? predicateCall
        : null;
};

/**
 * ESLint rule definition for `prefer-ts-extras-not`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTsExtrasNotRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const tsExtrasImports = collectDirectNamedValueImportsFromSource(
                context.sourceCode,
                TS_EXTRAS_MODULE_SOURCE
            );

            /**
             * Create a safe replacement fix that rewrites negated predicate
             * callbacks into `not(predicate)`.
             */
            const createNotFilterCallbackFix = ({
                callbackNode,
                predicateCall,
            }: Readonly<{
                callbackNode:
                    | TSESTree.ArrowFunctionExpression
                    | TSESTree.FunctionExpression;
                predicateCall: TSESTree.CallExpression;
            }>): null | TSESLint.ReportFixFunction => {
                if ((predicateCall.typeArguments?.params.length ?? 0) > 0) {
                    return null;
                }

                if (
                    predicateCall.optional ||
                    predicateCall.callee.type !== "Identifier"
                ) {
                    return null;
                }

                const predicateText = context.sourceCode
                    .getText(predicateCall.callee)
                    .trim();

                if (predicateText.length === 0) {
                    return null;
                }

                return createSafeValueNodeTextReplacementFix({
                    context,
                    importedName: "not",
                    imports: tsExtrasImports,
                    replacementTextFactory: (replacementName) =>
                        `${replacementName}(${predicateText})`,
                    sourceModuleName: TS_EXTRAS_MODULE_SOURCE,
                    targetNode: callbackNode,
                });
            };

            return {
                'CallExpression[callee.type="MemberExpression"][callee.property.type="Identifier"][callee.property.name="filter"]'(
                    node
                ) {
                    const callbackArgument =
                        getFilterCallbackFunctionArgument(node);
                    if (!callbackArgument) {
                        return;
                    }

                    const negatedPredicateCall =
                        getNegatedPredicateCall(callbackArgument);

                    if (!negatedPredicateCall) {
                        return;
                    }

                    reportWithOptionalFix({
                        context,
                        fix: createNotFilterCallbackFix({
                            callbackNode: callbackArgument,
                            predicateCall: negatedPredicateCall,
                        }),
                        messageId: "preferTsExtrasNot",
                        node: callbackArgument,
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            deprecated: false,
            docs: {
                description:
                    "require ts-extras not helper over inline negated predicate callbacks in filter calls.",
                frozen: false,
                recommended: true,
                requiresTypeChecking: false,
                typefestConfigs: [
                    "typefest.configs.recommended",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                    "typefest.configs.ts-extras/type-guards",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-not",
            },
            fixable: "code",
            messages: {
                preferTsExtrasNot:
                    "Prefer `not(<predicate>)` from `ts-extras` over inline `value => !predicate(value)` callbacks.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-not",
    });

/**
 * Default export for the `prefer-ts-extras-not` rule module.
 */
export default preferTsExtrasNotRule;
