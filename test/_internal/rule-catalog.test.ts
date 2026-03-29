import { assertDefined } from "ts-extras";
import { describe, expect, it } from "vitest";

import {
    getRuleCatalogEntryForRuleId,
    getRuleCatalogEntryForRuleName,
    getRuleCatalogEntryForRuleNameOrNull,
    typefestRuleCatalogEntries,
    validateRuleCatalogIntegrity,
} from "../../src/_internal/rule-catalog";
import { typefestRules } from "../../src/_internal/rules-registry";

interface MutableRuleCatalogEntry {
    ruleId: `R${string}`;
    ruleName: `prefer-${string}`;
    ruleNumber: number;
}

const withMutatedCatalogEntry = (
    index: number,
    patch: Readonly<Partial<MutableRuleCatalogEntry>>,
    assertion: () => void
): void => {
    const mutableEntries =
        typefestRuleCatalogEntries as unknown as MutableRuleCatalogEntry[];
    const originalEntry = mutableEntries.at(index);
    assertDefined(originalEntry);

    mutableEntries[index] = {
        ...originalEntry,
        ...patch,
    };

    try {
        assertion();
    } finally {
        mutableEntries[index] = originalEntry;
    }
};

describe("rule-catalog", () => {
    it("stays synchronized with the runtime rules registry", () => {
        const catalogRuleNames = typefestRuleCatalogEntries
            .map((entry) => entry.ruleName)
            .toSorted((left, right) => left.localeCompare(right));
        const registryRuleNames = Object.keys(typefestRules).toSorted(
            (left, right) => left.localeCompare(right)
        );

        expect(catalogRuleNames).toStrictEqual(registryRuleNames);
        expect(typefestRuleCatalogEntries).toHaveLength(
            registryRuleNames.length
        );
    });

    it("resolves known entries by rule name and id", () => {
        const byName = getRuleCatalogEntryForRuleName(
            "prefer-ts-extras-array-at"
        );
        const byId = getRuleCatalogEntryForRuleId("R001");

        expect(byName.ruleId).toBe("R001");
        expect(byName.ruleNumber).toBe(1);
        expect(byName.ruleName).toBe("prefer-ts-extras-array-at");
        expect(byId).toStrictEqual(byName);
    });

    it("returns null for non-catalog or non-prefer rule names", () => {
        expect(
            getRuleCatalogEntryForRuleNameOrNull("internal-helper-rule")
        ).toBeNull();
        expect(
            getRuleCatalogEntryForRuleNameOrNull(
                "prefer-internal-non-catalog-rule"
            )
        ).toBeNull();
    });

    it("throws for unknown rule names in strict lookup", () => {
        expect(() =>
            getRuleCatalogEntryForRuleName("prefer-internal-non-catalog-rule")
        ).toThrow(/missing from the stable rule catalog/v);
    });

    it("returns undefined for unknown rule ids", () => {
        expect(getRuleCatalogEntryForRuleId("R999")).toBeUndefined();
    });

    it("reports valid baseline catalog integrity", () => {
        expect(validateRuleCatalogIntegrity()).toBeTruthy();
    });

    it("detects duplicate rule ids", () => {
        const firstEntry = typefestRuleCatalogEntries.at(0);
        assertDefined(firstEntry);

        withMutatedCatalogEntry(
            1,
            {
                ruleId: firstEntry.ruleId,
            },
            () => {
                expect(validateRuleCatalogIntegrity()).toBeFalsy();
            }
        );
    });

    it("detects out-of-sequence rule numbers", () => {
        withMutatedCatalogEntry(
            0,
            {
                ruleNumber: 99,
            },
            () => {
                expect(validateRuleCatalogIntegrity()).toBeFalsy();
            }
        );
    });

    it("detects mismatched rule ids for a valid index", () => {
        withMutatedCatalogEntry(
            0,
            {
                ruleId: "R999",
            },
            () => {
                expect(validateRuleCatalogIntegrity()).toBeFalsy();
            }
        );
    });
});
