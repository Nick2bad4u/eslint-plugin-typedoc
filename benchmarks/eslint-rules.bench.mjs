import { ESLint } from "eslint";
import { bench, describe, expect } from "vitest";

import {
    benchmarkFileGlobs,
    createTypedocFlatConfig,
    typedocRuleSets,
} from "./eslint-benchmark-config.mjs";

/** @typedef {import("eslint").ESLint.LintResult} LintResult */
/** @typedef {ReadonlyArray<LintResult>} LintResults */
/** @typedef {import("eslint").Linter.RulesRecord} BenchmarkRules */

/**
 * Count lint problems for benchmark signal assertions.
 *
 * @param {LintResults} lintResults - ESLint lint results.
 *
 * @returns {number} Total number of lint problems.
 */
const countProblems = (lintResults) =>
    lintResults.reduce(
        (problemCount, result) =>
            problemCount + result.errorCount + result.warningCount,
        0
    );

/**
 * Run a benchmark lint scenario.
 *
 * @param {{
 *     filePatterns: readonly string[];
 *     fix: boolean;
 *     rules: BenchmarkRules;
 * }} options
 *   - File globs, fix mode, and benchmark rule map.
 *
 * @returns {Promise<LintResults>} Lint results.
 */
const lintScenario = async ({ filePatterns, fix, rules }) => {
    const eslint = new ESLint({
        cache: false,
        fix,
        overrideConfig: createTypedocFlatConfig({ rules }),
        overrideConfigFile: true,
        stats: true,
    });

    return eslint.lintFiles([...filePatterns]);
};

describe("eslint-plugin-typedoc meaningful benchmarks", () => {
    bench(
        "recommended preset on invalid documentation fixtures",
        async () => {
            expect.hasAssertions();

            const lintResults = await lintScenario({
                filePatterns: benchmarkFileGlobs.typedInvalidFixtures,
                fix: false,
                rules: typedocRuleSets.recommended,
            });

            expect(lintResults.length).toBeGreaterThan(0);
            expect(countProblems(lintResults)).toBeGreaterThan(0);
        },
        {
            iterations: 3,
            warmupIterations: 1,
        }
    );

    bench(
        "strict preset on invalid documentation fixtures",
        async () => {
            expect.hasAssertions();

            const lintResults = await lintScenario({
                filePatterns: benchmarkFileGlobs.typedInvalidFixtures,
                fix: false,
                rules: typedocRuleSets.strict,
            });

            expect(lintResults.length).toBeGreaterThan(0);
            expect(countProblems(lintResults)).toBeGreaterThan(0);
        },
        {
            iterations: 2,
            warmupIterations: 1,
        }
    );
});
