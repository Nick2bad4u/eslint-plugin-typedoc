import { ESLint } from "eslint";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import * as path from "node:path";
import { performance } from "node:perf_hooks";
import pc from "picocolors";

import {
    benchmarkFileGlobs,
    createTypefestFlatConfig,
    repositoryRoot,
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
 *     maximumMessageCount?: number;
 *     minimumMessageCount?: number;
 *     name: string;
 *     rules: BenchmarkRules;
 * }>} BenchmarkScenario
 */

/**
 * @typedef {Readonly<{
 *     filePatterns: readonly string[];
 *     fix: boolean;
 *     iterations: number;
 *     maximumMessageCount: number;
 *     minimumMessageCount: number;
 *     name: string;
 *     rules: BenchmarkRules;
 *     warmupIterations: number;
 * }>} RunScenarioOptions
 */

/**
 * @typedef {{ ruleName: string; totalMilliseconds: number }} RuleTiming
 */

/**
 * @typedef {{
 *     fixMs: number;
 *     meanMs: number;
 *     medianMs: number;
 *     messages: number;
 *     parseMs: number;
 *     rulesMs: number;
 *     scenario: string;
 * }} SummaryRow
 */

/**
 * @typedef {{
 *     fixMs: number;
 *     meanDeltaMs: number;
 *     meanDeltaPct: number | "n/a";
 *     messagesDelta: number;
 *     parseMs: number;
 *     rulesMs: number;
 *     scenario: string;
 * }} ComparisonRow
 */

/**
 * @typedef {{
 *     generatedAt: string;
 *     iterations: number;
 *     scenarios: ScenarioResult[];
 *     warmupIterations: number;
 * }} BenchmarkReport
 */

/**
 * @typedef {{
 *     fixMilliseconds: number;
 *     parseMilliseconds: number;
 *     ruleMilliseconds: number;
 * }} TimingBreakdown
 */

/**
 * @typedef {{
 *     filePatterns: string[];
 *     fix: boolean;
 *     fixMilliseconds: number;
 *     iterations: number;
 *     messageCount: number;
 *     name: string;
 *     parseMilliseconds: number;
 *     ruleMilliseconds: number;
 *     topRules: RuleTiming[];
 *     wallClock: {
 *         maxMilliseconds: number;
 *         meanMilliseconds: number;
 *         medianMilliseconds: number;
 *         minMilliseconds: number;
 *     };
 *     warmupIterations: number;
 * }} ScenarioResult
 */

const defaultIterations = 3;
const defaultMaximumMessageCount = Number.POSITIVE_INFINITY;
const defaultWarmupIterations = 1;
const defaultMinimumMessageCount = 1;

const singleRuleSafeCastToBenchmarkRules = Object.freeze({
    "typefest/prefer-ts-extras-safe-cast-to": "error",
});

const singleRuleSetHasBenchmarkRules = Object.freeze({
    "typefest/prefer-ts-extras-set-has": "error",
});

const singleRuleStringSplitBenchmarkRules = Object.freeze({
    "typefest/prefer-ts-extras-string-split": "error",
});

/**
 * Ensure a value is a readonly array of strings.
 *
 * @param {unknown} value - Value to validate.
 * @param {string} label - Error label for diagnostics.
 *
 * @returns {readonly string[]} Normalized readonly string array.
 */
const ensureStringArray = (value, label) => {
    if (!Array.isArray(value)) {
        throw new TypeError(`${label} must be a readonly string array.`);
    }

    /** @type {string[]} */
    const normalizedValues = [];
    for (const entry of value) {
        if (typeof entry !== "string") {
            throw new TypeError(`${label} must be a readonly string array.`);
        }

        normalizedValues.push(entry);
    }

    return normalizedValues;
};

const typedValidFixtureGlobs = ensureStringArray(
    benchmarkFileGlobs.typedValidFixtures,
    "benchmarkFileGlobs.typedValidFixtures"
);
const recommendedZeroMessageFixtureGlobs = ensureStringArray(
    benchmarkFileGlobs.recommendedZeroMessageFixture,
    "benchmarkFileGlobs.recommendedZeroMessageFixture"
);
const safeCastToStressFixtureGlobs = ensureStringArray(
    benchmarkFileGlobs.safeCastToStressFixture,
    "benchmarkFileGlobs.safeCastToStressFixture"
);
const setHasStressFixtureGlobs = ensureStringArray(
    benchmarkFileGlobs.setHasStressFixture,
    "benchmarkFileGlobs.setHasStressFixture"
);
const stringSplitStressFixtureGlobs = ensureStringArray(
    benchmarkFileGlobs.stringSplitStressFixture,
    "benchmarkFileGlobs.stringSplitStressFixture"
);

/** @type {readonly BenchmarkScenario[]} */
const benchmarkScenarios = Object.freeze([
    {
        filePatterns: benchmarkFileGlobs.typedInvalidFixtures,
        fix: false,
        name: "recommended-invalid-corpus",
        rules: typefestRuleSets.recommended,
    },
    {
        filePatterns: typedValidFixtureGlobs,
        fix: false,
        minimumMessageCount: 0,
        name: "recommended-valid-corpus",
        rules: typefestRuleSets.recommended,
    },
    {
        filePatterns: recommendedZeroMessageFixtureGlobs,
        fix: false,
        maximumMessageCount: 0,
        minimumMessageCount: 0,
        name: "recommended-zero-message-corpus",
        rules: typefestRuleSets.recommended,
    },
    {
        filePatterns: benchmarkFileGlobs.typedInvalidFixtures,
        fix: false,
        name: "strict-invalid-corpus",
        rules: typefestRuleSets.strict,
    },
    {
        filePatterns: benchmarkFileGlobs.tsExtrasInvalidFixtures,
        fix: false,
        name: "ts-extras-type-guards-invalid-corpus",
        rules: typefestRuleSets.tsExtrasTypeGuards,
    },
    {
        filePatterns: benchmarkFileGlobs.typeFestInvalidFixtures,
        fix: false,
        name: "type-fest-types-invalid-corpus",
        rules: typefestRuleSets.typeFestTypes,
    },
    {
        filePatterns: benchmarkFileGlobs.tsExtrasInvalidFixtures,
        fix: true,
        name: "recommended-fix-on-ts-extras-invalid-corpus",
        rules: typefestRuleSets.recommended,
    },
    {
        filePatterns: safeCastToStressFixtureGlobs,
        fix: false,
        name: "single-rule-safe-cast-to-stress",
        rules: singleRuleSafeCastToBenchmarkRules,
    },
    {
        filePatterns: safeCastToStressFixtureGlobs,
        fix: true,
        maximumMessageCount: 0,
        minimumMessageCount: 0,
        name: "single-rule-safe-cast-to-stress-fix",
        rules: singleRuleSafeCastToBenchmarkRules,
    },
    {
        filePatterns: setHasStressFixtureGlobs,
        fix: false,
        name: "single-rule-set-has-stress",
        rules: singleRuleSetHasBenchmarkRules,
    },
    {
        filePatterns: stringSplitStressFixtureGlobs,
        fix: false,
        name: "single-rule-string-split-stress",
        rules: singleRuleStringSplitBenchmarkRules,
    },
]);

/**
 * Parse an integer argument in `--key=value` form.
 *
 * @param {string} key - CLI key without the leading dashes.
 * @param {number} fallbackValue - Value used when key is not provided.
 *
 * @returns {number} Parsed positive integer.
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
 * Parse a string argument in `--key=value` form.
 *
 * @param {string} key - CLI key without the leading dashes.
 *
 * @returns {string | undefined} Parsed string when provided.
 */
const parseStringArgument = (key) => {
    const matchingArgument = process.argv.find((argument) =>
        argument.startsWith(`--${key}=`)
    );
    if (matchingArgument === undefined) {
        return undefined;
    }

    const [, rawValue = ""] = matchingArgument.split("=");
    if (rawValue.length === 0) {
        throw new TypeError(
            `Expected --${key}=<value>; received an empty value.`
        );
    }

    return rawValue;
};

/**
 * Build an ESLint instance for benchmark scenarios.
 *
 * @param {{ fix: boolean; rules: BenchmarkRules }} options - ESLint benchmark
 *   options.
 *
 * @returns {ESLint} Configured ESLint instance.
 */
const createBenchmarkEslint = ({ fix, rules }) =>
    new ESLint({
        cache: false,
        fix,
        overrideConfig: createTypefestFlatConfig({ rules }),
        overrideConfigFile: true,
        stats: true,
    });

/**
 * Narrow unknown values to object records.
 *
 * @param {unknown} value - Value to inspect.
 *
 * @returns {value is Record<string, unknown>} Whether value is object-like.
 */
const isObjectRecord = (value) => typeof value === "object" && value !== null;

/**
 * Extract lint passes from ESLint result stats.
 *
 * @param {LintResult} lintResult - ESLint lint result.
 *
 * @returns {readonly unknown[]} ESLint pass payloads.
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
 * Normalize timing payloads to milliseconds.
 *
 * @param {unknown} timingPayload - Arbitrary timing payload.
 *
 * @returns {number} Timing total in milliseconds.
 */
const getTimingTotalMilliseconds = (timingPayload) => {
    if (!isObjectRecord(timingPayload)) {
        return 0;
    }

    const total = timingPayload["total"];
    return typeof total === "number" ? total : 0;
};

/**
 * Extract a phase timing (`parse`, `fix`) from a lint pass.
 *
 * @param {unknown} pass - ESLint pass payload.
 * @param {"fix" | "parse"} phaseName - Pass phase field name.
 *
 * @returns {number} Phase timing in milliseconds.
 */
const getPassPhaseTimingMilliseconds = (pass, phaseName) => {
    if (!isObjectRecord(pass)) {
        return 0;
    }

    return getTimingTotalMilliseconds(pass[phaseName]);
};

/**
 * Extract pass rule timing record.
 *
 * @param {unknown} pass - ESLint pass payload.
 *
 * @returns {null | Record<string, unknown>} Rule timing map when available.
 */
const getPassRules = (pass) => {
    if (!isObjectRecord(pass)) {
        return null;
    }

    const rules = pass["rules"];
    return isObjectRecord(rules) ? rules : null;
};

/**
 * Resolve a potentially relative path from the repository root.
 *
 * @param {string} filePath - Candidate path from CLI.
 *
 * @returns {string} Absolute file path.
 */
const resolvePath = (filePath) =>
    path.isAbsolute(filePath)
        ? filePath
        : path.resolve(repositoryRoot, filePath);

/**
 * Read a named string property from an object record.
 *
 * @param {Record<string, unknown>} record - Source record.
 * @param {string} key - Property key.
 * @param {string} context - Error context.
 *
 * @returns {string} String property value.
 */
const readRequiredString = (record, key, context) => {
    const value = record[key];
    if (typeof value !== "string") {
        throw new TypeError(`${context}: expected '${key}' to be a string.`);
    }

    return value;
};

/**
 * Read a named number property from an object record.
 *
 * @param {Record<string, unknown>} record - Source record.
 * @param {string} key - Property key.
 * @param {string} context - Error context.
 *
 * @returns {number} Numeric property value.
 */
const readRequiredNumber = (record, key, context) => {
    const value = record[key];
    if (typeof value !== "number" || !Number.isFinite(value)) {
        throw new TypeError(
            `${context}: expected '${key}' to be a finite number.`
        );
    }

    return value;
};

/**
 * Parse an unknown scenario payload into a comparable shape.
 *
 * @param {unknown} scenario - Scenario payload from JSON.
 * @param {number} index - Scenario index in source file.
 * @param {string} comparePath - Compare file path for diagnostics.
 *
 * @returns {{
 *     fixMs: number;
 *     meanMs: number;
 *     messages: number;
 *     parseMs: number;
 *     rulesMs: number;
 *     scenario: string;
 * }}
 *   Comparable scenario summary.
 */
const parseComparableScenario = (scenario, index, comparePath) => {
    const scenarioContext = `${comparePath}: scenarios[${index}]`;
    if (!isObjectRecord(scenario)) {
        throw new TypeError(`${scenarioContext} must be an object.`);
    }

    const wallClock = scenario["wallClock"];
    if (!isObjectRecord(wallClock)) {
        throw new TypeError(`${scenarioContext}.wallClock must be an object.`);
    }

    return {
        fixMs: readRequiredNumber(scenario, "fixMilliseconds", scenarioContext),
        meanMs: readRequiredNumber(
            wallClock,
            "meanMilliseconds",
            `${scenarioContext}.wallClock`
        ),
        messages: readRequiredNumber(scenario, "messageCount", scenarioContext),
        parseMs: readRequiredNumber(
            scenario,
            "parseMilliseconds",
            scenarioContext
        ),
        rulesMs: readRequiredNumber(
            scenario,
            "ruleMilliseconds",
            scenarioContext
        ),
        scenario: readRequiredString(scenario, "name", scenarioContext),
    };
};

/**
 * Load a benchmark report for comparison.
 *
 * @param {string} comparePath - Baseline benchmark report path.
 *
 * @returns {Promise<null | Map<
 *     string,
 *     ReturnType<typeof parseComparableScenario>
 * >>}
 *   Scenario summary map keyed by scenario name, or null when the file does not
 *   exist.
 */
const loadComparisonScenarioMap = async (comparePath) => {
    try {
        const source = await readFile(comparePath, "utf8");
        /** @type {unknown} */
        const parsedJson = JSON.parse(source);

        if (!isObjectRecord(parsedJson)) {
            throw new TypeError(`${comparePath}: expected a JSON object.`);
        }

        const scenarios = parsedJson["scenarios"];
        if (!Array.isArray(scenarios)) {
            throw new TypeError(`${comparePath}: missing 'scenarios' array.`);
        }

        const comparableScenarios = scenarios.map((scenario, index) =>
            parseComparableScenario(scenario, index, comparePath)
        );
        return new Map(
            comparableScenarios.map((scenario) => [scenario.scenario, scenario])
        );
    } catch (error) {
        if (
            error instanceof Error &&
            "code" in error &&
            error.code === "ENOENT"
        ) {
            return null;
        }

        throw error;
    }
};

/**
 * Sum numeric samples.
 */
const runtimeMath =
    /** @type {Math & { sumPrecise: (items: Iterable<number>) => number }} */ (
        Math
    );

/**
 * Whether the current runtime provides `Math.sumPrecise`.
 */
const supportsMathSumPrecise = typeof runtimeMath.sumPrecise === "function";

/**
 * Sum numeric samples.
 *
 * @param {readonly number[]} values - Numeric samples.
 *
 * @returns {number} Sum of all values.
 */
const sum = (values) => {
    if (values.length === 0) {
        return 0;
    }

    if (supportsMathSumPrecise) {
        return runtimeMath.sumPrecise(values);
    }

    let compensation = 0;
    let runningTotal = 0;

    for (const value of values) {
        const adjustedValue = value - compensation;
        const nextTotal = runningTotal + adjustedValue;
        compensation = nextTotal - runningTotal - adjustedValue;
        runningTotal = nextTotal;
    }

    return runningTotal;
};

/**
 * Safely divide two numbers and return `undefined` when denominator is zero.
 *
 * @param {number} numerator - Numerator.
 * @param {number} denominator - Denominator.
 *
 * @returns {number | undefined} Quotient when denominator is non-zero.
 */
const divide = (numerator, denominator) =>
    // eslint-disable-next-line total-functions/no-partial-division -- Guard above guarantees denominator is non-zero on this branch.
    denominator === 0 ? undefined : numerator / denominator;

/**
 * Sort values without mutating native prototype methods like `.sort()`.
 *
 * @template T
 *
 * @param {readonly T[]} values - Values to sort.
 * @param {(left: T, right: T) => number} compare - Comparator callback.
 *
 * @returns {T[]} New sorted array.
 */
const sortValues = (values, compare) => {
    const sortedValues = [...values];

    for (
        let currentIndex = 1;
        currentIndex < sortedValues.length;
        currentIndex += 1
    ) {
        const currentValue = sortedValues[currentIndex];
        if (currentValue !== undefined) {
            let scanIndex = currentIndex - 1;

            while (scanIndex >= 0) {
                const scanValue = sortedValues[scanIndex];
                if (scanValue === undefined) {
                    break;
                }

                if (compare(scanValue, currentValue) <= 0) {
                    break;
                }

                sortedValues[scanIndex + 1] = scanValue;
                scanIndex -= 1;
            }

            sortedValues[scanIndex + 1] = currentValue;
        }
    }

    return sortedValues;
};

/**
 * Accumulate a single rule timing into a totals map.
 *
 * @param {Map<string, number>} ruleTotals - Existing totals map.
 * @param {string} ruleName - Rule identifier.
 * @param {number} ruleTotal - Rule timing to add.
 */
const addRuleTiming = (ruleTotals, ruleName, ruleTotal) => {
    const currentTotal = ruleTotals.get(ruleName) ?? 0;
    ruleTotals.set(ruleName, currentTotal + ruleTotal);
};

/**
 * Build summary rows for console output.
 *
 * @param {readonly ScenarioResult[]} scenarios - Scenario results.
 *
 * @returns {SummaryRow[]} Console table summary rows.
 */
const toSummaryRows = (scenarios) =>
    scenarios.map((scenarioResult) => ({
        fixMs: Number(scenarioResult.fixMilliseconds.toFixed(2)),
        meanMs: Number(scenarioResult.wallClock.meanMilliseconds.toFixed(2)),
        medianMs: Number(
            scenarioResult.wallClock.medianMilliseconds.toFixed(2)
        ),
        messages: scenarioResult.messageCount,
        parseMs: Number(scenarioResult.parseMilliseconds.toFixed(2)),
        rulesMs: Number(scenarioResult.ruleMilliseconds.toFixed(2)),
        scenario: scenarioResult.name,
    }));

/**
 * Build comparison rows against a baseline map.
 *
 * @param {readonly ScenarioResult[]} scenarios - Current scenario results.
 * @param {Map<string, ReturnType<typeof parseComparableScenario>>} baselineMap
 *   - Baseline scenario map by name.
 *
 * @returns {ComparisonRow[]} Rows with delta metrics.
 */
const toComparisonRows = (scenarios, baselineMap) => {
    /** @type {ComparisonRow[]} */
    const comparisonRows = [];

    for (const scenarioResult of scenarios) {
        const baseline = baselineMap.get(scenarioResult.name);
        if (baseline !== undefined) {
            const currentMeanMs = scenarioResult.wallClock.meanMilliseconds;
            const meanDeltaMs = currentMeanMs - baseline.meanMs;
            const meanDeltaRatio = divide(meanDeltaMs, baseline.meanMs);
            /** @type {number | "n/a"} */
            const meanDeltaPct =
                meanDeltaRatio === undefined
                    ? "n/a"
                    : Number((meanDeltaRatio * 100).toFixed(2));

            comparisonRows.push({
                fixMs: Number(
                    (scenarioResult.fixMilliseconds - baseline.fixMs).toFixed(2)
                ),
                meanDeltaMs: Number(meanDeltaMs.toFixed(2)),
                meanDeltaPct,
                messagesDelta: scenarioResult.messageCount - baseline.messages,
                parseMs: Number(
                    (
                        scenarioResult.parseMilliseconds - baseline.parseMs
                    ).toFixed(2)
                ),
                rulesMs: Number(
                    (
                        scenarioResult.ruleMilliseconds - baseline.rulesMs
                    ).toFixed(2)
                ),
                scenario: scenarioResult.name,
            });
        }
    }

    return comparisonRows;
};

/**
 * Build output payload for persistence.
 *
 * @param {readonly ScenarioResult[]} scenarios - Scenario results.
 * @param {number} iterationsCount - Measured iterations.
 * @param {number} warmupCount - Warmup iterations.
 *
 * @returns {BenchmarkReport} JSON payload written to disk.
 */
const toBenchmarkReport = (scenarios, iterationsCount, warmupCount) => ({
    generatedAt: new Date().toISOString(),
    iterations: iterationsCount,
    scenarios: [...scenarios],
    warmupIterations: warmupCount,
});

/**
 * Calculate arithmetic mean from numeric samples.
 *
 * @param {readonly number[]} values - Numeric samples.
 *
 * @returns {number} Mean value.
 */
const mean = (values) => divide(sum(values), values.length) ?? 0;

/**
 * Calculate median from numeric samples.
 *
 * @param {readonly number[]} values - Numeric samples.
 *
 * @returns {number} Median value.
 */
const median = (values) => {
    if (values.length === 0) {
        return 0;
    }

    const sortedValues = sortValues(values, (left, right) => left - right);
    const middleIndex = Math.floor(sortedValues.length / 2);

    if (sortedValues.length % 2 === 0) {
        const left = sortedValues[middleIndex - 1];
        const right = sortedValues[middleIndex];

        if (left === undefined || right === undefined) {
            return 0;
        }

        return (left + right) * 0.5;
    }

    return sortedValues[middleIndex] ?? 0;
};

/**
 * Aggregate ESLint parse/rule/fix timing from stats payload.
 *
 * @param {LintResults} lintResults - ESLint lint results.
 *
 * @returns {TimingBreakdown} Timing breakdown in milliseconds.
 */
const aggregateTimingBreakdown = (lintResults) => {
    let fixMilliseconds = 0;
    let parseMilliseconds = 0;
    let ruleMilliseconds = 0;

    for (const lintResult of lintResults) {
        for (const pass of getLintPasses(lintResult)) {
            parseMilliseconds += getPassPhaseTimingMilliseconds(pass, "parse");
            fixMilliseconds += getPassPhaseTimingMilliseconds(pass, "fix");

            const passRules = getPassRules(pass);
            if (passRules !== null) {
                for (const ruleTiming of Object.values(passRules)) {
                    ruleMilliseconds += getTimingTotalMilliseconds(ruleTiming);
                }
            }
        }
    }

    return {
        fixMilliseconds,
        parseMilliseconds,
        ruleMilliseconds,
    };
};

/**
 * Collect top rules by timing from lint results.
 *
 * @param {LintResults} lintResults - ESLint lint results.
 * @param {number} [topCount=8] - Maximum rule entries to return. Default is `8`
 *
 * @returns {RuleTiming[]} Sorted top rule timings.
 */
const collectTopRuleTimings = (lintResults, topCount = 8) => {
    /** @type {Map<string, number>} */
    const ruleTotals = new Map();

    for (const lintResult of lintResults) {
        for (const pass of getLintPasses(lintResult)) {
            const passRules = getPassRules(pass);
            if (passRules !== null) {
                for (const [ruleName, ruleTiming] of Object.entries(
                    passRules
                )) {
                    const ruleTotal = getTimingTotalMilliseconds(ruleTiming);
                    addRuleTiming(ruleTotals, ruleName, ruleTotal);
                }
            }
        }
    }

    return sortValues(
        [...ruleTotals.entries()],
        (left, right) => right[1] - left[1]
    )
        .slice(0, topCount)
        .map(([ruleName, totalMilliseconds]) => ({
            ruleName,
            totalMilliseconds,
        }));
};

/**
 * Count total lint messages across results.
 *
 * @param {LintResults} lintResults - ESLint lint results.
 *
 * @returns {number} Total lint messages.
 */
const countMessages = (lintResults) =>
    lintResults.reduce(
        (messageCount, lintResult) =>
            messageCount + lintResult.errorCount + lintResult.warningCount,
        0
    );

/**
 * Execute a benchmark scenario with warmup and measured iterations.
 *
 * @param {RunScenarioOptions} options - Scenario execution options.
 *
 * @returns {Promise<ScenarioResult>} Aggregated scenario result.
 */
const runScenario = async ({
    filePatterns,
    fix,
    iterations,
    maximumMessageCount,
    minimumMessageCount,
    name,
    rules,
    warmupIterations,
}) => {
    /** @type {number[]} */
    const measuredDurations = [];
    /** @type {LintResult[] | null} */
    let referenceLintResults = null;

    for (
        let iteration = 0;
        iteration < iterations + warmupIterations;
        iteration += 1
    ) {
        const eslint = createBenchmarkEslint({ fix, rules });
        const startedAt = performance.now();
        const lintResults = await eslint.lintFiles([...filePatterns]);
        const elapsedMilliseconds = performance.now() - startedAt;

        if (iteration >= warmupIterations) {
            measuredDurations.push(elapsedMilliseconds);
            referenceLintResults ??= lintResults;
        }
    }

    if (referenceLintResults === null) {
        throw new Error(`${name}: no measured lint results were captured.`);
    }

    const messageCount = countMessages(referenceLintResults);
    if (messageCount < minimumMessageCount) {
        throw new Error(
            `${name}: expected at least ${minimumMessageCount} lint message(s).`
        );
    }

    if (messageCount > maximumMessageCount) {
        throw new Error(
            `${name}: expected at most ${maximumMessageCount} lint message(s).`
        );
    }

    const timingBreakdown = aggregateTimingBreakdown(referenceLintResults);
    const topRules = collectTopRuleTimings(referenceLintResults);

    return {
        filePatterns: [...filePatterns],
        fix,
        iterations,
        messageCount,
        name,
        topRules,
        wallClock: {
            maxMilliseconds: Math.max(...measuredDurations),
            meanMilliseconds: mean(measuredDurations),
            medianMilliseconds: median(measuredDurations),
            minMilliseconds: Math.min(...measuredDurations),
        },
        warmupIterations,
        ...timingBreakdown,
    };
};

const iterations = parseIntegerArgument("iterations", defaultIterations);
const warmupIterations = parseIntegerArgument(
    "warmup",
    defaultWarmupIterations
);
const compareArgument = parseStringArgument("compare");

if (iterations === 0) {
    throw new TypeError("--iterations must be at least 1.");
}

/** @type {ScenarioResult[]} */
const scenarioResults = [];
for (const scenario of benchmarkScenarios) {
    const result = await runScenario({
        ...scenario,
        iterations,
        maximumMessageCount:
            scenario.maximumMessageCount ?? defaultMaximumMessageCount,
        minimumMessageCount:
            scenario.minimumMessageCount ?? defaultMinimumMessageCount,
        warmupIterations,
    });
    scenarioResults.push(result);
}

const summaryRows = toSummaryRows(scenarioResults);

console.log(`\n${pc.bold(pc.cyan("Benchmark summary"))}`);
console.table(summaryRows);
for (const scenarioResult of scenarioResults) {
    console.log(
        `\n${pc.bold(pc.cyan("Top rules by timing"))} ${pc.magenta(
            `(${scenarioResult.name})`
        )}`
    );
    console.table(
        scenarioResult.topRules.map((entry) => ({
            rule: entry.ruleName,
            totalMs: Number(entry.totalMilliseconds.toFixed(2)),
        }))
    );
}

if (compareArgument !== undefined) {
    const comparePath = resolvePath(compareArgument);
    const baselineScenarioMap = await loadComparisonScenarioMap(comparePath);
    if (baselineScenarioMap === null) {
        console.warn(
            `\n${pc.yellow("No baseline benchmark report found at")}` +
                ` ${pc.magenta(comparePath)}. ${pc.yellow(
                    "Skipping comparison."
                )}`
        );
    } else {
        const comparisonRows = toComparisonRows(
            scenarioResults,
            baselineScenarioMap
        );
        if (comparisonRows.length === 0) {
            console.warn(
                `\n${pc.yellow("No matching scenario names were found in")}` +
                    ` ${pc.magenta(comparePath)}.`
            );
        } else {
            console.log(
                `\n${pc.bold(pc.cyan("Comparison against"))} ${pc.magenta(comparePath)}`
            );
            console.table(comparisonRows);
        }
    }
}

const outputDirectory = path.join(repositoryRoot, "coverage", "benchmarks");
const outputPath = path.join(outputDirectory, "eslint-stats.json");
await mkdir(outputDirectory, { recursive: true });
const report = toBenchmarkReport(scenarioResults, iterations, warmupIterations);
await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

console.log(
    `\n${pc.green("✓ Wrote benchmark stats to")}` +
        ` ${pc.bold(pc.magenta(outputPath))}`
);
