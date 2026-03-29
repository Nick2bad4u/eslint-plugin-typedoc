/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-promisable`.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import { arrayFirst, isDefined } from "ts-extras";

import {
    collectDirectNamedImportsFromSource,
    collectImportedTypeAliasMatches,
    createSafeTypeReferenceReplacementFix,
} from "../_internal/imported-type-aliases.js";
import { TYPE_FEST_MODULE_SOURCE } from "../_internal/module-source.js";
import { areEquivalentTypeNodes } from "../_internal/normalize-expression-text.js";
import { reportWithOptionalFix } from "../_internal/rule-reporting.js";
import { isIdentifierTypeReference } from "../_internal/type-reference-node.js";
import { createTypedRule } from "../_internal/typed-rule.js";

type PreferTypeFestPromisableOption = Readonly<{
    enforceLegacyAliases?: boolean;
    enforcePromiseUnions?: boolean;
}>;

/** Canonical TypeFest alias preferred by this rule. */
const PROMISABLE_TYPE_NAME = "Promisable";

/** Built-in promise type name used for union normalization checks. */
const PROMISE_TYPE_NAME = "Promise";

/** Legacy alias names that should be normalized to `Promisable`. */
const promisableAliasReplacements = {
    MaybePromise: "Promisable",
} as const;

const defaultOption = {
    enforceLegacyAliases: true,
    enforcePromiseUnions: true,
} as const;

const defaultOptions = [defaultOption] as const;

/**
 * Extracts the type argument from `Promise<T>` references.
 *
 * @param node - Type node to inspect.
 *
 * @returns The inner `T` node from `Promise<T>`; otherwise `null`.
 */
const getPromiseInnerType = (
    node: Readonly<TSESTree.TypeNode>
): null | TSESTree.TypeNode => {
    if (!isIdentifierTypeReference(node, PROMISE_TYPE_NAME)) {
        return null;
    }

    const typeArguments = node.typeArguments?.params;
    if (!isDefined(typeArguments)) {
        return null;
    }

    return arrayFirst(typeArguments) ?? null;
};

/**
 * ESLint rule definition for `prefer-type-fest-promisable`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTypeFestPromisableRule: ReturnType<typeof createTypedRule> =
    createTypedRule<
        readonly [PreferTypeFestPromisableOption],
        "preferPromisable"
    >({
        create(context, [options] = defaultOptions) {
            const enforceLegacyAliases = options.enforceLegacyAliases ?? true;
            const enforcePromiseUnions = options.enforcePromiseUnions ?? true;

            const { sourceCode } = context;
            const importedAliasMatches = collectImportedTypeAliasMatches(
                sourceCode,
                promisableAliasReplacements
            );
            const typeFestDirectImports = collectDirectNamedImportsFromSource(
                sourceCode,
                TYPE_FEST_MODULE_SOURCE
            );

            return {
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
                        fix: aliasReplacementFix,
                        messageId: "preferPromisable",
                        node,
                    });
                },
                TSUnionType(node) {
                    if (!enforcePromiseUnions) {
                        return;
                    }

                    if (node.types.length !== 2) {
                        return;
                    }

                    const [firstMember, secondMember] = node.types;

                    if (!firstMember || !secondMember) {
                        return;
                    }

                    if (
                        node.types.some((member) =>
                            isIdentifierTypeReference(
                                member,
                                PROMISABLE_TYPE_NAME
                            )
                        )
                    ) {
                        return;
                    }

                    const firstPromiseInner = getPromiseInnerType(firstMember);
                    const secondPromiseInner =
                        getPromiseInnerType(secondMember);

                    const pair =
                        firstPromiseInner && !secondPromiseInner
                            ? {
                                  promiseInner: firstPromiseInner,
                                  synchronousMember: secondMember,
                              }
                            : !firstPromiseInner && secondPromiseInner
                              ? {
                                    promiseInner: secondPromiseInner,
                                    synchronousMember: firstMember,
                                }
                              : null;

                    if (pair === null) {
                        return;
                    }

                    const { promiseInner, synchronousMember } = pair;

                    if (
                        synchronousMember.type === "TSNeverKeyword" ||
                        synchronousMember.type === "TSNullKeyword" ||
                        synchronousMember.type === "TSUndefinedKeyword"
                    ) {
                        return;
                    }

                    if (
                        !areEquivalentTypeNodes(promiseInner, synchronousMember)
                    ) {
                        return;
                    }

                    reportWithOptionalFix({
                        context,
                        fix: null,
                        messageId: "preferPromisable",
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
                    "require TypeFest Promisable over legacy MaybePromise aliases and Promise<T> | T unions for sync-or-async contracts.",
                frozen: false,
                recommended: true,
                requiresTypeChecking: false,
                typefestConfigs: [
                    "typefest.configs.minimal",
                    "typefest.configs.recommended",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                    "typefest.configs.type-fest/types",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-promisable",
            },
            fixable: "code",
            messages: {
                preferPromisable:
                    "Prefer `Promisable<T>` from type-fest over `Promise<T> | T` for sync-or-async contracts.",
            },
            schema: [
                {
                    additionalProperties: false,
                    description:
                        "Configuration for legacy alias and Promise-union enforcement in prefer-type-fest-promisable.",
                    minProperties: 1,
                    properties: {
                        enforceLegacyAliases: {
                            description:
                                "Whether to report legacy imported aliases such as MaybePromise.",
                            type: "boolean",
                        },
                        enforcePromiseUnions: {
                            description:
                                "Whether to report Promise<T> | T union contracts.",
                            type: "boolean",
                        },
                    },
                    type: "object",
                },
            ],
            type: "suggestion",
        },
        name: "prefer-type-fest-promisable",
    });

/**
 * Default export for the `prefer-type-fest-promisable` rule module.
 */
export default preferTypeFestPromisableRule;
