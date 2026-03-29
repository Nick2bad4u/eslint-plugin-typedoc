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

    it("strict includes param/returns completeness rules", () => {
        const strictRules = plugin.configs?.strict?.rules ?? {};

        expect(strictRules["typedoc/require-param-tags"]).toBe("error");
        expect(strictRules["typedoc/require-returns-tag"]).toBe("error");
    });

    it("minimal excludes strict-only completeness rules", () => {
        const minimalRules = plugin.configs?.minimal?.rules ?? {};

        expect(minimalRules["typedoc/require-param-tags"]).toBeUndefined();
        expect(minimalRules["typedoc/require-returns-tag"]).toBeUndefined();
    });
});
