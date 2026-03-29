/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-is-defined-filter`.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import { getSingleParameterExpressionArrowFilterCallback } from "../_internal/filter-callback.js";
import {
    collectDirectNamedValueImportsFromSource,
    createSafeValueReferenceReplacementFix,
} from "../_internal/imported-value-symbols.js";
import { TS_EXTRAS_MODULE_SOURCE } from "../_internal/module-source.js";
import { getNullishComparison } from "../_internal/nullish-comparison.js";
import { reportWithOptionalFix } from "../_internal/rule-reporting.js";
import {
    createTypedRule,
    isGlobalUndefinedIdentifier,
} from "../_internal/typed-rule.js";

/** Concrete rule context type inferred from `createTypedRule`. */
type RuleContext = Readonly<
    Parameters<ReturnType<typeof createTypedRule>["create"]>[0]
>;

/**
 * Check whether a callback body is a supported undefined guard expression.
 *
 * @param context - Active rule context for global-binding checks.
 * @param body - Callback body expression to inspect.
 * @param parameterName - Callback parameter name.
 *
 * @returns `true` when the body can be replaced with `isDefined`.
 */
const isUndefinedFilterGuardBody = (
    context: RuleContext,
    body: Readonly<TSESTree.Expression>,
    parameterName: string
): boolean => {
    const comparison = getNullishComparison({
        allowedOperators: ["!=", "!=="],
        allowTypeofComparedIdentifierForUndefined: true,
        comparedIdentifierName: parameterName,
        expression: body,
        isGlobalUndefinedIdentifier: (candidateExpression) =>
            isGlobalUndefinedIdentifier(context, candidateExpression),
    });

    return comparison?.kind === "undefined";
};

/**
 * ESLint rule definition for `prefer-ts-extras-is-defined-filter`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTsExtrasIsDefinedFilterRule: ReturnType<typeof createTypedRule> =
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

                    const { callback, parameter } = callbackMatch;

                    if (
                        !isUndefinedFilterGuardBody(
                            context,
                            callback.body,
                            parameter.name
                        )
                    ) {
                        return;
                    }

                    reportWithOptionalFix({
                        context,
                        fix: createSafeValueReferenceReplacementFix({
                            context,
                            importedName: "isDefined",
                            imports: tsExtrasImports,
                            sourceModuleName: TS_EXTRAS_MODULE_SOURCE,
                            targetNode: callback,
                        }),
                        messageId: "preferTsExtrasIsDefinedFilter",
                        node: callback,
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            deprecated: false,
            docs: {
                description:
                    "require ts-extras isDefined in Array.filter callbacks instead of inline undefined checks.",
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
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-is-defined-filter",
            },
            fixable: "code",
            messages: {
                preferTsExtrasIsDefinedFilter:
                    "Prefer `isDefined` from `ts-extras` in `filter(...)` callbacks over inline undefined comparisons.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-is-defined-filter",
    });

/**
 * Default export for the `prefer-ts-extras-is-defined-filter` rule module.
 */
export default preferTsExtrasIsDefinedFilterRule;
