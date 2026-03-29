/**
 * @packageDocumentation
 * Vitest coverage for `configs.test` behavior.
 */
import type { UnknownRecord } from "type-fest";

import { describe, expect, it } from "vitest";

import {
    typefestConfigMetadataByName,
    typefestConfigNames,
} from "../src/_internal/typefest-config-references";
import typefestPlugin from "../src/plugin";

interface FlatConfigLike {
    files?: unknown;
    languageOptions?: UnknownRecord & {
        parser?: unknown;
        parserOptions?: unknown;
    };
    name?: unknown;
    plugins?: UnknownRecord;
    rules?: UnknownRecord;
}

/**
 * Resolve a named plugin preset config from a dynamic `plugin.configs` map.
 *
 * @param configs - Dynamic plugin configs record.
 * @param configName - Preset key to resolve.
 *
 * @returns Parsed flat-config-like preset when present and object-shaped.
 */
function getConfig(
    configs: Readonly<null | UnknownRecord>,
    configName: string
): FlatConfigLike | undefined {
    const config = configs?.[configName];

    return isObject(config) ? (config as FlatConfigLike) : undefined;
}

/**
 * Resolve the `rules` object for a named plugin preset.
 *
 * @param configs - Dynamic plugin configs record.
 * @param configName - Preset key to resolve.
 *
 * @returns Rules map when present and object-shaped; otherwise `null`.
 */
function getConfigRules(
    configs: Readonly<null | UnknownRecord>,
    configName: string
): null | UnknownRecord {
    const config = configs?.[configName];
    if (!isObject(config)) {
        return null;
    }

    const rules = config["rules"];
    if (!isObject(rules)) {
        return null;
    }

    return rules;
}

/**
 * Extract the `configs` export from a dynamic plugin value.
 *
 * @param pluginValue - Dynamic plugin module value.
 *
 * @returns Config map when available; otherwise `null`.
 */
function getPluginConfigs(pluginValue: unknown): null | UnknownRecord {
    if (!isObject(pluginValue)) {
        return null;
    }

    const configs = pluginValue["configs"];
    if (!isObject(configs)) {
        return null;
    }

    return configs;
}

/**
 * Extract the `rules` export from a dynamic plugin value.
 *
 * @param pluginValue - Dynamic plugin module value.
 *
 * @returns Rules map when available; otherwise `null`.
 */
function getPluginRules(pluginValue: unknown): null | UnknownRecord {
    if (!isObject(pluginValue)) {
        return null;
    }

    const rules = pluginValue["rules"];
    if (!isObject(rules)) {
        return null;
    }

    return rules;
}

/**
 * Check whether a dynamic value is an object-like record.
 *
 * @param value - Runtime value under inspection.
 *
 * @returns `true` when value is object-like and non-null.
 */
function isObject(value: unknown): value is UnknownRecord {
    return typeof value === "object" && value !== null;
}

describe("typefest plugin configs", () => {
    const configs = getPluginConfigs(typefestPlugin);
    const rules = getPluginRules(typefestPlugin);

    it("exports exactly the supported config keys", () => {
        const keys = Object.keys(configs ?? {});

        expect(keys).toHaveLength(typefestConfigNames.length);
        expect(new Set(keys)).toStrictEqual(new Set(typefestConfigNames));
    });

    it("keeps languageOptions objects isolated per preset", () => {
        const recommendedConfig = getConfig(configs, "recommended");
        const strictConfig = getConfig(configs, "strict");
        const allConfig = getConfig(configs, "all");

        expect(recommendedConfig).toBeDefined();
        expect(strictConfig).toBeDefined();
        expect(allConfig).toBeDefined();

        const recommendedPresetConfig = recommendedConfig!;
        const strictPresetConfig = strictConfig!;
        const allPresetConfig = allConfig!;

        expect(recommendedPresetConfig.languageOptions).not.toBe(
            strictPresetConfig.languageOptions
        );
        expect(recommendedPresetConfig.languageOptions).not.toBe(
            allPresetConfig.languageOptions
        );

        expect(recommendedPresetConfig.languageOptions?.parserOptions).not.toBe(
            strictPresetConfig.languageOptions?.parserOptions
        );
        expect(strictPresetConfig.languageOptions?.parserOptions).not.toBe(
            allPresetConfig.languageOptions?.parserOptions
        );
    });

    it("every exported config registers plugin and TypeScript parser defaults", () => {
        for (const config of Object.values(configs ?? {}) as FlatConfigLike[]) {
            expect(config).toEqual(
                expect.objectContaining({
                    files: ["**/*.{ts,tsx,mts,cts}"],
                    plugins: expect.objectContaining({
                        typefest: expect.anything(),
                    }),
                })
            );

            expect(config.languageOptions).toEqual(
                expect.objectContaining({
                    parser: expect.anything(),
                    parserOptions: expect.objectContaining({
                        ecmaVersion: "latest",
                        sourceType: "module",
                    }),
                })
            );
        }
    });

    it("enables every rule in the experimental preset", () => {
        const experimentalRules = getConfigRules(configs, "experimental");

        expect(experimentalRules).toBeDefined();

        for (const ruleId of Object.keys(rules ?? {})) {
            expect(experimentalRules).toHaveProperty(
                `typefest/${ruleId}`,
                "error"
            );
        }
    });

    it("keeps minimal ⊂ recommended ⊂ recommended-type-checked ⊂ strict ⊂ all ⊂ experimental", () => {
        const minimalRules = getConfigRules(configs, "minimal") ?? {};
        const recommendedRules = getConfigRules(configs, "recommended") ?? {};
        const recommendedTypeCheckedRules =
            getConfigRules(configs, "recommended-type-checked") ?? {};
        const strictRules = getConfigRules(configs, "strict") ?? {};
        const allRules = getConfigRules(configs, "all") ?? {};
        const experimentalRules = getConfigRules(configs, "experimental") ?? {};

        for (const ruleName of Object.keys(minimalRules)) {
            expect(recommendedRules).toHaveProperty(ruleName, "error");
        }

        for (const ruleName of Object.keys(recommendedRules)) {
            expect(recommendedTypeCheckedRules).toHaveProperty(
                ruleName,
                "error"
            );
        }

        for (const ruleName of Object.keys(recommendedTypeCheckedRules)) {
            expect(strictRules).toHaveProperty(ruleName, "error");
        }

        for (const ruleName of Object.keys(strictRules)) {
            expect(allRules).toHaveProperty(ruleName, "error");
        }

        for (const ruleName of Object.keys(allRules)) {
            expect(experimentalRules).toHaveProperty(ruleName, "error");
        }
    });

    it("keeps type-fest/types focused to type-fest rules", () => {
        const festTypeRulesPreset =
            getConfigRules(configs, "type-fest/types") ?? {};

        for (const ruleName of Object.keys(festTypeRulesPreset)) {
            expect(
                ruleName.startsWith("typefest/prefer-type-fest-")
            ).toBeTruthy();
        }
    });

    it("keeps ts-extras/type-guards focused to ts-extras rules", () => {
        const tsExtrasRules =
            getConfigRules(configs, "ts-extras/type-guards") ?? {};

        for (const ruleName of Object.keys(tsExtrasRules)) {
            expect(
                ruleName.startsWith("typefest/prefer-ts-extras-")
            ).toBeTruthy();
        }
    });

    it("keeps all-only rules excluded from strict and included in all", () => {
        const strictRules = getConfigRules(configs, "strict") ?? {};
        const allRules = getConfigRules(configs, "all") ?? {};

        const allOnlyRules = [
            "typefest/prefer-ts-extras-array-find",
            "typefest/prefer-ts-extras-array-find-last-index",
            "typefest/prefer-ts-extras-is-equal-type",
        ];

        for (const ruleName of allOnlyRules) {
            expect(strictRules).not.toHaveProperty(ruleName);
            expect(allRules).toHaveProperty(ruleName, "error");
        }
    });

    it("keeps experimental-only rules excluded from all and included in experimental", () => {
        const allRules = getConfigRules(configs, "all") ?? {};
        const experimentalRules = getConfigRules(configs, "experimental") ?? {};

        const experimentalOnlyRules = [
            "typefest/prefer-ts-extras-object-map-values",
            "typefest/prefer-type-fest-conditional-except",
            "typefest/prefer-type-fest-merge",
            "typefest/prefer-type-fest-stringified",
        ];

        for (const ruleName of experimentalOnlyRules) {
            expect(allRules).not.toHaveProperty(ruleName);
            expect(experimentalRules).toHaveProperty(ruleName, "error");
        }
    });

    it("enables parser projectService for presets that include typed rules", () => {
        for (const configName of typefestConfigNames) {
            const config = getConfig(configs, configName);

            expect(config).toBeDefined();

            if (typefestConfigMetadataByName[configName].requiresTypeChecking) {
                expect(config?.languageOptions?.parserOptions).toEqual(
                    expect.objectContaining({
                        projectService: true,
                    })
                );
            } else {
                expect(config?.languageOptions?.parserOptions).toEqual(
                    expect.not.objectContaining({
                        projectService: true,
                    })
                );
            }
        }
    });
});
