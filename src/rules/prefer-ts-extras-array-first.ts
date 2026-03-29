/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-array-first`.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import { safeCastTo } from "ts-extras";

import {
    createIsArrayLikeExpressionChecker,
    isWriteTargetMemberExpression,
} from "../_internal/array-like-expression.js";
import {
    collectDirectNamedValueImportsFromSource,
    createMemberToFunctionCallFix,
} from "../_internal/imported-value-symbols.js";
import { TS_EXTRAS_MODULE_SOURCE } from "../_internal/module-source.js";
import {
    reportWithOptionalFix,
    reportWithTypefestPolicy,
    resolveAutofixOrSuggestionOutcome,
} from "../_internal/rule-reporting.js";
import {
    createTypedRule,
    getTypedRuleServices,
} from "../_internal/typed-rule.js";
import { isArrayIndexReadAutofixSafe } from "../_internal/value-rewrite-autofix-safety.js";

/**
 * Checks whether a computed member property represents index `0`.
 *
 * @param node - Member property node candidate.
 *
 * @returns `true` for numeric `0` and string literal `"0"` property nodes.
 */

const isZeroProperty = (
    node: Readonly<TSESTree.Expression | TSESTree.PrivateIdentifier>
): boolean =>
    node.type === "Literal" && (node.value === 0 || node.value === "0");

/**
 * ESLint rule definition for `prefer-ts-extras-array-first`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTsExtrasArrayFirstRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const tsExtrasImports = collectDirectNamedValueImportsFromSource(
                context.sourceCode,
                TS_EXTRAS_MODULE_SOURCE
            );

            const { checker, parserServices } = getTypedRuleServices(context);
            const isArrayLikeExpression = createIsArrayLikeExpressionChecker({
                checker,
                parserServices,
                telemetryFilePath: context.physicalFilename,
            });

            return {
                'MemberExpression[computed=true][property.type="Literal"]'(
                    node
                ) {
                    const memberNode =
                        safeCastTo<TSESTree.MemberExpression>(node);

                    if (!isZeroProperty(memberNode.property)) {
                        return;
                    }

                    if (isWriteTargetMemberExpression(memberNode)) {
                        return;
                    }

                    if (!isArrayLikeExpression(memberNode.object)) {
                        return;
                    }

                    const outcome = resolveAutofixOrSuggestionOutcome({
                        canAutofix: isArrayIndexReadAutofixSafe(memberNode),
                        fix: createMemberToFunctionCallFix({
                            context,
                            importedName: "arrayFirst",
                            imports: tsExtrasImports,
                            memberNode,
                            sourceModuleName: TS_EXTRAS_MODULE_SOURCE,
                        }),
                    });

                    if (outcome.kind === "suggestion") {
                        reportWithTypefestPolicy({
                            context,
                            descriptor: {
                                messageId: "preferTsExtrasArrayFirst",
                                node: memberNode,
                                suggest: [
                                    {
                                        fix: outcome.fix,
                                        messageId: "suggestTsExtrasArrayFirst",
                                    },
                                ],
                            },
                        });

                        return;
                    }

                    reportWithOptionalFix({
                        context,
                        fix: outcome.kind === "autofix" ? outcome.fix : null,
                        messageId: "preferTsExtrasArrayFirst",
                        node: memberNode,
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            deprecated: false,
            docs: {
                description:
                    "require ts-extras arrayFirst over direct [0] array access for stronger tuple and readonly-array inference.",
                frozen: false,
                recommended: false,
                requiresTypeChecking: true,
                typefestConfigs: [
                    "typefest.configs.strict",
                    "typefest.configs.all",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-array-first",
            },
            fixable: "code",
            hasSuggestions: true,
            messages: {
                preferTsExtrasArrayFirst:
                    "Prefer `arrayFirst` from `ts-extras` over direct `array[0]` access for stronger inference.",
                suggestTsExtrasArrayFirst:
                    "Replace this direct index access with `arrayFirst(...)` from `ts-extras`.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-array-first",
    });

/**
 * Default export for the `prefer-ts-extras-array-first` rule module.
 */
export default preferTsExtrasArrayFirstRule;
