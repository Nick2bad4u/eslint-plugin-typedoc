/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-is-empty`.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import { createIsArrayLikeExpressionChecker } from "../_internal/array-like-expression.js";
import {
    collectDirectNamedValueImportsFromSource,
    createSafeValueArgumentFunctionCallFix,
} from "../_internal/imported-value-symbols.js";
import { TS_EXTRAS_MODULE_SOURCE } from "../_internal/module-source.js";
import { reportWithOptionalFix } from "../_internal/rule-reporting.js";
import {
    createTypedRule,
    getTypedRuleServices,
} from "../_internal/typed-rule.js";
import { createTypeScriptEslintNodeExpressionSkipChecker } from "../_internal/typescript-eslint-node-autofix.js";

/**
 * Checks whether an expression is the numeric literal `0`.
 *
 * @param node - Expression node to inspect.
 *
 * @returns `true` when the node is a `Literal` whose value is `0`.
 */

const isZeroLiteral = (node: Readonly<TSESTree.Expression>): boolean =>
    node.type === "Literal" && node.value === 0;

/**
 * Narrows expressions to direct `.length` member access.
 *
 * @param node - Expression node to inspect.
 *
 * @returns `true` when the node is a non-computed member expression whose
 *   property identifier is `length`.
 */

const isLengthMemberExpression = (
    node: Readonly<TSESTree.Expression>
): node is TSESTree.MemberExpression & { property: TSESTree.Identifier } =>
    node.type === "MemberExpression" &&
    !node.computed &&
    node.property.type === "Identifier" &&
    node.property.name === "length";

/**
 * ESLint rule definition for `prefer-ts-extras-is-empty`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTsExtrasIsEmptyRule: ReturnType<typeof createTypedRule> =
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
                unionMatchMode: "every",
            });
            const shouldSkipComparedExpression =
                createTypeScriptEslintNodeExpressionSkipChecker(context, {
                    checker,
                    parserServices,
                });

            return {
                BinaryExpression(node) {
                    if (node.operator !== "==" && node.operator !== "===") {
                        return;
                    }

                    const isLeftLengthCheck =
                        isLengthMemberExpression(node.left) &&
                        isZeroLiteral(node.right);
                    const isRightLengthCheck =
                        isLengthMemberExpression(node.right) &&
                        isZeroLiteral(node.left);

                    if (!isLeftLengthCheck && !isRightLengthCheck) {
                        return;
                    }

                    const lengthNode = isLeftLengthCheck
                        ? node.left
                        : node.right;

                    if (!isLengthMemberExpression(lengthNode)) {
                        return;
                    }

                    if (!isArrayLikeExpression(lengthNode.object)) {
                        return;
                    }

                    if (shouldSkipComparedExpression(lengthNode.object)) {
                        return;
                    }

                    reportWithOptionalFix({
                        context,
                        fix: createSafeValueArgumentFunctionCallFix({
                            argumentNode: lengthNode.object,
                            context,
                            importedName: "isEmpty",
                            imports: tsExtrasImports,
                            sourceModuleName: TS_EXTRAS_MODULE_SOURCE,
                            targetNode: node,
                        }),
                        messageId: "preferTsExtrasIsEmpty",
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
                    "require ts-extras isEmpty over direct array.length === 0 checks for consistent emptiness guards.",
                frozen: false,
                recommended: false,
                requiresTypeChecking: true,
                typefestConfigs: [
                    "typefest.configs.recommended-type-checked",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                    "typefest.configs.ts-extras/type-guards",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-is-empty",
            },
            fixable: "code",
            messages: {
                preferTsExtrasIsEmpty:
                    "Prefer `isEmpty` from `ts-extras` over direct `array.length === 0` checks.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-is-empty",
    });

/**
 * Default export for the `prefer-ts-extras-is-empty` rule module.
 */
export default preferTsExtrasIsEmptyRule;
