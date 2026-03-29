import tsParser from "@typescript-eslint/parser";
import * as path from "node:path";

import plugin from "../plugin.mjs";

/**
 * @typedef {Record<string, unknown>} UnknownRecord
 */

/**
 * @typedef {import("eslint").Linter.RulesRecord} BenchmarkRules
 */

/**
 * @typedef {{
 *     arrayableStressFixture: readonly string[];
 *     isPresentStressFixture: readonly string[];
 *     recommendedZeroMessageFixture: readonly string[];
 *     setHasStressFixture: readonly string[];
 *     safeCastToStressFixture: readonly string[];
 *     stringSplitStressFixture: readonly string[];
 *     tsExtrasInvalidFixtures: readonly string[];
 *     typedInvalidFixtures: readonly string[];
 *     typedValidFixtures: readonly string[];
 *     typeFestInvalidFixtures: readonly string[];
 * }} BenchmarkFileGlobs
 */

/**
 * @typedef {{ rules: BenchmarkRules }} CreateTypefestFlatConfigOptions
 */

/**
 * @typedef {{
 *     all: Readonly<BenchmarkRules>;
 *     minimal: Readonly<BenchmarkRules>;
 *     recommended: Readonly<BenchmarkRules>;
 *     strict: Readonly<BenchmarkRules>;
 *     tsExtrasTypeGuards: Readonly<BenchmarkRules>;
 *     typeFestTypes: Readonly<BenchmarkRules>;
 * }} TypefestRuleSets
 */

/**
 * Check whether a value is an object record.
 *
 * @param {unknown} value - Value to inspect.
 *
 * @returns {value is UnknownRecord} `true` when value is a non-null object.
 */
const isUnknownRecord = (value) => typeof value === "object" && value !== null;

/**
 * Absolute repository root used by parser services and benchmark paths.
 */
export const repositoryRoot = path.resolve(process.cwd());

/**
 * Shared file globs used by benchmark scenarios.
 */
/** @type {Readonly<BenchmarkFileGlobs>} */
export const benchmarkFileGlobs = Object.freeze({
    arrayableStressFixture: Object.freeze([
        "benchmarks/fixtures/arrayable.stress.ts",
    ]),
    isPresentStressFixture: Object.freeze([
        "benchmarks/fixtures/is-present.stress.ts",
    ]),
    recommendedZeroMessageFixture: Object.freeze([
        "benchmarks/fixtures/recommended-zero-message.baseline.ts",
    ]),
    safeCastToStressFixture: Object.freeze([
        "benchmarks/fixtures/safe-cast-to.stress.ts",
    ]),
    setHasStressFixture: Object.freeze([
        "benchmarks/fixtures/set-has.stress.ts",
    ]),
    stringSplitStressFixture: Object.freeze([
        "benchmarks/fixtures/string-split.stress.ts",
    ]),
    tsExtrasInvalidFixtures: Object.freeze([
        "test/fixtures/typed/prefer-ts-extras-*.invalid.ts",
    ]),
    typedInvalidFixtures: Object.freeze(["test/fixtures/typed/*.invalid.ts"]),
    typedValidFixtures: Object.freeze(["test/fixtures/typed/*.valid.ts"]),
    typeFestInvalidFixtures: Object.freeze([
        "test/fixtures/typed/prefer-type-fest-*.invalid.ts",
    ]),
});

/**
 * Ensure a dynamic value is a non-null object record.
 *
 * @param {unknown} value - Value to validate.
 * @param {string} label - Error label for diagnostics.
 *
 * @returns {UnknownRecord} Normalized object record.
 */
const ensureRecord = (value, label) => {
    if (!isUnknownRecord(value)) {
        throw new TypeError(`${label} must be a non-null object.`);
    }

    return value;
};

/**
 * Check whether a value is an ESLint rule entry.
 *
 * @param {unknown} value - Rule config candidate.
 *
 * @returns {value is import("eslint").Linter.RuleEntry} Whether value matches
 *   an ESLint rule entry shape.
 */
const isRuleEntry = (value) =>
    typeof value === "number" ||
    typeof value === "string" ||
    Array.isArray(value);

/**
 * Ensure a dynamic value is a valid ESLint rules record.
 *
 * @param {unknown} value - Value to validate.
 * @param {string} label - Error label for diagnostics.
 *
 * @returns {BenchmarkRules} Normalized rules record.
 */
const ensureRulesRecord = (value, label) => {
    const record = ensureRecord(value, label);
    /** @type {BenchmarkRules} */
    const rulesRecord = {};

    for (const [ruleName, ruleEntry] of Object.entries(record)) {
        if (!isRuleEntry(ruleEntry)) {
            throw new TypeError(
                `${label}.${ruleName} must be a valid ESLint rule entry.`
            );
        }

        rulesRecord[ruleName] = ruleEntry;
    }

    return rulesRecord;
};

/**
 * Resolve rules from a plugin preset by name.
 *
 * @param {string} presetName - Key under `typefestPlugin.configs`.
 *
 * @returns {Readonly<BenchmarkRules>} Frozen rule map suitable for flat config.
 */
const resolveRuleSet = (presetName) => {
    const configs = ensureRecord(plugin.configs, "plugin.configs");
    const preset = ensureRecord(
        configs[presetName],
        `plugin.configs.${presetName}`
    );
    const rules = ensureRulesRecord(
        preset["rules"],
        `${presetName} preset rules`
    );

    return Object.freeze({ ...rules });
};

/**
 * Plugin rule sets used by benchmark scenarios.
 */
/** @type {Readonly<TypefestRuleSets>} */
export const typefestRuleSets = Object.freeze({
    all: resolveRuleSet("all"),
    minimal: resolveRuleSet("minimal"),
    recommended: resolveRuleSet("recommended"),
    strict: resolveRuleSet("strict"),
    tsExtrasTypeGuards: resolveRuleSet("ts-extras/type-guards"),
    typeFestTypes: resolveRuleSet("type-fest/types"),
});

/**
 * Create a flat ESLint config array for typefest benchmark scenarios.
 *
 * @param {CreateTypefestFlatConfigOptions} options - Config creation options.
 *
 * @returns {import("eslint").Linter.Config[]} Flat config array for ESLint Node
 *   API / CLI usage.
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types -- This .mjs module relies on JSDoc contracts instead of TS syntax.
export function createTypefestFlatConfig(options) {
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
            name: "benchmark:typefest",
            plugins: {
                typefest: plugin,
            },
            rules,
        },
    ];
}
