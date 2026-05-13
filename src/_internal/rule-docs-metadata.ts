/**
 * @packageDocumentation
 * Rule-doc metadata derivation helpers for preset composition and docs sync.
 */

import type { TSESLint } from "@typescript-eslint/utils";
import type { UnknownArray } from "type-fest";

import { objectEntries, safeCastTo, setHas } from "ts-extras";

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

type RuleModule = TSESLint.RuleModule<string, Readonly<UnknownArray>>;

const toReferenceArray = (
    references: readonly string[] | string | undefined
): readonly string[] => {
    if (Array.isArray(references)) {
        return references;
    }

    if (typeof references === "string") {
        return [references];
    }

    return [];
};

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
    const values = toReferenceArray(references);

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
        setHas(resolvedConfigNames, configName)
    );
};

/**
 * Derive normalized docs metadata for each rule in a runtime registry.
 */
export const deriveRuleDocsMetadataByName = (
    rules: Readonly<Record<string, RuleModule>>
): Readonly<Record<string, RuleDocsMetadata>> => {
    const metadataByRuleName: Record<string, RuleDocsMetadata> = {};

    for (const [ruleName, ruleModule] of objectEntries(rules)) {
        const docs = safeCastTo<RuleDocsRecord>(ruleModule.meta.docs ?? {});

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
): Readonly<Record<string, readonly TypedocConfigName[]>> => {
    const membershipMap: Record<string, readonly TypedocConfigName[]> = {};

    for (const [ruleName, metadata] of objectEntries(metadataByRuleName)) {
        membershipMap[ruleName] = [...metadata.typedocConfigs];
    }

    return membershipMap;
};
