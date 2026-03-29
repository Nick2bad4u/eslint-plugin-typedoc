import tsParser from "@typescript-eslint/parser";
import * as path from "node:path";

import plugin from "../plugin.mjs";

/** @typedef {import("eslint").Linter.RulesRecord} BenchmarkRules */
/** @typedef {{ rules: BenchmarkRules }} ConfigWithRules */

/** Absolute repository root used by parser services and benchmark paths. */
export const repositoryRoot = path.resolve(process.cwd());

/** Shared file globs used by benchmark scenarios. */
export const benchmarkFileGlobs = Object.freeze({
    typedInvalidFixtures: Object.freeze([
        "benchmarks/fixtures/documentation.invalid.ts",
    ]),
    typedValidFixtures: Object.freeze([
        "benchmarks/fixtures/documentation.valid.ts",
    ]),
});

/**
 * Resolve rules from a plugin preset by name.
 *
 * @param {"all" | "minimal" | "recommended" | "strict"} presetName - Preset key
 *   from `plugin.configs`.
 *
 * @returns {Readonly<BenchmarkRules>} Frozen rules object for the requested
 *   preset.
 */
const resolveRuleSet = (presetName) => {
    const presetConfig = plugin.configs?.[presetName];
    const preset = Array.isArray(presetConfig)
        ? presetConfig.find(
              (config) =>
                  typeof config === "object" &&
                  !Array.isArray(config) &&
                  "rules" in config
          )
        : presetConfig;

    if (!isConfigWithRules(preset)) {
        throw new TypeError(`Missing preset rules for '${presetName}'.`);
    }

    return Object.freeze({ ...preset.rules });
};

/**
 * Check whether a config value contains a concrete ESLint `rules` map.
 *
 * @param {unknown} value - Config candidate.
 *
 * @returns {value is ConfigWithRules} `true` when the value is an object config
 *   with rules.
 */
const isConfigWithRules = (value) =>
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    "rules" in value &&
    typeof value.rules === "object" &&
    value.rules !== null;

/** Plugin rule sets used by benchmark scenarios. */
/**
 * @type {Readonly<
 *     Record<
 *         "all" | "minimal" | "recommended" | "strict",
 *         Readonly<BenchmarkRules>
 *     >
 * >}
 */
export const typedocRuleSets = Object.freeze({
    all: resolveRuleSet("all"),
    minimal: resolveRuleSet("minimal"),
    recommended: resolveRuleSet("recommended"),
    strict: resolveRuleSet("strict"),
});

/**
 * Create a flat ESLint config array for benchmark scenarios.
 *
 * @type {(options: {
 *     rules: BenchmarkRules;
 * }) => import("eslint").Linter.Config[]}
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types -- This .mjs module relies on JSDoc contracts instead of TypeScript syntax.
export const createTypedocFlatConfig = (options) => {
    const { rules } = options;

    return [
        {
            files: ["**/*.{ts,tsx,mts,cts}"],
            languageOptions: {
                parser: tsParser,
                parserOptions: {
                    ecmaVersion: "latest",
                    project: "./tsconfig.eslint.json",
                    sourceType: "module",
                    tsconfigRootDir: repositoryRoot,
                },
            },
            name: "benchmark:typedoc",
            plugins: {
                typedoc: plugin,
            },
            rules,
        },
    ];
};
