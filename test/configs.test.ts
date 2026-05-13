import { describe, expect, it } from "vitest";

import typedocPlugin from "../src/plugin.js";

describe("preset configs", () => {
    it("uses typedoc namespace rule IDs", () => {
        expect.hasAssertions();

        for (const preset of Object.values(typedocPlugin.configs ?? {})) {
            const ruleIds = Object.keys(preset.rules ?? {});

            for (const ruleId of ruleIds) {
                expect(ruleId.startsWith("typedoc/")).toBeTruthy();
            }
        }
    });

    it("strict includes advanced completeness rules", () => {
        expect.hasAssertions();

        const strictRules = typedocPlugin.configs?.strict?.rules ?? {};

        expect(strictRules["typedoc/require-code-fence-language"]).toBe(
            "error"
        );
        expect(strictRules["typedoc/no-empty-example-tag"]).toBe("error");
        expect(strictRules["typedoc/no-empty-remarks-tag"]).toBe("error");
        expect(strictRules["typedoc/no-duplicate-param-tags"]).toBe("error");
        expect(strictRules["typedoc/no-duplicate-type-param-tags"]).toBe(
            "error"
        );
        expect(strictRules["typedoc/prefer-package-documentation-tag"]).toBe(
            "error"
        );
        expect(strictRules["typedoc/require-deprecated-tag-description"]).toBe(
            "error"
        );
        expect(strictRules["typedoc/require-example-tag"]).toBe("error");
        expect(
            strictRules["typedoc/require-exported-doc-comment-description"]
        ).toBe("error");
        expect(
            strictRules["typedoc/require-package-documentation-description"]
        ).toBe("error");
        expect(strictRules["typedoc/require-package-documentation"]).toBe(
            "error"
        );
        expect(strictRules["typedoc/require-param-tag-description"]).toBe(
            "error"
        );
        expect(strictRules["typedoc/require-param-tags"]).toBe("error");
        expect(strictRules["typedoc/require-returns-description"]).toBe(
            "error"
        );
        expect(strictRules["typedoc/require-returns-tag"]).toBe("error");
        expect(strictRules["typedoc/require-throws-description"]).toBe("error");
        expect(strictRules["typedoc/require-throws-tag"]).toBe("error");
        expect(strictRules["typedoc/require-type-param-tag-description"]).toBe(
            "error"
        );
        expect(strictRules["typedoc/require-type-param-tags"]).toBe("error");
        expect(strictRules["typedoc/no-extra-type-param-tags"]).toBe("error");
    });

    it("minimal excludes strict-only completeness rules", () => {
        expect.hasAssertions();

        const minimalRules = typedocPlugin.configs?.minimal?.rules ?? {};

        expect(minimalRules["typedoc/require-param-tags"]).toBeUndefined();
        expect(minimalRules["typedoc/require-returns-tag"]).toBeUndefined();
        expect(minimalRules["typedoc/require-throws-tag"]).toBeUndefined();
        expect(
            minimalRules["typedoc/require-throws-description"]
        ).toBeUndefined();
        expect(minimalRules["typedoc/require-type-param-tags"]).toBeUndefined();
        expect(
            minimalRules["typedoc/require-type-param-tag-description"]
        ).toBeUndefined();
        expect(
            minimalRules["typedoc/require-param-tag-description"]
        ).toBeUndefined();
        expect(
            minimalRules["typedoc/require-returns-description"]
        ).toBeUndefined();
        expect(
            minimalRules["typedoc/no-extra-type-param-tags"]
        ).toBeUndefined();
        expect(minimalRules["typedoc/require-example-tag"]).toBeUndefined();
        expect(
            minimalRules["typedoc/require-package-documentation"]
        ).toBeUndefined();
        expect(
            minimalRules["typedoc/require-code-fence-language"]
        ).toBeUndefined();
        expect(
            minimalRules["typedoc/require-deprecated-tag-description"]
        ).toBeUndefined();
        expect(minimalRules["typedoc/no-empty-example-tag"]).toBeUndefined();
        expect(minimalRules["typedoc/no-empty-remarks-tag"]).toBeUndefined();
        expect(minimalRules["typedoc/no-duplicate-param-tags"]).toBeUndefined();
        expect(
            minimalRules["typedoc/no-duplicate-type-param-tags"]
        ).toBeUndefined();
        expect(
            minimalRules["typedoc/prefer-package-documentation-tag"]
        ).toBeUndefined();
        expect(
            minimalRules["typedoc/require-default-value-tag"]
        ).toBeUndefined();
        expect(
            minimalRules["typedoc/require-package-documentation-description"]
        ).toBeUndefined();
    });

    it("recommended includes stale tag correctness rules", () => {
        expect.hasAssertions();

        const recommendedRules =
            typedocPlugin.configs?.recommended?.rules ?? {};

        expect(recommendedRules["typedoc/no-empty-example-tag"]).toBe("error");
        expect(recommendedRules["typedoc/no-empty-remarks-tag"]).toBe("error");
        expect(recommendedRules["typedoc/no-extra-param-tags"]).toBe("error");
        expect(recommendedRules["typedoc/prefer-type-param-tag"]).toBe("error");
        expect(
            recommendedRules["typedoc/require-deprecated-tag-description"]
        ).toBe("error");
        expect(recommendedRules["typedoc/no-duplicate-param-tags"]).toBe(
            "error"
        );
        expect(recommendedRules["typedoc/no-duplicate-type-param-tags"]).toBe(
            "error"
        );
        expect(
            recommendedRules["typedoc/require-exported-doc-comment-description"]
        ).toBe("error");
        expect(
            recommendedRules["typedoc/prefer-package-documentation-tag"]
        ).toBe("error");
    });

    it("markdown focuses on rendered markdown quality", () => {
        expect.hasAssertions();

        const markdownRules = typedocPlugin.configs?.markdown?.rules ?? {};

        expect(markdownRules["typedoc/no-empty-example-tag"]).toBe("error");
        expect(markdownRules["typedoc/no-empty-remarks-tag"]).toBe("error");
        expect(markdownRules["typedoc/no-malformed-inline-links"]).toBe(
            "error"
        );
        expect(markdownRules["typedoc/no-unknown-tags"]).toBe("error");
        expect(markdownRules["typedoc/require-code-fence-language"]).toBe(
            "error"
        );
        expect(
            markdownRules["typedoc/require-deprecated-tag-description"]
        ).toBe("error");
        expect(markdownRules["typedoc/require-example-tag"]).toBe("error");
        expect(markdownRules["typedoc/require-exported-doc-comment"]).toBe(
            "error"
        );
        expect(
            markdownRules["typedoc/require-exported-doc-comment-description"]
        ).toBe("error");
        expect(markdownRules["typedoc/require-package-documentation"]).toBe(
            "error"
        );
        expect(
            markdownRules["typedoc/require-package-documentation-description"]
        ).toBe("error");
    });

    it("tsdoc focuses on canonical TSDoc-compatible authoring", () => {
        expect.hasAssertions();

        const tsdocRules = typedocPlugin.configs?.tsdoc?.rules ?? {};

        expect(tsdocRules["typedoc/no-empty-example-tag"]).toBe("error");
        expect(tsdocRules["typedoc/no-empty-remarks-tag"]).toBe("error");
        expect(tsdocRules["typedoc/no-malformed-inline-links"]).toBe("error");
        expect(tsdocRules["typedoc/no-unknown-tags"]).toBe("error");
        expect(tsdocRules["typedoc/prefer-package-documentation-tag"]).toBe(
            "error"
        );
        expect(tsdocRules["typedoc/prefer-type-param-tag"]).toBe("error");
        expect(tsdocRules["typedoc/require-deprecated-tag-description"]).toBe(
            "error"
        );
        expect(
            tsdocRules["typedoc/require-exported-doc-comment"]
        ).toBeUndefined();
    });

    it("jsdoc focuses on the TypeDoc-supported JSDoc subset", () => {
        expect.hasAssertions();

        const jsdocRules = typedocPlugin.configs?.jsdoc?.rules ?? {};

        expect(jsdocRules["typedoc/no-empty-example-tag"]).toBe("error");
        expect(jsdocRules["typedoc/no-malformed-inline-links"]).toBe("error");
        expect(jsdocRules["typedoc/no-unknown-tags"]).toBe("error");
        expect(jsdocRules["typedoc/require-deprecated-tag-description"]).toBe(
            "error"
        );
        expect(jsdocRules["typedoc/no-empty-remarks-tag"]).toBeUndefined();
        expect(
            jsdocRules["typedoc/prefer-package-documentation-tag"]
        ).toBeUndefined();
        expect(jsdocRules["typedoc/prefer-type-param-tag"]).toBeUndefined();
    });
});
