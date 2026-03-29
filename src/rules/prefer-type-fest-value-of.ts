/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-value-of`.
 */
import {
    collectDirectNamedImportsFromSource,
    createSafeTypeNodeTextReplacementFix,
} from "../_internal/imported-type-aliases.js";
import { TYPE_FEST_MODULE_SOURCE } from "../_internal/module-source.js";
import { areEquivalentTypeNodes } from "../_internal/normalize-expression-text.js";
import { reportWithOptionalFix } from "../_internal/rule-reporting.js";
import { createTypedRule } from "../_internal/typed-rule.js";

/**
 * ESLint rule definition for `prefer-type-fest-value-of`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTypeFestValueOfRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const { sourceCode } = context;
            const typeFestDirectImports = collectDirectNamedImportsFromSource(
                sourceCode,
                TYPE_FEST_MODULE_SOURCE
            );

            return {
                TSIndexedAccessType(node) {
                    if (
                        node.indexType.type !== "TSTypeOperator" ||
                        node.indexType.operator !== "keyof"
                    ) {
                        return;
                    }

                    const keyOfTargetType = node.indexType.typeAnnotation;
                    /* v8 ignore start */
                    if (!keyOfTargetType) {
                        return;
                    }
                    /* v8 ignore stop */

                    if (
                        !areEquivalentTypeNodes(
                            node.objectType,
                            keyOfTargetType
                        )
                    ) {
                        return;
                    }

                    const fix = createSafeTypeNodeTextReplacementFix(
                        node,
                        "ValueOf",
                        `ValueOf<${sourceCode.getText(node.objectType)}>`,
                        typeFestDirectImports
                    );

                    reportWithOptionalFix({
                        context,
                        fix,
                        messageId: "preferValueOf",
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
                    "require TypeFest ValueOf over direct T[keyof T] indexed-access unions for object value extraction.",
                frozen: false,
                recommended: true,
                requiresTypeChecking: false,
                typefestConfigs: [
                    "typefest.configs.recommended",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                    "typefest.configs.type-fest/types",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-value-of",
            },
            fixable: "code",
            messages: {
                preferValueOf:
                    "Prefer `ValueOf<T>` from type-fest over `T[keyof T]` for object value unions.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-value-of",
    });

/**
 * Default export for the `prefer-type-fest-value-of` rule module.
 */
export default preferTypeFestValueOfRule;
