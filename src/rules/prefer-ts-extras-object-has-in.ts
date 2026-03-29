/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-object-has-in`.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import { reportTsExtrasGlobalMemberCall } from "../_internal/global-member-call-rule.js";
import { collectDirectNamedValueImportsFromSource } from "../_internal/imported-value-symbols.js";
import { TS_EXTRAS_MODULE_SOURCE } from "../_internal/module-source.js";
import { reportWithTypefestPolicy } from "../_internal/rule-reporting.js";
import { isTypePredicateExpressionAutofixSafe } from "../_internal/type-predicate-autofix-safety.js";
import { createTypedRule } from "../_internal/typed-rule.js";

/**
 * ESLint rule definition for `prefer-ts-extras-object-has-in`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTsExtrasObjectHasInRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const tsExtrasImports = collectDirectNamedValueImportsFromSource(
                context.sourceCode,
                TS_EXTRAS_MODULE_SOURCE
            );

            return {
                'CallExpression[callee.type="MemberExpression"][callee.object.type="Identifier"][callee.object.name="Reflect"][callee.property.type="Identifier"][callee.property.name="has"]'(
                    node: TSESTree.CallExpression
                ) {
                    reportTsExtrasGlobalMemberCall({
                        canAutofix: isTypePredicateExpressionAutofixSafe,
                        context,
                        importedName: "objectHasIn",
                        imports: tsExtrasImports,
                        memberName: "has",
                        messageId: "preferTsExtrasObjectHasIn",
                        minimumArgumentCount: 2,
                        node,
                        objectName: "Reflect",
                        reportSuggestion: ({ fix, node: suggestionNode }) => {
                            reportWithTypefestPolicy({
                                context,
                                descriptor: {
                                    messageId: "preferTsExtrasObjectHasIn",
                                    node: suggestionNode,
                                    suggest: [
                                        {
                                            fix,
                                            messageId:
                                                "suggestTsExtrasObjectHasIn",
                                        },
                                    ],
                                },
                            });
                        },
                        suggestionMessageId: "suggestTsExtrasObjectHasIn",
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            deprecated: false,
            docs: {
                description:
                    "require ts-extras objectHasIn over Reflect.has for stronger key-in-object narrowing.",
                frozen: false,
                recommended: true,
                requiresTypeChecking: false,
                typefestConfigs: [
                    "typefest.configs.recommended",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                    "typefest.configs.ts-extras/type-guards",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-object-has-in",
            },
            fixable: "code",
            hasSuggestions: true,
            messages: {
                preferTsExtrasObjectHasIn:
                    "Prefer `objectHasIn` from `ts-extras` over `Reflect.has` for better type narrowing.",
                suggestTsExtrasObjectHasIn:
                    "Replace this `Reflect.has(...)` call with `objectHasIn(...)` from `ts-extras`.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-object-has-in",
    });

/**
 * Default export for the `prefer-ts-extras-object-has-in` rule module.
 */
export default preferTsExtrasObjectHasInRule;
