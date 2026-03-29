/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-tuple-of`.
 */
import type { TSESLint, TSESTree } from "@typescript-eslint/utils";

import {
    collectDirectNamedImportsFromSource,
    collectImportedTypeAliasMatches,
    createSafeTypeNodeTextReplacementFix,
    isTypeParameterNameShadowed,
} from "../_internal/imported-type-aliases.js";
import { TYPE_FEST_MODULE_SOURCE } from "../_internal/module-source.js";
import { reportWithOptionalFix } from "../_internal/rule-reporting.js";
import { createTypedRule } from "../_internal/typed-rule.js";

const tupleOfLegacyAliases = ["ReadonlyTuple", "Tuple"] as const;

type PreferTypeFestTupleOfOption = Readonly<{
    enforcedAliasNames?: readonly ("ReadonlyTuple" | "Tuple")[];
}>;

type TupleOfLegacyAlias = (typeof tupleOfLegacyAliases)[number];

const defaultOption = {
    enforcedAliasNames: ["ReadonlyTuple", "Tuple"],
} as const;

const defaultOptions = [defaultOption] as const;

/**
 * Legacy tuple aliases this rule normalizes to `TupleOf` forms.
 */
const tupleOfAliasReplacements = {
    ReadonlyTuple: "Readonly<TupleOf<Length, Element>>",
    Tuple: "TupleOf<Length, Element>",
} as const;

/**
 * Builds replacement text that preserves readonly semantics for legacy tuple
 * aliases.
 *
 * @param importedAliasName - Alias name detected in source.
 * @param lengthTypeText - Serialized tuple length type argument.
 * @param elementTypeText - Serialized tuple element type argument.
 *
 * @returns Replacement text using canonical `TupleOf` syntax.
 */
const createTupleOfReplacementText = (
    importedAliasName: string,
    lengthTypeText: string,
    elementTypeText: string
): string =>
    importedAliasName === "ReadonlyTuple"
        ? `Readonly<TupleOf<${lengthTypeText}, ${elementTypeText}>>`
        : `TupleOf<${lengthTypeText}, ${elementTypeText}>`;

/**
 * ESLint rule definition for `prefer-type-fest-tuple-of`.
 *
 * @remarks
 * Defines metadata, diagnostics, and fixes for replacing legacy tuple aliases
 * with canonical `TupleOf` forms.
 */
const preferTypeFestTupleOfRule: ReturnType<typeof createTypedRule> =
    createTypedRule<readonly [PreferTypeFestTupleOfOption], "preferTupleOf">({
        create(context, [options] = defaultOptions) {
            const enabledAliasReplacements: Partial<
                Record<TupleOfLegacyAlias, string>
            > = {};

            for (const aliasName of options.enforcedAliasNames ??
                tupleOfLegacyAliases) {
                enabledAliasReplacements[aliasName] =
                    tupleOfAliasReplacements[aliasName];
            }

            const importedAliasMatches = collectImportedTypeAliasMatches(
                context.sourceCode,
                enabledAliasReplacements
            );
            const typeFestDirectImports = collectDirectNamedImportsFromSource(
                context.sourceCode,
                TYPE_FEST_MODULE_SOURCE
            );

            return {
                'TSTypeReference[typeName.type="Identifier"]'(
                    node: TSESTree.TSTypeReference
                ) {
                    if (node.typeName.type !== "Identifier") {
                        return;
                    }

                    const importedAliasMatch = importedAliasMatches.get(
                        node.typeName.name
                    );
                    if (!importedAliasMatch) {
                        return;
                    }

                    const tupleTypeParameters = node.typeArguments?.params;
                    let fix: null | TSESLint.ReportFixFunction = null;

                    if (tupleTypeParameters?.length === 2) {
                        const [elementType, lengthType] = tupleTypeParameters;
                        const elementTypeText =
                            context.sourceCode.getText(elementType);
                        const lengthTypeText =
                            context.sourceCode.getText(lengthType);
                        const usesReadonlyWrapper =
                            importedAliasMatch.importedName === "ReadonlyTuple";

                        if (
                            !usesReadonlyWrapper ||
                            !isTypeParameterNameShadowed(node, "Readonly")
                        ) {
                            const replacementText =
                                createTupleOfReplacementText(
                                    importedAliasMatch.importedName,
                                    lengthTypeText,
                                    elementTypeText
                                );

                            fix = createSafeTypeNodeTextReplacementFix(
                                node,
                                "TupleOf",
                                replacementText,
                                typeFestDirectImports
                            );
                        }
                    }

                    const reportData = {
                        alias: importedAliasMatch.importedName,
                        replacement: importedAliasMatch.replacementName,
                    };

                    reportWithOptionalFix({
                        context,
                        data: reportData,
                        fix,
                        messageId: "preferTupleOf",
                        node,
                    });
                },
            };
        },
        defaultOptions,
        meta: {
            defaultOptions: [defaultOption],
            deprecated: false,
            docs: {
                description:
                    "require TypeFest TupleOf over imported aliases such as ReadonlyTuple and Tuple.",
                frozen: false,
                recommended: true,
                requiresTypeChecking: false,
                typefestConfigs: [
                    "typefest.configs.recommended",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                    "typefest.configs.type-fest/types",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-tuple-of",
            },
            fixable: "code",
            messages: {
                preferTupleOf:
                    "Prefer `{{replacement}}` from type-fest to model fixed-length homogeneous tuples instead of legacy alias `{{alias}}`.",
            },
            schema: [
                {
                    additionalProperties: false,
                    description:
                        "Configuration for alias names enforced by prefer-type-fest-tuple-of.",
                    minProperties: 1,
                    properties: {
                        enforcedAliasNames: {
                            description:
                                "Legacy alias names to report and replace with TupleOf forms.",
                            items: {
                                enum: [...tupleOfLegacyAliases],
                                type: "string",
                            },
                            minItems: 1,
                            type: "array",
                            uniqueItems: true,
                        },
                    },
                    type: "object",
                },
            ],
            type: "suggestion",
        },
        name: "prefer-type-fest-tuple-of",
    });

/**
 * Default export for the `prefer-type-fest-tuple-of` rule module.
 */
export default preferTypeFestTupleOfRule;
