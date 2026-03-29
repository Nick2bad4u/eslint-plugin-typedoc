/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-assert-defined`.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import {
    collectDirectNamedValueImportsFromSource,
    createSafeValueNodeTextReplacementFix,
    getFunctionCallArgumentText,
} from "../_internal/imported-value-symbols.js";
import { TS_EXTRAS_MODULE_SOURCE } from "../_internal/module-source.js";
import {
    reportWithOptionalFix,
    reportWithTypefestPolicy,
} from "../_internal/rule-reporting.js";
import {
    getThrowStatementFromConsequent,
    isThrowOnlyConsequent,
} from "../_internal/throw-consequent.js";
import { getSingleGlobalTypeErrorArgument } from "../_internal/throw-type-error.js";
import {
    createTypedRule,
    isGlobalUndefinedIdentifier,
} from "../_internal/typed-rule.js";

/** Concrete rule context type inferred from `createTypedRule`. */
type RuleContext = Readonly<
    Parameters<ReturnType<typeof createTypedRule>["create"]>[0]
>;

/**
 * Determine whether an expression references the global `undefined` value.
 *
 * @param context - Active rule context for scope resolution.
 * @param node - Expression to inspect.
 *
 * @returns `true` when the expression is an unshadowed `undefined` identifier.
 */
const isUndefinedExpression = ({
    context,
    node,
}: Readonly<{
    context: RuleContext;
    node: Readonly<TSESTree.Expression>;
}>): boolean => {
    if (node.type !== "Identifier" || node.name !== "undefined") {
        return false;
    }

    return isGlobalUndefinedIdentifier(context, node);
};

/**
 * Check whether the throw body matches the canonical assertDefined-equivalent
 * error shape.
 *
 * @param context - Active rule context for global-binding checks.
 * @param throwStatement - Throw statement extracted from the guard branch.
 *
 * @returns True when the throw is a TypeError whose message equals "Expected a
 *   defined value, got undefined".
 */
const isCanonicalAssertDefinedThrow = (
    context: RuleContext,
    throwStatement: Readonly<TSESTree.ThrowStatement>
): boolean => {
    const firstArgument = getSingleGlobalTypeErrorArgument({
        context,
        throwStatement,
    });
    if (firstArgument === null) {
        return false;
    }

    return (
        firstArgument.type === "Literal" &&
        firstArgument.value === "Expected a defined value, got `undefined`"
    );
};

/**
 * Extract the guarded expression from `x == undefined` / `undefined === x`
 * checks.
 *
 * @param test - Conditional test expression to inspect.
 * @param context - Active rule context for global-binding checks.
 *
 * @returns Guarded expression when the test is a supported undefined
 *   comparison; otherwise `null`.
 */
const extractDefinedGuardExpression = (
    test: Readonly<TSESTree.Expression>,
    context: RuleContext
): null | TSESTree.Expression => {
    if (
        test.type !== "BinaryExpression" ||
        (test.operator !== "==" && test.operator !== "===")
    ) {
        return null;
    }

    if (
        isUndefinedExpression({
            context,
            node: test.left,
        })
    ) {
        return test.right;
    }

    if (
        isUndefinedExpression({
            context,
            node: test.right,
        })
    ) {
        return test.left;
    }

    return null;
};

/**
 * ESLint rule definition for `prefer-ts-extras-assert-defined`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTsExtrasAssertDefinedRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const tsExtrasImports = collectDirectNamedValueImportsFromSource(
                context.sourceCode,
                TS_EXTRAS_MODULE_SOURCE
            );

            return {
                IfStatement(node) {
                    if (
                        node.alternate !== null ||
                        !isThrowOnlyConsequent(node.consequent)
                    ) {
                        return;
                    }

                    const guardExpression = extractDefinedGuardExpression(
                        node.test,
                        context
                    );

                    if (guardExpression === null) {
                        return;
                    }

                    const throwStatement = getThrowStatementFromConsequent(
                        node.consequent
                    );
                    const canAutofix =
                        throwStatement !== null &&
                        isCanonicalAssertDefinedThrow(context, throwStatement);
                    const guardExpressionArgumentText =
                        getFunctionCallArgumentText({
                            argumentNode: guardExpression,
                            sourceCode: context.sourceCode,
                        });

                    if (guardExpressionArgumentText === null) {
                        reportWithOptionalFix({
                            context,
                            fix: null,
                            messageId: "preferTsExtrasAssertDefined",
                            node,
                        });

                        return;
                    }

                    const replacementFix =
                        createSafeValueNodeTextReplacementFix({
                            context,
                            importedName: "assertDefined",
                            imports: tsExtrasImports,
                            replacementTextFactory: (replacementName) =>
                                `${replacementName}(${guardExpressionArgumentText});`,
                            reportFixIntent: canAutofix
                                ? "autofix"
                                : "suggestion",
                            sourceModuleName: TS_EXTRAS_MODULE_SOURCE,
                            targetNode: node,
                        });

                    if (replacementFix === null) {
                        reportWithOptionalFix({
                            context,
                            fix: null,
                            messageId: "preferTsExtrasAssertDefined",
                            node,
                        });

                        return;
                    }

                    if (canAutofix) {
                        reportWithOptionalFix({
                            context,
                            fix: replacementFix,
                            messageId: "preferTsExtrasAssertDefined",
                            node,
                        });

                        return;
                    }

                    reportWithTypefestPolicy({
                        context,
                        descriptor: {
                            messageId: "preferTsExtrasAssertDefined",
                            node,
                            suggest: [
                                {
                                    fix: replacementFix,
                                    messageId: "suggestTsExtrasAssertDefined",
                                },
                            ],
                        },
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            deprecated: false,
            docs: {
                description:
                    "require ts-extras assertDefined over manual undefined-guard throw blocks.",
                frozen: false,
                recommended: true,
                requiresTypeChecking: false,
                typefestConfigs: [
                    "typefest.configs.recommended",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                    "typefest.configs.ts-extras/type-guards",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-assert-defined",
            },
            fixable: "code",
            hasSuggestions: true,
            messages: {
                preferTsExtrasAssertDefined:
                    "Prefer `assertDefined` from `ts-extras` over manual undefined guard throw blocks.",
                suggestTsExtrasAssertDefined:
                    "Replace this manual guard with `assertDefined(...)` from `ts-extras`.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-assert-defined",
    });

/**
 * Default export for the `prefer-ts-extras-assert-defined` rule module.
 */
export default preferTsExtrasAssertDefinedRule;
