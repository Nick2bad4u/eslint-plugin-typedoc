/**
 * @packageDocumentation
 * Snapshot coverage for normalized rule metadata contracts.
 */
import type { UnknownRecord } from "type-fest";

import { objectEntries } from "ts-extras";
import { describe, expect, it } from "vitest";

import typefestPlugin from "../src/plugin";

interface RuleMetadataSnapshot {
    defaultOptionsLength: number;
    docs: {
        recommended: boolean;
        requiresTypeChecking: boolean;
        ruleId: null | string;
        ruleNumber: null | number;
        typefestConfigs: readonly string[];
        url: null | string;
    };
    fixable: null | string;
    hasSuggestions: boolean;
    messageIds: readonly string[];
    ruleId: string;
    schemaLength: number;
    type: null | string;
}

/** Guard dynamic values into object records. */
const isRecord = (value: unknown): value is UnknownRecord =>
    typeof value === "object" && value !== null;

/** Normalize unknown docs preset references into sorted string entries. */
const normalizeTypefestConfigs = (value: unknown): readonly string[] => {
    if (typeof value === "string") {
        return [value];
    }

    if (!Array.isArray(value)) {
        return [];
    }

    const references: string[] = [];

    for (const reference of value) {
        if (typeof reference === "string") {
            references.push(reference);
        }
    }

    return references.toSorted((left, right) => left.localeCompare(right));
};

/** Read an optional object-like property from a record. */
const getNestedRecord = (
    record: Readonly<UnknownRecord> | undefined,
    propertyName: string
): undefined | UnknownRecord => {
    const candidate = record?.[propertyName];

    return isRecord(candidate) ? candidate : undefined;
};

/** Read an optional array-like property from a record. */
const getNestedArray = (
    record: Readonly<UnknownRecord> | undefined,
    propertyName: string
): readonly unknown[] => {
    const candidate = record?.[propertyName];

    return Array.isArray(candidate) ? candidate : [];
};

/** Build normalized message-id list from optional metadata messages. */
const getMessageIds = (
    messages: Readonly<UnknownRecord> | undefined
): readonly string[] => {
    if (messages === undefined) {
        return [];
    }

    return Object.keys(messages).toSorted((left, right) =>
        left.localeCompare(right)
    );
};

/** Normalize one dynamic rule entry into snapshot format. */
const toRuleMetadataSnapshot = (
    ruleId: string,
    ruleModule: unknown
): RuleMetadataSnapshot => {
    const safeRuleModule = isRecord(ruleModule) ? ruleModule : undefined;
    const meta = getNestedRecord(safeRuleModule, "meta");
    const docs = getNestedRecord(meta, "docs");
    const messages = getNestedRecord(meta, "messages");
    const defaultOptions = getNestedArray(safeRuleModule, "defaultOptions");
    const schema = getNestedArray(meta, "schema");

    const type = meta?.["type"];
    const fixable = meta?.["fixable"];
    const docsUrl = docs?.["url"];
    const docsRecommended = docs?.["recommended"];
    const docsRequiresTypeChecking = docs?.["requiresTypeChecking"];
    const docsRuleId = docs?.["ruleId"];
    const docsRuleNumber = docs?.["ruleNumber"];

    return {
        defaultOptionsLength: defaultOptions.length,
        docs: {
            recommended: docsRecommended === true,
            requiresTypeChecking: docsRequiresTypeChecking === true,
            ruleId: typeof docsRuleId === "string" ? docsRuleId : null,
            ruleNumber:
                typeof docsRuleNumber === "number" ? docsRuleNumber : null,
            typefestConfigs: normalizeTypefestConfigs(
                docs?.["typefestConfigs"]
            ),
            url: typeof docsUrl === "string" ? docsUrl : null,
        },
        fixable: typeof fixable === "string" ? fixable : null,
        hasSuggestions: meta?.["hasSuggestions"] === true,
        messageIds: getMessageIds(messages),
        ruleId,
        schemaLength: schema.length,
        type: typeof type === "string" ? type : null,
    };
};

/**
 * Build deterministic rule metadata snapshots for all exported rules.
 *
 * @returns One normalized snapshot payload per rule id.
 */
const getRuleMetadataSnapshots = (): readonly RuleMetadataSnapshot[] =>
    objectEntries(typefestPlugin.rules)
        .toSorted(([left], [right]) => left.localeCompare(right))
        .map(([ruleId, ruleModule]) =>
            toRuleMetadataSnapshot(ruleId, ruleModule)
        );

describe("rule metadata snapshots", () => {
    it("keeps normalized rule metadata contract stable", () => {
        expect(getRuleMetadataSnapshots()).toMatchSnapshot();
    });
});
