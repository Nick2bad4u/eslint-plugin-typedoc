// @ts-check
const processEnvironment = globalThis.process.env;
const isCI = (processEnvironment["CI"] ?? "").toLowerCase() === "true";

/** @type {import("@stryker-mutator/api/core").PartialStrykerOptions} */
const config = {
    allowConsoleColors: true,
    allowEmpty: false,
    checkers: ["typescript"],
    cleanTempDir: true,
    clearTextReporter: {
        allowColor: true,
        allowColors: true,
        allowEmojis: true,
        logTests: true,
        maxTestsToLog: 9999,
        reportMutants: true,
        reportScoreTable: true,
        reportTests: false,
        skipFull: false,
    },
    concurrency: isCI ? 2 : 12,
    coverageAnalysis: "perTest",
    dashboard: {
        baseUrl: "https://dashboard.stryker-mutator.io/api/reports",
        project: "github.com/Nick2bad4u/eslint-plugin-typefest",
        reportType:
            /** @type {import("@stryker-mutator/api/core").ReportType} */ (
                "full"
            ),
        version: "main",
    },
    disableTypeChecks: false,
    eventReporter: {
        baseDir: "coverage/stryker-events",
    },
    htmlReporter: {
        fileName: "coverage/stryker.html",
    },
    ignorers: ["console-all"],
    // Fast default: static mutants are disproportionately expensive in this repository.
    // Use `npm run test:stryker:full` (or `test:stryker:full:ci`) for periodic full audits.
    ignoreStatic: false,
    incremental: true,
    incrementalFile: ".cache/stryker/incremental-full.json",
    jsonReporter: {
        fileName: "coverage/stryker.json",
    },
    maxTestRunnerReuse: 0,
    mutate: [
        "src/**/*.ts",
        "src/**/*.mjs",
        "src/**/*.js",
        "!src/**/*.*.ts",
    ],
    packageManager: "npm",
    plugins: ["@stryker-mutator/*", "@stryker-ignorer/*"],
    reporters: [
        "clear-text",
        "html",
        "json",
        "dashboard",
        "progress",
    ],
    symlinkNodeModules: true,
    testRunner: "vitest",
    thresholds: {
        break: 65,
        high: 85,
        low: 75,
    },
    timeoutFactor: 1.25,
    timeoutMS: 60_000,
    tsconfigFile: "tsconfig.build.json",
    typescriptChecker: {
        prioritizePerformanceOverAccuracy: true,
    },
    vitest: {
        configFile: "./vitest.stryker.config.ts",
        related: false,
    },
    warnings: {
        preprocessorErrors: true,
        slow: true,
        unknownOptions: true,
        unserializableOptions: true,
    },
};

export default config;
