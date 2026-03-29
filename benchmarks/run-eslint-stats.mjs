import { ESLint } from "eslint";
import { mkdir, writeFile } from "node:fs/promises";
import * as path from "node:path";
import { performance } from "node:perf_hooks";
import pc from "picocolors";

import {
    benchmarkFileGlobs,
    createTypedocFlatConfig,
    repositoryRoot,
    typedocRuleSets,
} from "./eslint-benchmark-config.mjs";

/** @typedef {import("eslint").Linter.RulesRecord} BenchmarkRules */
/** @typedef {import("eslint").ESLint.LintResult} LintResult */
/** @typedef {ReadonlyArray<LintResult>} LintResults */

/**
 * @typedef {Readonly<{
 *     filePatterns: readonly string[];
 *     fix: boolean;
 *     name: string;
 *     rules: BenchmarkRules;
 * }>} BenchmarkScenario
 */

/**
 * @typedef {Readonly<{
 *     maxMilliseconds: number;
 *     meanMilliseconds: number;
 *     medianMilliseconds: number;
 *     minMilliseconds: number;
 * }>} WallClockSummary
 */

/**
 * @typedef {Readonly<{
 *     filePatterns: readonly string[];
 *     fix: boolean;
 *     iterations: number;
 *     messageCount: number;
 *     name: string;
 *     warmupIterations: number;
 *     wallClock: WallClockSummary;
 * }>} ScenarioResult
 */

/**
 * @typedef {Readonly<{
 *     generatedAt: string;
 *     iterations: number;
 *     scenarios: readonly ScenarioResult[];
 *     warmupIterations: number;
 * }>} BenchmarkReport
 */

/** Default benchmark iteration count. */
const defaultIterations = 3;
/** Default benchmark warmup iteration count. */
const defaultWarmupIterations = 1;

/** @type {readonly BenchmarkScenario[]} */
const benchmarkScenarios = Object.freeze([
    {
        filePatterns: benchmarkFileGlobs.typedInvalidFixtures,
        fix: false,
        name: "recommended-invalid-corpus",
        rules: typedocRuleSets.recommended,
    },
    {
        filePatterns: benchmarkFileGlobs.typedValidFixtures,
        fix: false,
        name: "recommended-valid-corpus",
        rules: typedocRuleSets.recommended,
    },
    {
        filePatterns: benchmarkFileGlobs.typedInvalidFixtures,
        fix: false,
        name: "strict-invalid-corpus",
        rules: typedocRuleSets.strict,
    },
]);

/**
 * Parse a non-negative integer argument in `--key=value` form.
 *
 * @param {string} key - CLI key without leading dashes.
 * @param {number} fallbackValue - Default value.
 *
 * @returns {number} Parsed non-negative integer.
 */
const parseIntegerArgument = (key, fallbackValue) => {
    const matchingArgument = process.argv.find((argument) =>
        argument.startsWith(`--${key}=`)
    );

    if (matchingArgument === undefined) {
        return fallbackValue;
    }

    const [, rawValue = ""] = matchingArgument.split("=");
    const parsedValue = Number.parseInt(rawValue, 10);

    if (!Number.isInteger(parsedValue) || parsedValue < 0) {
        throw new TypeError(
            `Expected --${key}=<non-negative-integer>; received '${rawValue}'.`
        );
    }

    return parsedValue;
};

/**
 * Create a configured ESLint instance for benchmark execution.
 *
 * @param {{ fix: boolean; rules: BenchmarkRules }} options - ESLint options.
 *
 * @returns {ESLint} Benchmark ESLint instance.
 */
const createBenchmarkEslint = ({ fix, rules }) =>
    new ESLint({
        cache: false,
        fix,
        overrideConfig: createTypedocFlatConfig({ rules }),
        overrideConfigFile: true,
        stats: true,
    });

/**
 * Count lint messages from lint results.
 *
 * @param {LintResults} lintResults - ESLint lint results.
 *
 * @returns {number} Total error + warning count.
 */
const countMessages = (lintResults) =>
    lintResults.reduce(
        (messageCount, result) =>
            messageCount + result.errorCount + result.warningCount,
        0
    );

/**
 * Safely divide two numbers.
 *
 * @param {number} numerator - Numerator.
 * @param {number} denominator - Denominator.
 *
 * @returns {number | undefined} Division result or `undefined` when denominator
 *   is zero.
 */
const safeDivide = (numerator, denominator) =>
    // eslint-disable-next-line total-functions/no-partial-division -- Denominator is explicitly guarded and undefined is returned for zero.
    denominator === 0 ? undefined : numerator / denominator;

/**
 * Calculate median value from a list of numbers.
 *
 * @param {readonly number[]} values - Numeric values.
 *
 * @returns {number} Median value.
 */
const calculateMedian = (values) => {
    // eslint-disable-next-line unicorn/no-array-sort -- `toSorted` is blocked by canonical/no-use-extend-native in this workspace.
    const sortedValues = [...values].sort((left, right) => left - right);
    const middleIndex = Math.floor(sortedValues.length / 2);

    if (sortedValues.length % 2 === 1) {
        return sortedValues[middleIndex] ?? 0;
    }

    return (
        ((sortedValues[middleIndex - 1] ?? 0) +
            (sortedValues[middleIndex] ?? 0)) /
        2
    );
};

/**
 * Execute one benchmark scenario.
 *
 * @param {BenchmarkScenario} scenario - Benchmark scenario definition.
 * @param {{ iterations: number; warmupIterations: number }} options
 *
 *   - Runtime iteration settings.
 *
 * @returns {Promise<ScenarioResult>} Scenario benchmark result.
 */
const runScenario = async (scenario, { iterations, warmupIterations }) => {
    const eslint = createBenchmarkEslint({
        fix: scenario.fix,
        rules: scenario.rules,
    });

    for (let iteration = 0; iteration < warmupIterations; iteration += 1) {
        await eslint.lintFiles([...scenario.filePatterns]);
    }

    /** @type {number[]} */
    const wallClockMeasurements = [];
    /** @type {LintResults} */
    let lastLintResults = [];

    for (let iteration = 0; iteration < iterations; iteration += 1) {
        const startTime = performance.now();
        const lintResults = await eslint.lintFiles([...scenario.filePatterns]);
        const endTime = performance.now();

        wallClockMeasurements.push(endTime - startTime);
        lastLintResults = lintResults;
    }

    const mathWithSumPrecise = /**
     * @type {Math & {
     *     sumPrecise: (values: readonly number[]) => number;
     * }}
     */ (Math);
    const totalWallClock = mathWithSumPrecise.sumPrecise(wallClockMeasurements);

    return {
        filePatterns: scenario.filePatterns,
        fix: scenario.fix,
        iterations,
        messageCount: countMessages(lastLintResults),
        name: scenario.name,
        wallClock: {
            maxMilliseconds: Math.max(...wallClockMeasurements),
            meanMilliseconds:
                safeDivide(totalWallClock, wallClockMeasurements.length) ?? 0,
            medianMilliseconds: calculateMedian(wallClockMeasurements),
            minMilliseconds: Math.min(...wallClockMeasurements),
        },
        warmupIterations,
    };
};

/**
 * Print a compact benchmark summary table.
 *
 * @param {readonly ScenarioResult[]} scenarioResults - Scenario results.
 */
const printSummaryTable = (scenarioResults) => {
    const tableRows = scenarioResults.map((result) => ({
        "Mean (ms)": result.wallClock.meanMilliseconds.toFixed(2),
        Messages: result.messageCount,
        Scenario: result.name,
        "Std shape": result.fix ? "fix=true" : "fix=false",
    }));

    console.log(pc.bold("\nBenchmark summary:"));
    console.table(tableRows);
};

const iterations = parseIntegerArgument("iterations", defaultIterations);
const warmupIterations = parseIntegerArgument(
    "warmup",
    defaultWarmupIterations
);

/** @type {ScenarioResult[]} */
const scenarioResults = [];

console.log(pc.cyan("Running ESLint benchmark scenarios..."));
console.log(pc.dim(`Repository root: ${repositoryRoot}`));
console.log(pc.dim(`Iterations: ${iterations}, Warmup: ${warmupIterations}`));

for (const scenario of benchmarkScenarios) {
    console.log(pc.bold(`\n• ${scenario.name}`));

    const scenarioResult = await runScenario(scenario, {
        iterations,
        warmupIterations,
    });

    scenarioResults.push(scenarioResult);

    console.log(
        pc.green(
            `  mean=${scenarioResult.wallClock.meanMilliseconds.toFixed(2)}ms, messages=${scenarioResult.messageCount}`
        )
    );
}

const benchmarkReport = {
    generatedAt: new Date().toISOString(),
    iterations,
    scenarios: scenarioResults,
    warmupIterations,
};

const benchmarkOutputDirectory = path.resolve(
    repositoryRoot,
    "coverage/benchmarks"
);
const benchmarkOutputPath = path.resolve(
    benchmarkOutputDirectory,
    "eslint-stats.json"
);

await mkdir(benchmarkOutputDirectory, { recursive: true });
await writeFile(benchmarkOutputPath, JSON.stringify(benchmarkReport, null, 2));

printSummaryTable(scenarioResults);

console.log(pc.bold(`\nWrote benchmark report to ${benchmarkOutputPath}`));
