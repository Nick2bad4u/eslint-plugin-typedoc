/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-object-values`.
 */
import { reportTsExtrasGlobalMemberCall } from "../_internal/global-member-call-rule.js";
import { collectDirectNamedValueImportsFromSource } from "../_internal/imported-value-symbols.js";
import { TS_EXTRAS_MODULE_SOURCE } from "../_internal/module-source.js";
import { createTypedRule } from "../_internal/typed-rule.js";

/**
 * ESLint rule definition for `prefer-ts-extras-object-values`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTsExtrasObjectValuesRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const tsExtrasImports = collectDirectNamedValueImportsFromSource(
                context.sourceCode,
                TS_EXTRAS_MODULE_SOURCE
            );

            return {
                'CallExpression[callee.type="MemberExpression"][callee.object.type="Identifier"][callee.object.name="Object"][callee.property.type="Identifier"][callee.property.name="values"]'(
                    node
                ) {
                    reportTsExtrasGlobalMemberCall({
                        context,
                        importedName: "objectValues",
                        imports: tsExtrasImports,
                        memberName: "values",
                        messageId: "preferTsExtrasObjectValues",
                        node,
                        objectName: "Object",
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            deprecated: false,
            docs: {
                description:
                    "require ts-extras objectValues over Object.values for stronger value inference.",
                frozen: false,
                recommended: false,
                requiresTypeChecking: false,
                typefestConfigs: [
                    "typefest.configs.strict",
                    "typefest.configs.all",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-object-values",
            },
            fixable: "code",
            messages: {
                preferTsExtrasObjectValues:
                    "Prefer `objectValues` from `ts-extras` over `Object.values(...)` for stronger value inference.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-object-values",
    });

/**
 * Default export for the `prefer-ts-extras-object-values` rule module.
 */
export default preferTsExtrasObjectValuesRule;
