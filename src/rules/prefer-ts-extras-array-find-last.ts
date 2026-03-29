/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-array-find-last`.
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
 * ESLint rule definition for `prefer-ts-extras-array-find-last`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTsExtrasArrayFindLastRule: ReturnType<typeof createTypedRule> =
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
                'CallExpression[callee.type="MemberExpression"][callee.computed=false][callee.property.type="Identifier"][callee.property.name="findLast"]'(
                    node
                ) {
                    reportTsExtrasArrayMethodCall({
                        context,
                        importedName: "arrayFindLast",
                        imports: tsExtrasImports,
                        isArrayLikeExpression,
                        memberName: "findLast",
                        messageId: "preferTsExtrasArrayFindLast",
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
                    "require ts-extras arrayFindLast over Array#findLast for stronger predicate inference.",
                frozen: false,
                recommended: false,
                requiresTypeChecking: true,
                typefestConfigs: [
                    "typefest.configs.strict",
                    "typefest.configs.all",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-array-find-last",
            },
            fixable: "code",
            messages: {
                preferTsExtrasArrayFindLast:
                    "Prefer `arrayFindLast` from `ts-extras` over `array.findLast(...)` for stronger predicate inference.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-array-find-last",
    });

/**
 * Default export for the `prefer-ts-extras-array-find-last` rule module.
 */
export default preferTsExtrasArrayFindLastRule;
