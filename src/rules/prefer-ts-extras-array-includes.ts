/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-array-includes`.
 */
import { createIsArrayLikeExpressionChecker } from "../_internal/array-like-expression.js";
import { reportTsExtrasArrayMethodCall } from "../_internal/array-method-call-rule.js";
import { collectDirectNamedValueImportsFromSource } from "../_internal/imported-value-symbols.js";
import { TS_EXTRAS_MODULE_SOURCE } from "../_internal/module-source.js";
import { reportWithTypefestPolicy } from "../_internal/rule-reporting.js";
import { isTypePredicateAutofixSafe } from "../_internal/type-predicate-autofix-safety.js";
import {
    createTypedRule,
    getTypedRuleServices,
} from "../_internal/typed-rule.js";

/**
 * ESLint rule definition for `prefer-ts-extras-array-includes`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTsExtrasArrayIncludesRule: ReturnType<typeof createTypedRule> =
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
                'CallExpression[callee.type="MemberExpression"][callee.computed=false][callee.property.type="Identifier"][callee.property.name="includes"]'(
                    node
                ) {
                    reportTsExtrasArrayMethodCall({
                        canAutofix: isTypePredicateAutofixSafe,
                        context,
                        importedName: "arrayIncludes",
                        imports: tsExtrasImports,
                        isArrayLikeExpression,
                        memberName: "includes",
                        messageId: "preferTsExtrasArrayIncludes",
                        node,
                        reportSuggestion: ({ fix, node: suggestionNode }) => {
                            reportWithTypefestPolicy({
                                context,
                                descriptor: {
                                    messageId: "preferTsExtrasArrayIncludes",
                                    node: suggestionNode,
                                    suggest: [
                                        {
                                            fix,
                                            messageId:
                                                "suggestTsExtrasArrayIncludes",
                                        },
                                    ],
                                },
                            });
                        },
                        suggestionMessageId: "suggestTsExtrasArrayIncludes",
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            deprecated: false,
            docs: {
                description:
                    "require ts-extras arrayIncludes over Array#includes for stronger element inference.",
                frozen: false,
                recommended: false,
                requiresTypeChecking: true,
                typefestConfigs: [
                    "typefest.configs.recommended-type-checked",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                    "typefest.configs.ts-extras/type-guards",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-array-includes",
            },
            fixable: "code",
            hasSuggestions: true,
            messages: {
                preferTsExtrasArrayIncludes:
                    "Prefer `arrayIncludes` from `ts-extras` over `array.includes(...)` for stronger element inference.",
                suggestTsExtrasArrayIncludes:
                    "Replace this `array.includes(...)` call with `arrayIncludes(...)` from `ts-extras`.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-array-includes",
    });

/**
 * Default export for the `prefer-ts-extras-array-includes` rule module.
 */
export default preferTsExtrasArrayIncludesRule;
