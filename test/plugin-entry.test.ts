import { describe, expect, it } from "vitest";

import typedocPlugin from "../src/plugin.js";

describe("plugin entry", () => {
    it("exports typedoc plugin metadata", () => {
        expect(typedocPlugin.meta).toEqual(
            expect.objectContaining({
                name: "eslint-plugin-typedoc",
                namespace: "typedoc",
            })
        );
    });

    it("registers the expected rule ids", () => {
        const ruleNames = Object.keys(typedocPlugin.rules ?? {}).toSorted();

        expect(ruleNames).toEqual([
            "enforce-typedoc-tags",
            "no-typedoc-tag-alias",
            "no-unresolved-typedoc-link",
            "require-export-docs",
            "require-typedoc-config-options",
        ]);
    });
});
