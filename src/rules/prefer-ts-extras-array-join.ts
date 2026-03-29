/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-array-join`.
 */
import { createIsArrayLikeExpressionChecker } from "../_internal/array-like-expression.js";
import { reportTsExtrasArrayMethodCall } from "../_internal/array-method-call-rule.js";
import { collectDirectNamedValueImportsFromSource } from "../_internal/imported-value-symbols.js";
import { TS_EXTRAS_MODULE_SOURCE } from "../_internal/module-source.js";
import {
    createTypedRule,
    getTypedRuleServices,
} from "../_internal/typed-rule.js";

/**
 * ESLint rule definition for `prefer-ts-extras-array-join`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTsExtrasArrayJoinRule: ReturnType<typeof createTypedRule> =
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
                'CallExpression[callee.type="MemberExpression"][callee.computed=false][callee.property.type="Identifier"][callee.property.name="join"]'(
                    node
                ) {
                    reportTsExtrasArrayMethodCall({
                        context,
                        importedName: "arrayJoin",
                        imports: tsExtrasImports,
                        isArrayLikeExpression,
                        memberName: "join",
                        messageId: "preferTsExtrasArrayJoin",
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
                    "require ts-extras arrayJoin over Array#join for stronger tuple-aware typing.",
                frozen: false,
                recommended: false,
                requiresTypeChecking: true,
                typefestConfigs: [
                    "typefest.configs.strict",
                    "typefest.configs.all",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-array-join",
            },
            fixable: "code",
            messages: {
                preferTsExtrasArrayJoin:
                    "Prefer `arrayJoin` from `ts-extras` over `array.join(...)` for stronger tuple-aware typing.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-array-join",
    });

/**
 * Default export for the `prefer-ts-extras-array-join` rule module.
 */
export default preferTsExtrasArrayJoinRule;
