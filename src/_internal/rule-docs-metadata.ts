/**
 * @packageDocumentation
 * Rule-doc metadata derivation helpers for preset composition and docs sync.
 */

import type { TSESLint } from "@typescript-eslint/utils";

import {
    isTypedocConfigName,
    isTypedocConfigReference,
    type TypedocConfigName,
    typedocConfigNames,
    typedocConfigReferenceToName,
} from "./typedoc-config-references.js";

/** Normalized docs metadata used for preset composition and generated tables. */
export type RuleDocsMetadata = Readonly<{
    description: string;
    frozen: boolean;
    recommended: boolean;
    requiresTypeChecking: boolean;
    typedocConfigs: readonly TypedocConfigName[];
    url: string;
}>;

type RuleDocsRecord = Readonly<{
    description?: string;
    frozen?: boolean;
    recommended?: boolean;
    requiresTypeChecking?: boolean;
    typedocConfigs?: readonly string[] | string;
    url?: string;
}>;

type RuleModule = TSESLint.RuleModule<string, readonly unknown[]>;

type RuleName<TRules extends Record<string, RuleModule>> = Extract<
    keyof TRules,
    string
>;

const normalizeTypedocConfigName = (
    value: string
): null | TypedocConfigName => {
    if (isTypedocConfigName(value)) {
        return value;
    }

    if (isTypedocConfigReference(value)) {
        return typedocConfigReferenceToName[value];
    }

    return null;
};

const normalizeTypedocConfigNames = (
    references: readonly string[] | string | undefined,
    fallbackToRecommended: boolean
): readonly TypedocConfigName[] => {
    const values = Array.isArray(references)
        ? references
        : typeof references === "string"
          ? [references]
          : [];

    const resolvedConfigNames = new Set<TypedocConfigName>();

    for (const value of values) {
        const normalizedValue = normalizeTypedocConfigName(value);

        if (normalizedValue !== null) {
            resolvedConfigNames.add(normalizedValue);
        }
    }

    if (fallbackToRecommended && resolvedConfigNames.size === 0) {
        resolvedConfigNames.add("recommended");
    }

    return typedocConfigNames.filter((configName) =>
        resolvedConfigNames.has(configName)
    );
};

/**
 * Derive normalized docs metadata for each rule in a runtime registry.
 */
export const deriveRuleDocsMetadataByName = <
    TRules extends Record<string, RuleModule>,
>(
    rules: TRules
): Readonly<Record<RuleName<TRules>, RuleDocsMetadata>> => {
    const metadataByRuleName = {} as Record<RuleName<TRules>, RuleDocsMetadata>;

    for (const [rawRuleName, ruleModule] of Object.entries(rules)) {
        const ruleName = rawRuleName as RuleName<TRules>;

        if (ruleModule === undefined) {
            continue;
        }

        const docs = (ruleModule.meta?.docs ?? {}) as RuleDocsRecord;

        const description = docs.description;

        if (
            typeof description !== "string" ||
            description.trim().length === 0
        ) {
            throw new TypeError(
                `Rule '${ruleName}' is missing meta.docs.description.`
            );
        }

        const url = docs.url;

        if (typeof url !== "string" || url.trim().length === 0) {
            throw new TypeError(`Rule '${ruleName}' is missing meta.docs.url.`);
        }

        metadataByRuleName[ruleName] = {
            description,
            frozen: docs.frozen === true,
            recommended: docs.recommended === true,
            requiresTypeChecking: docs.requiresTypeChecking === true,
            typedocConfigs: normalizeTypedocConfigNames(
                docs.typedocConfigs,
                docs.recommended === true
            ),
            url,
        };
    }

    return metadataByRuleName;
};

/**
 * Build a preset-membership map from normalized docs metadata.
 */
export const deriveRulePresetMembershipByRuleName = <TRuleName extends string>(
    metadataByRuleName: Readonly<Record<TRuleName, RuleDocsMetadata>>
): Readonly<Record<TRuleName, readonly TypedocConfigName[]>> => {
    const membershipMap = {} as Record<TRuleName, readonly TypedocConfigName[]>;

    for (const [rawRuleName, metadataValue] of Object.entries(
        metadataByRuleName
    )) {
        const ruleName = rawRuleName as TRuleName;
        const metadata = metadataValue as RuleDocsMetadata;

        membershipMap[ruleName] = [...metadata.typedocConfigs];
    }

    return membershipMap;
};
