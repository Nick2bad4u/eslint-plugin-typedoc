/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-assert-error`.
 */
import type { TSESLint, TSESTree } from "@typescript-eslint/utils";
import type { UnknownArray } from "type-fest";

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
import { isThrowOnlyConsequent } from "../_internal/throw-consequent.js";
import {
    createTypedRule,
    isGlobalIdentifierNamed,
} from "../_internal/typed-rule.js";

/**
 * Checks whether an expression is `<value> instanceof Error`.
 *
 * @param context - Rule context used to verify that `Error` resolves to the
 *   global constructor.
 * @param expression - Expression to inspect.
 *
 * @returns `true` when the expression is an `instanceof` check against the
 *   global `Error` symbol.
 */
const isErrorInstanceofExpression = (
    context: Readonly<TSESLint.RuleContext<string, Readonly<UnknownArray>>>,
    expression: Readonly<TSESTree.Expression>
): expression is TSESTree.BinaryExpression => {
    if (expression.type !== "BinaryExpression") {
        return false;
    }

    if (expression.operator !== "instanceof") {
        return false;
    }

    if (expression.right.type !== "Identifier") {
        return false;
    }

    return isGlobalIdentifierNamed(context, expression.right, "Error");
};

/**
 * Extracts the guarded value from `!(value instanceof Error)` checks.
 *
 * @param context - Rule context used for global identifier resolution.
 * @param test - `IfStatement.test` expression to inspect.
 *
 * @returns The left-hand expression from `value instanceof Error` when the test
 *   shape is compatible with `assertError`; otherwise `null`.
 */
const extractAssertErrorTarget = (
    context: Readonly<TSESLint.RuleContext<string, Readonly<UnknownArray>>>,
    test: Readonly<TSESTree.Expression>
): null | TSESTree.Expression => {
    if (test.type !== "UnaryExpression") {
        return null;
    }

    if (test.operator !== "!") {
        return null;
    }

    const { argument } = test;

    if (!isErrorInstanceofExpression(context, argument)) {
        return null;
    }

    /* V8 ignore next -- ESTree allows PrivateIdentifier here, but parsed
       TS/JS `instanceof` left operands are expressions (e.g. `this.#value`),
       not bare PrivateIdentifier nodes. */
    if (argument.left.type === "PrivateIdentifier") {
        return null;
    }

    return argument.left;
};

/**
 * ESLint rule definition for `prefer-ts-extras-assert-error`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTsExtrasAssertErrorRule: ReturnType<typeof createTypedRule> =
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

                    const guardExpression = extractAssertErrorTarget(
                        context,
                        node.test
                    );

                    if (guardExpression === null) {
                        return;
                    }

                    const guardExpressionArgumentText =
                        getFunctionCallArgumentText({
                            argumentNode: guardExpression,
                            sourceCode: context.sourceCode,
                        });

                    if (guardExpressionArgumentText === null) {
                        reportWithOptionalFix({
                            context,
                            fix: null,
                            messageId: "preferTsExtrasAssertError",
                            node,
                        });

                        return;
                    }

                    const replacementFix =
                        createSafeValueNodeTextReplacementFix({
                            context,
                            importedName: "assertError",
                            imports: tsExtrasImports,
                            replacementTextFactory: (replacementName) =>
                                `${replacementName}(${guardExpressionArgumentText});`,
                            reportFixIntent: "suggestion",
                            sourceModuleName: TS_EXTRAS_MODULE_SOURCE,
                            targetNode: node,
                        });

                    if (replacementFix === null) {
                        reportWithOptionalFix({
                            context,
                            fix: null,
                            messageId: "preferTsExtrasAssertError",
                            node,
                        });

                        return;
                    }

                    reportWithTypefestPolicy({
                        context,
                        descriptor: {
                            messageId: "preferTsExtrasAssertError",
                            node,
                            suggest: [
                                {
                                    fix: replacementFix,
                                    messageId: "suggestTsExtrasAssertError",
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
                    "require ts-extras assertError over manual instanceof Error throw guards.",
                frozen: false,
                recommended: true,
                requiresTypeChecking: false,
                typefestConfigs: [
                    "typefest.configs.recommended",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                    "typefest.configs.ts-extras/type-guards",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-assert-error",
            },
            hasSuggestions: true,
            messages: {
                preferTsExtrasAssertError:
                    "Prefer `assertError` from `ts-extras` over manual `instanceof Error` throw guards.",
                suggestTsExtrasAssertError:
                    "Replace this manual guard with `assertError(...)` from `ts-extras`.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-assert-error",
    });

/**
 * Default export for the `prefer-ts-extras-assert-error` rule module.
 */
export default preferTsExtrasAssertErrorRule;
