import { describe, expect, it } from "vitest";

import plugin from "../src/plugin.js";

describe("plugin entry", () => {
    it("exposes typedoc plugin meta", () => {
        expect(plugin.meta?.name).toBe("eslint-plugin-typedoc");
        expect(plugin.meta?.namespace).toBe("typedoc");
        expect(typeof plugin.meta?.version).toBe("string");
    });

    it("registers the expected rule set", () => {
        const ruleNames = Object.keys(plugin.rules ?? {}).toSorted();

        expect(ruleNames).toEqual([
            "no-duplicate-param-tags",
            "no-duplicate-type-param-tags",
            "no-extra-param-tags",
            "no-extra-type-param-tags",
            "no-malformed-inline-links",
            "no-unknown-tags",
            "prefer-package-documentation-tag",
            "prefer-type-param-tag",
            "require-code-fence-language",
            "require-example-tag",
            "require-exported-doc-comment",
            "require-package-documentation",
            "require-param-tag-description",
            "require-param-tags",
            "require-returns-description",
            "require-returns-tag",
            "require-throws-description",
            "require-throws-tag",
            "require-type-param-tag-description",
            "require-type-param-tags",
            "typedoc-config-requires-options",
        ]);
    });

    it("exports all expected presets", () => {
        expect(Object.keys(plugin.configs ?? {}).toSorted()).toEqual([
            "all",
            "minimal",
            "recommended",
            "strict",
        ]);
    });
});
