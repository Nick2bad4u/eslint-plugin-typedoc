/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-require-exactly-one`.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import {
    collectDirectNamedImportsFromSource,
    collectImportedTypeAliasMatches,
    createSafeTypeReferenceReplacementFix,
} from "../_internal/imported-type-aliases.js";
import { TYPE_FEST_MODULE_SOURCE } from "../_internal/module-source.js";
import { reportWithOptionalFix } from "../_internal/rule-reporting.js";
import { createTypedRule } from "../_internal/typed-rule.js";

const requireExactlyOneLegacyAliases = ["OneOf", "RequireOnlyOne"] as const;

type PreferTypeFestRequireExactlyOneOption = Readonly<{
    enforcedAliasNames?: readonly ("OneOf" | "RequireOnlyOne")[];
}>;

type RequireExactlyOneLegacyAlias =
    (typeof requireExactlyOneLegacyAliases)[number];

const defaultOption = {
    enforcedAliasNames: [...requireExactlyOneLegacyAliases],
} as const;

const defaultOptions = [defaultOption] as const;

const requireExactlyOneAliasReplacements = {
    OneOf: "RequireExactlyOne",
    RequireOnlyOne: "RequireExactlyOne",
} as const;

/**
 * ESLint rule definition for `prefer-type-fest-require-exactly-one`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTypeFestRequireExactlyOneRule: ReturnType<typeof createTypedRule> =
    createTypedRule<
        readonly [PreferTypeFestRequireExactlyOneOption],
        "preferRequireExactlyOne"
    >({
        create(context, [options] = defaultOptions) {
            const enabledAliasReplacements: Partial<
                Record<RequireExactlyOneLegacyAlias, "RequireExactlyOne">
            > = {};

            for (const aliasName of options.enforcedAliasNames ??
                requireExactlyOneLegacyAliases) {
                enabledAliasReplacements[aliasName] =
                    requireExactlyOneAliasReplacements[aliasName];
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

                    const aliasReplacementFix =
                        createSafeTypeReferenceReplacementFix(
                            node,
                            importedAliasMatch.replacementName,
                            typeFestDirectImports
                        );

                    reportWithOptionalFix({
                        context,
                        data: {
                            alias: importedAliasMatch.importedName,
                            replacement: importedAliasMatch.replacementName,
                        },
                        fix: aliasReplacementFix,
                        messageId: "preferRequireExactlyOne",
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
                    "require TypeFest RequireExactlyOne over imported aliases such as OneOf/RequireOnlyOne.",
                frozen: false,
                recommended: true,
                requiresTypeChecking: false,
                typefestConfigs: [
                    "typefest.configs.recommended",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                    "typefest.configs.type-fest/types",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-require-exactly-one",
            },
            fixable: "code",
            messages: {
                preferRequireExactlyOne:
                    "Prefer `{{replacement}}` from type-fest to require exactly one key from a group instead of legacy alias `{{alias}}`.",
            },
            schema: [
                {
                    additionalProperties: false,
                    description:
                        "Configuration for alias names enforced by prefer-type-fest-require-exactly-one.",
                    minProperties: 1,
                    properties: {
                        enforcedAliasNames: {
                            description:
                                "Legacy alias names to report and replace with RequireExactlyOne.",
                            items: {
                                enum: [...requireExactlyOneLegacyAliases],
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
        name: "prefer-type-fest-require-exactly-one",
    });

/**
 * Default export for the `prefer-type-fest-require-exactly-one` rule module.
 */
export default preferTypeFestRequireExactlyOneRule;
