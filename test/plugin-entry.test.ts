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
            "no-malformed-inline-links",
            "no-unknown-tags",
            "require-exported-doc-comment",
            "require-param-tags",
            "require-returns-tag",
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
