/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-array-concat`.
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
 * ESLint rule definition for `prefer-ts-extras-array-concat`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTsExtrasArrayConcatRule: ReturnType<typeof createTypedRule> =
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
                'CallExpression[callee.type="MemberExpression"][callee.computed=false][callee.property.type="Identifier"][callee.property.name="concat"]'(
                    node
                ) {
                    reportTsExtrasArrayMethodCall({
                        context,
                        importedName: "arrayConcat",
                        imports: tsExtrasImports,
                        isArrayLikeExpression,
                        memberName: "concat",
                        messageId: "preferTsExtrasArrayConcat",
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
                    "require ts-extras arrayConcat over Array#concat for stronger tuple and readonly-array typing.",
                frozen: false,
                recommended: false,
                requiresTypeChecking: true,
                typefestConfigs: [
                    "typefest.configs.strict",
                    "typefest.configs.all",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-array-concat",
            },
            fixable: "code",
            messages: {
                preferTsExtrasArrayConcat:
                    "Prefer `arrayConcat` from `ts-extras` over `array.concat(...)` for stronger tuple and readonly-array typing.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-array-concat",
    });

/**
 * Default export for the `prefer-ts-extras-array-concat` rule module.
 */
export default preferTsExtrasArrayConcatRule;
