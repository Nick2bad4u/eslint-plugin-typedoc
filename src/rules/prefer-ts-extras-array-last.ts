/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-array-last`.
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
import { areEquivalentExpressions } from "../_internal/normalize-expression-text.js";
import {
    reportWithOptionalFix,
    reportWithTypefestPolicy,
    resolveAutofixOrSuggestionOutcome,
} from "../_internal/rule-reporting.js";
import {
    createTypedRule,
    getTypedRuleServices,
} from "../_internal/typed-rule.js";
import {
    isArrayIndexReadAutofixSafe,
    isRepeatablyEvaluableExpression,
} from "../_internal/value-rewrite-autofix-safety.js";

/**
 * Detects direct last-element index access (`value[value.length - 1]`).
 *
 * @param node - Member expression to inspect.
 *
 * @returns `true` when the member expression uses a computed `length - 1` index
 *   derived from the same object.
 */
const isLastIndexPattern = (
    node: Readonly<TSESTree.MemberExpression>
): boolean => {
    if (!node.computed || node.property.type !== "BinaryExpression") {
        return false;
    }

    const propertyExpression = node.property;

    if (propertyExpression.operator !== "-") {
        return false;
    }

    if (propertyExpression.right.type !== "Literal") {
        return false;
    }

    if (propertyExpression.right.value !== 1) {
        return false;
    }

    const objectExpression = node.object;

    if (
        propertyExpression.left.type !== "MemberExpression" ||
        propertyExpression.left.computed ||
        propertyExpression.left.property.type !== "Identifier" ||
        propertyExpression.left.property.name !== "length"
    ) {
        return false;
    }

    if (propertyExpression.left.object.type === "Super") {
        return false;
    }

    return areEquivalentExpressions(
        propertyExpression.left.object,
        objectExpression
    );
};

/** Rule module definition for `prefer-ts-extras-array-last`. */
const preferTsExtrasArrayLastRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const directImports = collectDirectNamedValueImportsFromSource(
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
                'MemberExpression[computed=true][property.type="BinaryExpression"][property.operator="-"]'(
                    node
                ): void {
                    const memberNode =
                        safeCastTo<TSESTree.MemberExpression>(node);

                    if (!isLastIndexPattern(memberNode)) {
                        return;
                    }

                    if (isWriteTargetMemberExpression(memberNode)) {
                        return;
                    }

                    if (!isArrayLikeExpression(memberNode.object)) {
                        return;
                    }

                    const fixes = createMemberToFunctionCallFix({
                        context,
                        importedName: "arrayLast",
                        imports: directImports,
                        memberNode,
                        sourceModuleName: TS_EXTRAS_MODULE_SOURCE,
                    });

                    const outcome = resolveAutofixOrSuggestionOutcome({
                        canAutofix:
                            isArrayIndexReadAutofixSafe(memberNode) &&
                            isRepeatablyEvaluableExpression(memberNode.object),
                        fix: fixes,
                    });

                    if (outcome.kind === "suggestion") {
                        reportWithTypefestPolicy({
                            context,
                            descriptor: {
                                messageId: "preferTsExtrasArrayLast",
                                node: memberNode,
                                suggest: [
                                    {
                                        fix: outcome.fix,
                                        messageId: "suggestTsExtrasArrayLast",
                                    },
                                ],
                            },
                        });

                        return;
                    }

                    reportWithOptionalFix({
                        context,
                        fix: outcome.kind === "autofix" ? outcome.fix : null,
                        messageId: "preferTsExtrasArrayLast",
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
                    "require `arrayLast` from `ts-extras` instead of manual last-index member access.",
                frozen: false,
                recommended: false,
                requiresTypeChecking: true,
                typefestConfigs: [
                    "typefest.configs.recommended-type-checked",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-array-last",
            },
            fixable: "code",
            hasSuggestions: true,
            messages: {
                preferTsExtrasArrayLast:
                    "Prefer `arrayLast` from `ts-extras` over direct last-index access.",
                suggestTsExtrasArrayLast:
                    "Replace this last-index access with `arrayLast(...)` from `ts-extras`.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-array-last",
    });

/**
 * Default export for the `prefer-ts-extras-array-last` rule module.
 */
export default preferTsExtrasArrayLastRule;
