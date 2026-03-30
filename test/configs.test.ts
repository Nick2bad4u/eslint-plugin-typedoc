import { describe, expect, it } from "vitest";

import plugin from "../src/plugin.js";

describe("preset configs", () => {
    it("uses typedoc namespace rule IDs", () => {
        for (const preset of Object.values(plugin.configs ?? {})) {
            const ruleIds = Object.keys(preset.rules ?? {});

            for (const ruleId of ruleIds) {
                expect(ruleId.startsWith("typedoc/")).toBeTruthy();
            }
        }
    });

    it("strict includes advanced completeness rules", () => {
        const strictRules = plugin.configs?.strict?.rules ?? {};

        expect(strictRules["typedoc/require-code-fence-language"]).toBe(
            "error"
        );
        expect(strictRules["typedoc/no-duplicate-param-tags"]).toBe("error");
        expect(strictRules["typedoc/no-duplicate-type-param-tags"]).toBe(
            "error"
        );
        expect(strictRules["typedoc/prefer-package-documentation-tag"]).toBe(
            "error"
        );
        expect(strictRules["typedoc/require-example-tag"]).toBe("error");
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
        const minimalRules = plugin.configs?.minimal?.rules ?? {};

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
        expect(minimalRules["typedoc/no-duplicate-param-tags"]).toBeUndefined();
        expect(
            minimalRules["typedoc/no-duplicate-type-param-tags"]
        ).toBeUndefined();
        expect(
            minimalRules["typedoc/prefer-package-documentation-tag"]
        ).toBeUndefined();
    });

    it("recommended includes stale tag correctness rules", () => {
        const recommendedRules = plugin.configs?.recommended?.rules ?? {};

        expect(recommendedRules["typedoc/no-extra-param-tags"]).toBe("error");
        expect(recommendedRules["typedoc/prefer-type-param-tag"]).toBe("error");
        expect(recommendedRules["typedoc/no-duplicate-param-tags"]).toBe(
            "error"
        );
        expect(recommendedRules["typedoc/no-duplicate-type-param-tags"]).toBe(
            "error"
        );
        expect(
            recommendedRules["typedoc/prefer-package-documentation-tag"]
        ).toBe("error");
    });
});
