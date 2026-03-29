/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-is-finite`.
 */
import { reportTsExtrasGlobalMemberCall } from "../_internal/global-member-call-rule.js";
import { collectDirectNamedValueImportsFromSource } from "../_internal/imported-value-symbols.js";
import { TS_EXTRAS_MODULE_SOURCE } from "../_internal/module-source.js";
import { createTypedRule } from "../_internal/typed-rule.js";

/**
 * ESLint rule definition for `prefer-ts-extras-is-finite`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTsExtrasIsFiniteRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const tsExtrasImports = collectDirectNamedValueImportsFromSource(
                context.sourceCode,
                TS_EXTRAS_MODULE_SOURCE
            );

            return {
                'CallExpression[callee.type="MemberExpression"][callee.object.type="Identifier"][callee.object.name="Number"][callee.property.type="Identifier"][callee.property.name="isFinite"]'(
                    node
                ) {
                    reportTsExtrasGlobalMemberCall({
                        context,
                        importedName: "isFinite",
                        imports: tsExtrasImports,
                        memberName: "isFinite",
                        messageId: "preferTsExtrasIsFinite",
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
                    "require ts-extras isFinite over Number.isFinite for consistent predicate helper usage.",
                frozen: false,
                recommended: true,
                requiresTypeChecking: false,
                typefestConfigs: [
                    "typefest.configs.recommended",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                    "typefest.configs.ts-extras/type-guards",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-is-finite",
            },
            fixable: "code",
            messages: {
                preferTsExtrasIsFinite:
                    "Prefer `isFinite` from `ts-extras` over `Number.isFinite(...)`.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-is-finite",
    });

/**
 * Default export for the `prefer-ts-extras-is-finite` rule module.
 */
export default preferTsExtrasIsFiniteRule;
