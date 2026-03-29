/**
 * @packageDocumentation
 * Integration coverage for source-level plugin preset wiring.
 */
import type { AsyncReturnType } from "type-fest";

import { describe, expect, it, vi } from "vitest";

import {
    typefestConfigMetadataByName,
    typefestConfigNames,
} from "../src/_internal/typefest-config-references";

/** Import `src/plugin` fresh for each assertion set. */
const loadSourcePlugin = async () => {
    vi.resetModules();
    const pluginModule = await import("../src/plugin");
    return pluginModule.default;
};

/** Plugin config object shape inferred from the loaded source plugin. */
type PluginConfig = PluginType["configs"][keyof PluginType["configs"]];
/** Resolved plugin module type for async source import helper. */
type PluginType = AsyncReturnType<typeof loadSourcePlugin>;

/** Convert a preset rules object into deterministic `[ruleId, level]` entries. */
const getRuleEntries = (
    config: Readonly<PluginConfig>
): (readonly [string, unknown])[] => Object.entries(config.rules ?? {});

describe("source plugin config wiring", () => {
    it("builds non-empty layered rule presets from src/plugin", async () => {
        const plugin = await loadSourcePlugin();
        const minimal = plugin.configs.minimal;
        const recommended = plugin.configs.recommended;
        const recommendedTypeChecked =
            plugin.configs["recommended-type-checked"];
        const strict = plugin.configs.strict;
        const all = plugin.configs.all;
        const experimental = plugin.configs.experimental;
        const expectedQualifiedRuleIds = Object.keys(plugin.rules).map(
            (ruleName) => `typefest/${ruleName}`
        );

        expect(getRuleEntries(minimal).length).toBeGreaterThan(0);
        expect(getRuleEntries(recommended).length).toBeGreaterThan(0);
        expect(getRuleEntries(recommendedTypeChecked).length).toBeGreaterThan(
            0
        );
        expect(getRuleEntries(strict).length).toBeGreaterThan(0);
        expect(getRuleEntries(all).length).toBeGreaterThan(0);
        expect(getRuleEntries(experimental).length).toBeGreaterThan(0);

        expect(Object.keys(experimental.rules)).toEqual(
            expect.arrayContaining(expectedQualifiedRuleIds)
        );
        expect(Object.keys(recommended.rules)).toContain(
            "typefest/prefer-type-fest-arrayable"
        );
        expect(Object.keys(recommended.rules)).toContain(
            "typefest/prefer-ts-extras-is-defined"
        );
        expect(Object.keys(recommended.rules)).not.toContain(
            "typefest/prefer-ts-extras-set-has"
        );
        expect(Object.keys(recommendedTypeChecked.rules)).toContain(
            "typefest/prefer-ts-extras-set-has"
        );
        expect(Object.keys(strict.rules)).toContain(
            "typefest/prefer-ts-extras-set-has"
        );
        expect(Object.keys(strict.rules)).toContain(
            "typefest/prefer-ts-extras-array-at"
        );
        expect(Object.keys(all.rules)).toContain(
            "typefest/prefer-ts-extras-array-find"
        );
        expect(Object.keys(experimental.rules)).toContain(
            "typefest/prefer-ts-extras-object-map-values"
        );
        expect(Object.keys(experimental.rules)).toContain(
            "typefest/prefer-type-fest-conditional-except"
        );
        expect(Object.keys(experimental.rules)).toContain(
            "typefest/prefer-type-fest-merge"
        );
        expect(Object.keys(experimental.rules)).toContain(
            "typefest/prefer-type-fest-asyncify"
        );
        expect(Object.keys(experimental.rules)).toContain(
            "typefest/prefer-type-fest-conditional-keys"
        );
        expect(Object.keys(experimental.rules)).toContain(
            "typefest/prefer-type-fest-distributed-omit"
        );
        expect(Object.keys(experimental.rules)).toContain(
            "typefest/prefer-type-fest-distributed-pick"
        );
        expect(Object.keys(experimental.rules)).toContain(
            "typefest/prefer-type-fest-pick-index-signature"
        );
        expect(Object.keys(experimental.rules)).toContain(
            "typefest/prefer-type-fest-set-return-type"
        );
        expect(Object.keys(experimental.rules)).toContain(
            "typefest/prefer-type-fest-stringified"
        );
        expect(Object.keys(experimental.rules)).toContain(
            "typefest/prefer-type-fest-union-to-intersection"
        );
        expect(Object.keys(strict.rules)).not.toContain(
            "typefest/prefer-ts-extras-array-find"
        );
        expect(Object.keys(all.rules)).not.toContain(
            "typefest/prefer-ts-extras-object-map-values"
        );

        expect(recommended.rules).toHaveProperty(
            "typefest/prefer-type-fest-arrayable",
            "error"
        );
        expect(recommended.rules).toHaveProperty(
            "typefest/prefer-ts-extras-is-defined",
            "error"
        );
        expect(recommendedTypeChecked.rules).toHaveProperty(
            "typefest/prefer-ts-extras-set-has",
            "error"
        );
        expect(strict.rules).toHaveProperty(
            "typefest/prefer-ts-extras-array-at",
            "error"
        );
        expect(all.rules).toHaveProperty(
            "typefest/prefer-ts-extras-array-find",
            "error"
        );
        expect(experimental.rules).toHaveProperty(
            "typefest/prefer-ts-extras-object-map-values",
            "error"
        );
        expect(experimental.rules).toHaveProperty(
            "typefest/prefer-type-fest-conditional-except",
            "error"
        );
        expect(experimental.rules).toHaveProperty(
            "typefest/prefer-type-fest-merge",
            "error"
        );
        expect(experimental.rules).toHaveProperty(
            "typefest/prefer-type-fest-asyncify",
            "error"
        );
        expect(experimental.rules).toHaveProperty(
            "typefest/prefer-type-fest-conditional-keys",
            "error"
        );
        expect(experimental.rules).toHaveProperty(
            "typefest/prefer-type-fest-distributed-omit",
            "error"
        );
        expect(experimental.rules).toHaveProperty(
            "typefest/prefer-type-fest-distributed-pick",
            "error"
        );
        expect(experimental.rules).toHaveProperty(
            "typefest/prefer-type-fest-pick-index-signature",
            "error"
        );
        expect(experimental.rules).toHaveProperty(
            "typefest/prefer-type-fest-set-return-type",
            "error"
        );
        expect(experimental.rules).toHaveProperty(
            "typefest/prefer-type-fest-stringified",
            "error"
        );
        expect(experimental.rules).toHaveProperty(
            "typefest/prefer-type-fest-union-to-intersection",
            "error"
        );
        expect(strict.rules).not.toHaveProperty(
            "typefest/prefer-ts-extras-array-find"
        );
        expect(all.rules).not.toHaveProperty(
            "typefest/prefer-ts-extras-object-map-values"
        );

        for (const configName of typefestConfigNames) {
            expect(plugin.configs[configName].name).toBe(
                typefestConfigMetadataByName[configName].presetName
            );
        }

        expect(plugin.meta.name).toBe("eslint-plugin-typefest");
    });

    it("registers parser defaults, files, and plugin namespace", async () => {
        const plugin = await loadSourcePlugin();
        const recommendedConfig = plugin.configs.recommended;

        expect(recommendedConfig.files).toStrictEqual([
            "**/*.{ts,tsx,mts,cts}",
        ]);
        expect(recommendedConfig.plugins).toHaveProperty("typefest");
        expect(recommendedConfig.plugins?.["typefest"]).toHaveProperty("rules");
        expect(recommendedConfig.languageOptions).toHaveProperty("parser");
        expect(recommendedConfig.languageOptions).toHaveProperty(
            "parserOptions"
        );
        expect(recommendedConfig.languageOptions?.["parserOptions"]).toEqual({
            ecmaVersion: "latest",
            sourceType: "module",
        });

        for (const configName of typefestConfigNames) {
            const parserOptions =
                plugin.configs[configName].languageOptions?.["parserOptions"];

            expect(parserOptions).toEqual(
                expect.objectContaining({
                    ecmaVersion: "latest",
                    sourceType: "module",
                })
            );

            if (typefestConfigMetadataByName[configName].requiresTypeChecking) {
                expect(parserOptions).toEqual(
                    expect.objectContaining({
                        projectService: true,
                    })
                );
            } else {
                expect(parserOptions).toEqual(
                    expect.not.objectContaining({
                        projectService: true,
                    })
                );
            }
        }
    });
});
