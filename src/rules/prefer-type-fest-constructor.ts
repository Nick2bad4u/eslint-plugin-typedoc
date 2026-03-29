/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-constructor`.
 */
import { arrayJoin, isDefined } from "ts-extras";

import {
    collectDirectNamedImportsFromSource,
    createSafeTypeNodeTextReplacementFix,
} from "../_internal/imported-type-aliases.js";
import { TYPE_FEST_MODULE_SOURCE } from "../_internal/module-source.js";
import { reportWithOptionalFix } from "../_internal/rule-reporting.js";
import { createTypedRule } from "../_internal/typed-rule.js";

/**
 * ESLint rule definition for `prefer-type-fest-constructor`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTypeFestConstructorRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const typeFestDirectImports = collectDirectNamedImportsFromSource(
                context.sourceCode,
                TYPE_FEST_MODULE_SOURCE
            );
            const { sourceCode } = context;

            return {
                TSConstructorType(node) {
                    if (node.abstract) {
                        return;
                    }

                    const replacementFix =
                        !isDefined(node.typeParameters) &&
                        isDefined(node.returnType)
                            ? createSafeTypeNodeTextReplacementFix(
                                  node,
                                  "Constructor",
                                  `Constructor<${sourceCode.getText(node.returnType.typeAnnotation)}, [${arrayJoin(
                                      node.params.map((parameter) =>
                                          sourceCode.getText(parameter)
                                      ),
                                      ", "
                                  )}]>`,
                                  typeFestDirectImports
                              )
                            : null;

                    reportWithOptionalFix({
                        context,
                        fix: replacementFix,
                        messageId: "preferConstructorSignature",
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
                    "require TypeFest Constructor over explicit `new (...) => ...` constructor signatures.",
                frozen: false,
                recommended: true,
                requiresTypeChecking: false,
                typefestConfigs: [
                    "typefest.configs.recommended",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                    "typefest.configs.type-fest/types",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-constructor",
            },
            fixable: "code",
            messages: {
                preferConstructorSignature:
                    "Prefer `Constructor<...>` from type-fest over explicit `new (...) => ...` constructor signatures.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-constructor",
    });

/**
 * Default export for the `prefer-type-fest-constructor` rule module.
 */
export default preferTypeFestConstructorRule;
