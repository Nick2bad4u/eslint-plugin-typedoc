import { ESLint } from "eslint";
import { bench, describe } from "vitest";

import {
    benchmarkFileGlobs,
    createTypefestFlatConfig,
    typefestRuleSets,
} from "./eslint-benchmark-config.mjs";

/**
 * @typedef {import("eslint").ESLint.LintResult} LintResult
 */

/**
 * @typedef {ReadonlyArray<LintResult>} LintResults
 */

/**
 * @typedef {import("eslint").Linter.RulesRecord} BenchmarkRules
 */

/**
 * @typedef {Readonly<{
 *     filePatterns: readonly string[];
 *     fix: boolean;
 *     rules: BenchmarkRules;
 * }>} LintScenarioOptions
 */

const singleRuleBenchmarks = Object.freeze({
    "typefest/prefer-ts-extras-is-present": "error",
    "typefest/prefer-ts-extras-safe-cast-to": "error",
    "typefest/prefer-ts-extras-set-has": "error",
    "typefest/prefer-ts-extras-string-split": "error",
    "typefest/prefer-type-fest-arrayable": "error",
});

const standardBenchmarkOptions = Object.freeze({
    iterations: 3,
    warmupIterations: 1,
});

const expensiveBenchmarkOptions = Object.freeze({
    iterations: 2,
    warmupIterations: 0,
});

/**
 * Narrow unknown values to object records.
 *
 * @param {unknown} value - Value to inspect.
 *
 * @returns {value is Record<string, unknown>} Whether the value is object-like.
 */
const isObjectRecord = (value) => typeof value === "object" && value !== null;

/**
 * Read `stats.times.passes` from an ESLint lint result.
 *
 * @param {LintResult} lintResult - ESLint lint result.
 *
 * @returns {readonly unknown[]} Lint passes (or empty array when unavailable).
 */
const getLintPasses = (lintResult) => {
    const stats = lintResult.stats;
    if (!isObjectRecord(stats)) {
        return [];
    }

    const times = stats.times;
    if (!isObjectRecord(times)) {
        return [];
    }

    const passes = times.passes;
    return Array.isArray(passes) ? passes : [];
};

/**
 * Read per-rule timing object from a lint pass.
 *
 * @param {unknown} pass - ESLint pass payload.
 *
 * @returns {null | Record<string, unknown>} Rule timing record when present.
 */
const getPassRules = (pass) => {
    if (!isObjectRecord(pass)) {
        return null;
    }

    const rules = pass["rules"];
    return isObjectRecord(rules) ? rules : null;
};

/**
 * Normalize a single rule timing object to milliseconds.
 *
 * @param {unknown} ruleTiming - Timing payload.
 *
 * @returns {number} Rule timing in milliseconds.
 */
const getRuleTimingMilliseconds = (ruleTiming) => {
    if (!isObjectRecord(ruleTiming)) {
        return 0;
    }

    const total = ruleTiming["total"];
    return typeof total === "number" ? total : 0;
};

/**
 * Count lint problems so benchmark runs assert useful signal.
 *
 * @param {LintResults} lintResults - ESLint lint results.
 *
 * @returns Total error + warning count.
 */
const countReportedProblems = (lintResults) =>
    lintResults.reduce(
        (problemCount, result) =>
            problemCount + result.errorCount + result.warningCount,
        0
    );

/**
 * Sum rule execution milliseconds from ESLint stats payload.
 *
 * @param {LintResults} lintResults - ESLint lint results.
 *
 * @returns Total rule timing in milliseconds.
 */
const sumRuleTimingMilliseconds = (lintResults) => {
    let totalRuleTime = 0;

    for (const result of lintResults) {
        for (const pass of getLintPasses(result)) {
            const passRules = getPassRules(pass);
            if (passRules !== null) {
                for (const ruleTiming of Object.values(passRules)) {
                    totalRuleTime += getRuleTimingMilliseconds(ruleTiming);
                }
            }
        }
    }

    return totalRuleTime;
};

/**
 * Guard benchmark outputs to ensure each case performs real lint work.
 *
 * @param {string} scenarioName - Human-friendly scenario label.
 * @param {LintResults} lintResults - ESLint lint results.
 * @param {{
 *     maximumReportedProblems?: number;
 *     minimumReportedProblems?: number;
 * }} [options]
 *   - Signal options.
 */
const assertMeaningfulBenchmarkSignal = (
    scenarioName,
    lintResults,
    options
) => {
    const maximumReportedProblems =
        options?.maximumReportedProblems ?? Number.POSITIVE_INFINITY;
    const minimumReportedProblems = options?.minimumReportedProblems ?? 1;

    if (lintResults.length === 0) {
        throw new Error(`${scenarioName}: ESLint returned no lint results.`);
    }

    const reportedProblems = countReportedProblems(lintResults);
    if (reportedProblems < minimumReportedProblems) {
        throw new Error(
            `${scenarioName}: expected at least ${minimumReportedProblems} reported lint problem(s).`
        );
    }

    if (reportedProblems > maximumReportedProblems) {
        throw new Error(
            `${scenarioName}: expected at most ${maximumReportedProblems} reported lint problem(s).`
        );
    }

    const measuredRuleTime = sumRuleTimingMilliseconds(lintResults);
    if (measuredRuleTime <= 0) {
        throw new Error(
            `${scenarioName}: expected positive ESLint rule timing.`
        );
    }
};

/**
 * Run ESLint with a temporary benchmark-specific config.
 *
 * @param {LintScenarioOptions} options - Scenario options.
 *
 * @returns {Promise<LintResult[]>} ESLint lint results.
 */
const lintScenario = async ({ filePatterns, fix, rules }) => {
    const eslint = new ESLint({
        cache: false,
        fix,
        overrideConfig: createTypefestFlatConfig({ rules }),
        overrideConfigFile: true,
        stats: true,
    });

    return eslint.lintFiles([...filePatterns]);
};

describe("eslint-plugin-typefest meaningful benchmarks", () => {
    bench(
        "recommended preset on full invalid typed fixture corpus",
        async () => {
            const lintResults = await lintScenario({
                filePatterns: benchmarkFileGlobs.typedInvalidFixtures,
                fix: false,
                rules: typefestRuleSets.recommended,
            });

            assertMeaningfulBenchmarkSignal(
                "recommended preset on full invalid typed fixture corpus",
                lintResults
            );
        },
        standardBenchmarkOptions
    );

    bench(
        "strict preset on full invalid typed fixture corpus",
        async () => {
            const lintResults = await lintScenario({
                filePatterns: benchmarkFileGlobs.typedInvalidFixtures,
                fix: false,
                rules: typefestRuleSets.strict,
            });

            assertMeaningfulBenchmarkSignal(
                "strict preset on full invalid typed fixture corpus",
                lintResults
            );
        },
        standardBenchmarkOptions
    );

    bench(
        "recommended preset on full valid typed fixture corpus",
        async () => {
            const lintResults = await lintScenario({
                filePatterns: benchmarkFileGlobs.typedValidFixtures,
                fix: false,
                rules: typefestRuleSets.recommended,
            });

            assertMeaningfulBenchmarkSignal(
                "recommended preset on full valid typed fixture corpus",
                lintResults,
                { minimumReportedProblems: 0 }
            );
        },
        standardBenchmarkOptions
    );

    bench(
        "recommended preset on curated zero-message corpus",
        async () => {
            const lintResults = await lintScenario({
                filePatterns: benchmarkFileGlobs.recommendedZeroMessageFixture,
                fix: false,
                rules: typefestRuleSets.recommended,
            });

            assertMeaningfulBenchmarkSignal(
                "recommended preset on curated zero-message corpus",
                lintResults,
                { maximumReportedProblems: 0, minimumReportedProblems: 0 }
            );
        },
        standardBenchmarkOptions
    );

    bench(
        "ts-extras type-guards preset on ts-extras invalid fixtures",
        async () => {
            const lintResults = await lintScenario({
                filePatterns: benchmarkFileGlobs.tsExtrasInvalidFixtures,
                fix: false,
                rules: typefestRuleSets.tsExtrasTypeGuards,
            });

            assertMeaningfulBenchmarkSignal(
                "ts-extras type-guards preset on ts-extras invalid fixtures",
                lintResults
            );
        },
        standardBenchmarkOptions
    );

    bench(
        "type-fest types preset on type-fest invalid fixtures",
        async () => {
            const lintResults = await lintScenario({
                filePatterns: benchmarkFileGlobs.typeFestInvalidFixtures,
                fix: false,
                rules: typefestRuleSets.typeFestTypes,
            });

            assertMeaningfulBenchmarkSignal(
                "type-fest types preset on type-fest invalid fixtures",
                lintResults
            );
        },
        standardBenchmarkOptions
    );

    bench(
        "recommended preset (fix=true) on ts-extras invalid fixtures",
        async () => {
            const lintResults = await lintScenario({
                filePatterns: benchmarkFileGlobs.tsExtrasInvalidFixtures,
                fix: true,
                rules: typefestRuleSets.recommended,
            });

            assertMeaningfulBenchmarkSignal(
                "recommended preset (fix=true) on ts-extras invalid fixtures",
                lintResults
            );
        },
        expensiveBenchmarkOptions
    );

    bench(
        "single rule prefer-ts-extras-is-present on stress fixture",
        async () => {
            const lintResults = await lintScenario({
                filePatterns: benchmarkFileGlobs.isPresentStressFixture,
                fix: false,
                rules: {
                    "typefest/prefer-ts-extras-is-present":
                        singleRuleBenchmarks[
                            "typefest/prefer-ts-extras-is-present"
                        ],
                },
            });

            assertMeaningfulBenchmarkSignal(
                "single rule prefer-ts-extras-is-present on stress fixture",
                lintResults
            );
        },
        standardBenchmarkOptions
    );

    bench(
        "single rule prefer-ts-extras-safe-cast-to on stress fixture",
        async () => {
            const lintResults = await lintScenario({
                filePatterns: benchmarkFileGlobs.safeCastToStressFixture,
                fix: false,
                rules: {
                    "typefest/prefer-ts-extras-safe-cast-to":
                        singleRuleBenchmarks[
                            "typefest/prefer-ts-extras-safe-cast-to"
                        ],
                },
            });

            assertMeaningfulBenchmarkSignal(
                "single rule prefer-ts-extras-safe-cast-to on stress fixture",
                lintResults
            );
        },
        standardBenchmarkOptions
    );

    bench(
        "single rule prefer-ts-extras-set-has on stress fixture",
        async () => {
            const lintResults = await lintScenario({
                filePatterns: benchmarkFileGlobs.setHasStressFixture,
                fix: false,
                rules: {
                    "typefest/prefer-ts-extras-set-has":
                        singleRuleBenchmarks[
                            "typefest/prefer-ts-extras-set-has"
                        ],
                },
            });

            assertMeaningfulBenchmarkSignal(
                "single rule prefer-ts-extras-set-has on stress fixture",
                lintResults
            );
        },
        standardBenchmarkOptions
    );

    bench(
        "single rule prefer-ts-extras-string-split on stress fixture",
        async () => {
            const lintResults = await lintScenario({
                filePatterns: benchmarkFileGlobs.stringSplitStressFixture,
                fix: false,
                rules: {
                    "typefest/prefer-ts-extras-string-split":
                        singleRuleBenchmarks[
                            "typefest/prefer-ts-extras-string-split"
                        ],
                },
            });

            assertMeaningfulBenchmarkSignal(
                "single rule prefer-ts-extras-string-split on stress fixture",
                lintResults
            );
        },
        standardBenchmarkOptions
    );

    bench(
        "single rule prefer-ts-extras-safe-cast-to on stress fixture (fix=true)",
        async () => {
            const lintResults = await lintScenario({
                filePatterns: benchmarkFileGlobs.safeCastToStressFixture,
                fix: true,
                rules: {
                    "typefest/prefer-ts-extras-safe-cast-to":
                        singleRuleBenchmarks[
                            "typefest/prefer-ts-extras-safe-cast-to"
                        ],
                },
            });

            assertMeaningfulBenchmarkSignal(
                "single rule prefer-ts-extras-safe-cast-to on stress fixture (fix=true)",
                lintResults,
                { maximumReportedProblems: 0, minimumReportedProblems: 0 }
            );
        },
        expensiveBenchmarkOptions
    );

    bench(
        "single rule prefer-type-fest-arrayable on stress fixture",
        async () => {
            const lintResults = await lintScenario({
                filePatterns: benchmarkFileGlobs.arrayableStressFixture,
                fix: false,
                rules: {
                    "typefest/prefer-type-fest-arrayable":
                        singleRuleBenchmarks[
                            "typefest/prefer-type-fest-arrayable"
                        ],
                },
            });

            assertMeaningfulBenchmarkSignal(
                "single rule prefer-type-fest-arrayable on stress fixture",
                lintResults
            );
        },
        standardBenchmarkOptions
    );
});
