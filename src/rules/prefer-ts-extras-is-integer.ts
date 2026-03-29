/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-is-integer`.
 */
import { reportTsExtrasGlobalMemberCall } from "../_internal/global-member-call-rule.js";
import { collectDirectNamedValueImportsFromSource } from "../_internal/imported-value-symbols.js";
import { TS_EXTRAS_MODULE_SOURCE } from "../_internal/module-source.js";
import { createTypedRule } from "../_internal/typed-rule.js";

/**
 * ESLint rule definition for `prefer-ts-extras-is-integer`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTsExtrasIsIntegerRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const tsExtrasImports = collectDirectNamedValueImportsFromSource(
                context.sourceCode,
                TS_EXTRAS_MODULE_SOURCE
            );

            return {
                'CallExpression[callee.type="MemberExpression"][callee.object.type="Identifier"][callee.object.name="Number"][callee.property.type="Identifier"][callee.property.name="isInteger"]'(
                    node
                ) {
                    reportTsExtrasGlobalMemberCall({
                        context,
                        importedName: "isInteger",
                        imports: tsExtrasImports,
                        memberName: "isInteger",
                        messageId: "preferTsExtrasIsInteger",
                        node,
                        objectName: "Number",
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            deprecated: false,
            docs: {
                description:
                    "require ts-extras isInteger over Number.isInteger for consistent predicate helper usage.",
                frozen: false,
                recommended: true,
                requiresTypeChecking: false,
                typefestConfigs: [
                    "typefest.configs.recommended",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                    "typefest.configs.ts-extras/type-guards",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-is-integer",
            },
            fixable: "code",
            messages: {
                preferTsExtrasIsInteger:
                    "Prefer `isInteger` from `ts-extras` over `Number.isInteger(...)`.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-is-integer",
    });

/**
 * Default export for the `prefer-ts-extras-is-integer` rule module.
 */
export default preferTsExtrasIsIntegerRule;
