/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-writable`.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import {
    collectDirectNamedImportsFromSource,
    collectImportedTypeAliasMatches,
    createSafeTypeReferenceReplacementFix,
} from "../_internal/imported-type-aliases.js";
import { TYPE_FEST_MODULE_SOURCE } from "../_internal/module-source.js";
import { areEquivalentTypeNodes } from "../_internal/normalize-expression-text.js";
import { reportWithOptionalFix } from "../_internal/rule-reporting.js";
import { createTypedRule } from "../_internal/typed-rule.js";

/** Legacy alias names normalized by this rule to `Writable`. */
const writableAliasReplacements = {
    Mutable: "Writable",
} as const;

/**
 * Detects mapped types equivalent to `Writable<T>`.
 *
 * @param node - Mapped type node to inspect.
 *
 * @returns `true` when the mapped type removes `readonly` via `-readonly` and
 *   preserves property optionality and values as `T[K]`.
 */
const hasWritableMappedTypeShape = (
    node: Readonly<TSESTree.TSMappedType>
): boolean => {
    if (node.readonly !== "-") {
        return false;
    }

    if (node.optional !== false) {
        return false;
    }

    if (node.nameType !== null) {
        return false;
    }

    const { constraint } = node;
    if (constraint?.type !== "TSTypeOperator") {
        return false;
    }

    if (constraint.operator !== "keyof") {
        return false;
    }

    const baseType = constraint.typeAnnotation;
    if (!baseType) {
        return false;
    }

    const { typeAnnotation } = node;
    if (typeAnnotation?.type !== "TSIndexedAccessType") {
        return false;
    }

    if (!areEquivalentTypeNodes(typeAnnotation.objectType, baseType)) {
        return false;
    }

    const { indexType } = typeAnnotation;
    if (
        indexType.type !== "TSTypeReference" ||
        indexType.typeName.type !== "Identifier"
    ) {
        return false;
    }

    return (
        node.key.type === "Identifier" &&
        indexType.typeName.name === node.key.name
    );
};

/**
 * ESLint rule definition for `prefer-type-fest-writable`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTypeFestWritableRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const { sourceCode } = context;
            const importedAliasMatches = collectImportedTypeAliasMatches(
                sourceCode,
                writableAliasReplacements
            );
            const typeFestDirectImports = collectDirectNamedImportsFromSource(
                sourceCode,
                TYPE_FEST_MODULE_SOURCE
            );

            return {
                TSMappedType(node) {
                    if (!hasWritableMappedTypeShape(node)) {
                        return;
                    }

                    reportWithOptionalFix({
                        context,
                        fix: null,
                        messageId: "preferWritable",
                        node,
                    });
                },
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
                        messageId: "preferWritableAlias",
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
                    "require TypeFest Writable over manual mapped types that strip readonly with -readonly.",
                frozen: false,
                recommended: true,
                requiresTypeChecking: false,
                typefestConfigs: [
                    "typefest.configs.recommended",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                    "typefest.configs.type-fest/types",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-writable",
            },
            fixable: "code",
            messages: {
                preferWritable:
                    "Prefer `Writable<T>` from type-fest over `{-readonly [K in keyof T]: T[K]}`.",
                preferWritableAlias:
                    "Prefer `{{replacement}}` from type-fest to remove readonly modifiers from selected keys instead of legacy alias `{{alias}}`.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-writable",
    });

/**
 * Default export for the `prefer-type-fest-writable` rule module.
 */
export default preferTypeFestWritableRule;
