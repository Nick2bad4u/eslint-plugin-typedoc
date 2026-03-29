/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-array-find-last-index`.
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
 * ESLint rule definition for `prefer-ts-extras-array-find-last-index`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTsExtrasArrayFindLastIndexRule: ReturnType<typeof createTypedRule> =
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
                'CallExpression[callee.type="MemberExpression"][callee.computed=false][callee.property.type="Identifier"][callee.property.name="findLastIndex"]'(
                    node
                ) {
                    reportTsExtrasArrayMethodCall({
                        context,
                        importedName: "arrayFindLastIndex",
                        imports: tsExtrasImports,
                        isArrayLikeExpression,
                        memberName: "findLastIndex",
                        messageId: "preferTsExtrasArrayFindLastIndex",
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
                    "require ts-extras arrayFindLastIndex over Array#findLastIndex for stronger predicate inference.",
                frozen: false,
                recommended: false,
                requiresTypeChecking: true,
                typefestConfigs: "typefest.configs.all",
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-array-find-last-index",
            },
            fixable: "code",
            messages: {
                preferTsExtrasArrayFindLastIndex:
                    "Prefer `arrayFindLastIndex` from `ts-extras` over `array.findLastIndex(...)` for stronger predicate inference.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-array-find-last-index",
    });

/**
 * Default export for the `prefer-ts-extras-array-find-last-index` rule module.
 */
export default preferTsExtrasArrayFindLastIndexRule;
