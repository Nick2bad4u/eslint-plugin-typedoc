/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-object-has-own`.
 */
import { reportTsExtrasGlobalMemberCall } from "../_internal/global-member-call-rule.js";
import { collectDirectNamedValueImportsFromSource } from "../_internal/imported-value-symbols.js";
import { TS_EXTRAS_MODULE_SOURCE } from "../_internal/module-source.js";
import { reportWithTypefestPolicy } from "../_internal/rule-reporting.js";
import { isTypePredicateExpressionAutofixSafe } from "../_internal/type-predicate-autofix-safety.js";
import { createTypedRule } from "../_internal/typed-rule.js";

/**
 * ESLint rule definition for `prefer-ts-extras-object-has-own`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTsExtrasObjectHasOwnRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const tsExtrasImports = collectDirectNamedValueImportsFromSource(
                context.sourceCode,
                TS_EXTRAS_MODULE_SOURCE
            );

            return {
                'CallExpression[callee.type="MemberExpression"][callee.object.type="Identifier"][callee.object.name="Object"][callee.property.type="Identifier"][callee.property.name="hasOwn"]'(
                    node
                ) {
                    reportTsExtrasGlobalMemberCall({
                        canAutofix: isTypePredicateExpressionAutofixSafe,
                        context,
                        importedName: "objectHasOwn",
                        imports: tsExtrasImports,
                        memberName: "hasOwn",
                        messageId: "preferTsExtrasObjectHasOwn",
                        node,
                        objectName: "Object",
                        reportSuggestion: ({ fix, node: suggestionNode }) => {
                            reportWithTypefestPolicy({
                                context,
                                descriptor: {
                                    messageId: "preferTsExtrasObjectHasOwn",
                                    node: suggestionNode,
                                    suggest: [
                                        {
                                            fix,
                                            messageId:
                                                "suggestTsExtrasObjectHasOwn",
                                        },
                                    ],
                                },
                            });
                        },
                        suggestionMessageId: "suggestTsExtrasObjectHasOwn",
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            deprecated: false,
            docs: {
                description:
                    "require ts-extras objectHasOwn over Object.hasOwn for own-property checks that should also narrow object types.",
                frozen: false,
                recommended: true,
                requiresTypeChecking: false,
                typefestConfigs: [
                    "typefest.configs.recommended",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                    "typefest.configs.ts-extras/type-guards",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-object-has-own",
            },
            fixable: "code",
            hasSuggestions: true,
            messages: {
                preferTsExtrasObjectHasOwn:
                    "Prefer `objectHasOwn` from `ts-extras` over `Object.hasOwn` for own-property guards with stronger type narrowing.",
                suggestTsExtrasObjectHasOwn:
                    "Replace this `Object.hasOwn(...)` call with `objectHasOwn(...)` from `ts-extras`.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-object-has-own",
    });

/**
 * Default export for the `prefer-ts-extras-object-has-own` rule module.
 */
export default preferTsExtrasObjectHasOwnRule;
