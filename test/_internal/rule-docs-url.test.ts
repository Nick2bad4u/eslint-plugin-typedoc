import { describe, expect, it } from "vitest";

import {
    createRuleDocsUrl,
    RULE_DOCS_URL_BASE,
} from "../../src/_internal/rule-docs-url";

describe("rule-docs-url", () => {
    it("uses the canonical docs base URL", () => {
        expect(RULE_DOCS_URL_BASE).toBe(
            "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/"
        );
    });

    it("builds canonical docs URL for known rule ids", () => {
        expect(createRuleDocsUrl("prefer-ts-extras-array-at")).toBe(
            `${RULE_DOCS_URL_BASE}prefer-ts-extras-array-at`
        );
    });

    it("concatenates rule names without altering the provided suffix", () => {
        const opaqueRuleName = "internal-ad-hoc-rule";

        expect(createRuleDocsUrl(opaqueRuleName)).toBe(
            `${RULE_DOCS_URL_BASE}${opaqueRuleName}`
        );
    });
});
