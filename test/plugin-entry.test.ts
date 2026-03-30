import { describe, expect, it } from "vitest";

import typedocPlugin from "../src/plugin.js";

describe("plugin entry", () => {
    it("exposes typedoc plugin meta", () => {
        expect(typedocPlugin.meta?.name).toBe("eslint-plugin-typedoc");
        expect(typedocPlugin.meta?.namespace).toBe("typedoc");
        expect(typeof typedocPlugin.meta?.version).toBe("string");
    });

    it("registers the expected rule set", () => {
        const ruleNames = Object.keys(typedocPlugin.rules ?? {}).toSorted();

        expect(ruleNames).toEqual([
            "no-duplicate-param-tags",
            "no-duplicate-type-param-tags",
            "no-empty-example-tag",
            "no-extra-param-tags",
            "no-extra-type-param-tags",
            "no-malformed-inline-links",
            "no-unknown-tags",
            "prefer-package-documentation-tag",
            "prefer-type-param-tag",
            "require-code-fence-language",
            "require-default-value-tag",
            "require-example-tag",
            "require-exported-doc-comment",
            "require-package-documentation",
            "require-package-documentation-description",
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
        expect(Object.keys(typedocPlugin.configs ?? {}).toSorted()).toEqual([
            "all",
            "minimal",
            "recommended",
            "strict",
        ]);
    });
});
