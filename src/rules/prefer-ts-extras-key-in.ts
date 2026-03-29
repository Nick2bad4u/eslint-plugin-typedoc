/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-key-in`.
 */
import type { TSESLint, TSESTree } from "@typescript-eslint/utils";

import {
    collectDirectNamedValueImportsFromSource,
    createSafeValueNodeTextReplacementFix,
    getFunctionCallArgumentText,
} from "../_internal/imported-value-symbols.js";
import { TS_EXTRAS_MODULE_SOURCE } from "../_internal/module-source.js";
import { reportWithOptionalFix } from "../_internal/rule-reporting.js";
import { safeTypeOperation } from "../_internal/safe-type-operation.js";
import { getVariableInScopeChain } from "../_internal/scope-variable.js";
import { isTypePredicateExpressionAutofixSafe } from "../_internal/type-predicate-autofix-safety.js";
import { createTypedRule } from "../_internal/typed-rule.js";

/**
 * Determine whether a key expression can be safely reordered into `keyIn(...)`
 * argument position without changing side-effect semantics.
 */
const isAutofixSafeKeyExpression = (
    context: Readonly<TSESLint.RuleContext<string, readonly []>>,
    node: Readonly<TSESTree.Expression | TSESTree.PrivateIdentifier>
): node is TSESTree.Expression => {
    if (node.type === "PrivateIdentifier") {
        return false;
    }

    if (node.type === "Identifier") {
        const scopeResolutionResult = safeTypeOperation({
            operation: () => {
                const sourceScope = context.sourceCode.getScope(node);

                return getVariableInScopeChain(sourceScope, node.name) !== null;
            },
            reason: "key-in-autofix-key-scope-resolution-failed",
        });

        if (!scopeResolutionResult.ok) {
            return false;
        }

        return scopeResolutionResult.value;
    }

    if (node.type === "Literal") {
        return true;
    }

    if (node.type === "TemplateLiteral") {
        return node.expressions.length === 0;
    }

    if (
        node.type === "TSAsExpression" ||
        node.type === "TSNonNullExpression" ||
        node.type === "TSSatisfiesExpression" ||
        node.type === "TSTypeAssertion"
    ) {
        return isAutofixSafeKeyExpression(context, node.expression);
    }

    return false;
};

/**
 * ESLint rule definition for `prefer-ts-extras-key-in`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTsExtrasKeyInRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const tsExtrasImports = collectDirectNamedValueImportsFromSource(
                context.sourceCode,
                TS_EXTRAS_MODULE_SOURCE
            );

            /**
             * Build a safe fixer that rewrites `key in object` to
             * `keyIn(object, key)` when key/object operand ordering is safe.
             */
            const createKeyInFix = (
                node: Readonly<TSESTree.BinaryExpression>
            ): null | TSESLint.ReportFixFunction => {
                if (
                    !isTypePredicateExpressionAutofixSafe(node) ||
                    !isAutofixSafeKeyExpression(context, node.left)
                ) {
                    return null;
                }

                const keyText = getFunctionCallArgumentText({
                    argumentNode: node.left,
                    sourceCode: context.sourceCode,
                });
                const objectText = getFunctionCallArgumentText({
                    argumentNode: node.right,
                    sourceCode: context.sourceCode,
                });

                if (keyText === null || objectText === null) {
                    return null;
                }

                return createSafeValueNodeTextReplacementFix({
                    context,
                    importedName: "keyIn",
                    imports: tsExtrasImports,
                    replacementTextFactory: (replacementName) =>
                        `${replacementName}(${objectText}, ${keyText})`,
                    sourceModuleName: TS_EXTRAS_MODULE_SOURCE,
                    targetNode: node,
                });
            };

            return {
                BinaryExpression(node) {
                    if (node.operator !== "in") {
                        return;
                    }

                    reportWithOptionalFix({
                        context,
                        fix: createKeyInFix(node),
                        messageId: "preferTsExtrasKeyIn",
                        node,
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            deprecated: false,
            docs: {
                description:
                    "require ts-extras keyIn over `in` key checks for stronger narrowing.",
                frozen: false,
                recommended: true,
                requiresTypeChecking: false,
                typefestConfigs: [
                    "typefest.configs.recommended",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                    "typefest.configs.ts-extras/type-guards",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-key-in",
            },
            fixable: "code",
            messages: {
                preferTsExtrasKeyIn:
                    "Prefer `keyIn` from `ts-extras` over `key in object` checks for stronger narrowing.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-key-in",
    });

/**
 * Default export for the `prefer-ts-extras-key-in` rule module.
 */
export default preferTsExtrasKeyInRule;
