/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-tagged-brands`.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import {
    collectDirectNamedImportsFromSource,
    collectImportedTypeAliasMatches,
    createSafeTypeReferenceReplacementFix,
} from "../_internal/imported-type-aliases.js";
import { TYPE_FEST_MODULE_SOURCE } from "../_internal/module-source.js";
import { reportWithOptionalFix } from "../_internal/rule-reporting.js";
import { setContainsValue } from "../_internal/set-membership.js";
import { createTypedRule } from "../_internal/typed-rule.js";

type PreferTypeFestTaggedBrandsOption = Readonly<{
    enforceAdHocBrandIntersections?: boolean;
    enforceLegacyAliases?: boolean;
}>;

/** Property keys commonly used in ad-hoc branded intersections. */
const BRAND_PROPERTY_NAMES = new Set([
    "__brand",
    "__tag",
    "brand",
]);
/** Legacy alias names normalized by this rule to `Tagged`. */
const taggedAliasReplacements = {
    Branded: "Tagged",
    Opaque: "Tagged",
} as const;

const defaultOption = {
    enforceAdHocBrandIntersections: true,
    enforceLegacyAliases: true,
} as const;

const defaultOptions = [defaultOption] as const;

/**
 * Detects intersection members that use object-literal branding fields.
 *
 * @param typeNode - Type node to inspect.
 *
 * @returns `true` when an intersection includes a `TSTypeLiteral` with a
 *   brand-like property key.
 */

const hasAdHocBrandLiteral = (
    typeNode: Readonly<TSESTree.TypeNode>
): boolean => {
    if (typeNode.type !== "TSIntersectionType") {
        return false;
    }

    return typeNode.types.some((member) => {
        if (member.type !== "TSTypeLiteral") {
            return false;
        }

        return member.members.some((literalMember) => {
            if (literalMember.type !== "TSPropertySignature") {
                return false;
            }

            const { key } = literalMember;
            return (
                key.type === "Identifier" &&
                setContainsValue(BRAND_PROPERTY_NAMES, key.name)
            );
        });
    });
};

/**
 * Recursively checks whether a type already references `Tagged`.
 *
 * @param typeNode - Type node to inspect.
 *
 * @returns `true` when the node or any nested union/intersection member is a
 *   `Tagged` type reference.
 */

const typeContainsTaggedReference = (
    typeNode: Readonly<TSESTree.TypeNode>
): boolean => {
    if (
        typeNode.type === "TSTypeReference" &&
        typeNode.typeName.type === "Identifier" &&
        typeNode.typeName.name === "Tagged"
    ) {
        return true;
    }

    if (
        typeNode.type === "TSIntersectionType" ||
        typeNode.type === "TSUnionType"
    ) {
        return typeNode.types.some((member) =>
            typeContainsTaggedReference(member)
        );
    }

    return false;
};

/**
 * ESLint rule definition for `prefer-type-fest-tagged-brands`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTypeFestTaggedBrandsRule: ReturnType<typeof createTypedRule> =
    createTypedRule<
        readonly [PreferTypeFestTaggedBrandsOption],
        "preferTaggedAlias" | "preferTaggedBrand"
    >({
        create(context, [options] = defaultOptions) {
            const enforceAdHocBrandIntersections =
                options.enforceAdHocBrandIntersections ?? true;
            const enforceLegacyAliases = options.enforceLegacyAliases ?? true;

            const importedAliasMatches = collectImportedTypeAliasMatches(
                context.sourceCode,
                taggedAliasReplacements
            );
            const typeFestDirectImports = collectDirectNamedImportsFromSource(
                context.sourceCode,
                TYPE_FEST_MODULE_SOURCE
            );

            return {
                TSTypeAliasDeclaration(node) {
                    if (!enforceAdHocBrandIntersections) {
                        return;
                    }

                    if (typeContainsTaggedReference(node.typeAnnotation)) {
                        return;
                    }

                    if (!hasAdHocBrandLiteral(node.typeAnnotation)) {
                        return;
                    }

                    reportWithOptionalFix({
                        context,
                        data: {
                            alias: node.id.name,
                        },
                        fix: null,
                        messageId: "preferTaggedBrand",
                        node: node.id,
                    });
                },
                'TSTypeReference[typeName.type="Identifier"]'(
                    node: TSESTree.TSTypeReference
                ) {
                    if (!enforceLegacyAliases) {
                        return;
                    }

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
                        messageId: "preferTaggedAlias",
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
                    "require TypeFest Tagged over ad-hoc intersection branding with __brand/__tag fields.",
                frozen: false,
                recommended: true,
                requiresTypeChecking: false,
                typefestConfigs: [
                    "typefest.configs.recommended",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                    "typefest.configs.type-fest/types",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-tagged-brands",
            },
            fixable: "code",
            messages: {
                preferTaggedAlias:
                    "Prefer `{{replacement}}` from type-fest for canonical tagged-brand aliases instead of legacy alias `{{alias}}`.",
                preferTaggedBrand:
                    "Type alias '{{alias}}' uses ad-hoc branding. Prefer `Tagged` from type-fest for branded primitive identifiers.",
            },
            schema: [
                {
                    additionalProperties: false,
                    description:
                        "Configuration for tagged-brand enforcement surfaces.",
                    minProperties: 1,
                    properties: {
                        enforceAdHocBrandIntersections: {
                            description:
                                "Whether to report ad-hoc branded intersections using __brand/__tag/brand fields.",
                            type: "boolean",
                        },
                        enforceLegacyAliases: {
                            description:
                                "Whether to report imported legacy branded aliases such as Opaque and Branded.",
                            type: "boolean",
                        },
                    },
                    type: "object",
                },
            ],
            type: "suggestion",
        },
        name: "prefer-type-fest-tagged-brands",
    });

/**
 * Default export for the `prefer-type-fest-tagged-brands` rule module.
 */
export default preferTypeFestTaggedBrandsRule;
