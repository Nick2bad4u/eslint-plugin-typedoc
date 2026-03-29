import {
    createTypedocFlatConfig,
    typedocRuleSets,
} from "./eslint-benchmark-config.mjs";

/**
 * Benchmark-oriented ESLint flat config for CLI TIMING/--stats runs.
 *
 * @type {import("eslint").Linter.Config[]}
 */
const benchmarkTimingConfig = createTypedocFlatConfig({
    rules: typedocRuleSets.recommended,
});

export default benchmarkTimingConfig;
