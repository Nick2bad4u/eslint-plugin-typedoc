import { describe, expect, it } from "vitest";

import typedocPlugin from "../src/plugin.js";

describe("plugin presets", () => {
    it("exposes minimal, recommended, strict, and all presets", () => {
        expect(Object.keys(typedocPlugin.configs ?? {}).toSorted()).toEqual([
            "all",
            "minimal",
            "recommended",
            "strict",
        ]);
    });

    it("wires recommended rules", () => {
        const recommendedRules = typedocPlugin.configs?.recommended?.rules;

        expect(recommendedRules).toMatchObject({
            "typedoc/enforce-typedoc-tags": "error",
            "typedoc/no-typedoc-tag-alias": "error",
            "typedoc/no-unresolved-typedoc-link": "error",
            "typedoc/require-typedoc-config-options": "error",
        });
        expect(recommendedRules).not.toHaveProperty(
            "typedoc/require-export-docs"
        );
    });

    it("wires strict rules", () => {
        const strictRules = typedocPlugin.configs?.strict?.rules;

        expect(strictRules).toMatchObject({
            "typedoc/enforce-typedoc-tags": "error",
            "typedoc/no-typedoc-tag-alias": "error",
            "typedoc/no-unresolved-typedoc-link": "error",
            "typedoc/require-export-docs": "error",
            "typedoc/require-typedoc-config-options": "error",
        });
    });
});
