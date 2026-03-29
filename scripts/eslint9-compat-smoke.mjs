import { existsSync } from "node:fs";
import * as path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import tsParser from "@typescript-eslint/parser";
import { ESLint } from "eslint";
import pc from "picocolors";

import plugin from "../plugin.mjs";

/**
 * @typedef {Readonly<{
 *     expectedMaximumMessages?: number;
 *     expectedMinimumMessages: number;
 *     expectedOutputIncludes?: readonly string[];
 *     fix: boolean;
 *     fixturePath: string;
 *     name: string;
 *     ruleId: string;
 *     typed: boolean;
 * }>} Scenario
 */

/**
 * @typedef {Record<string, unknown>} UnknownRecord
 */

const scriptsDirectoryPath = fileURLToPath(new URL(".", import.meta.url));
const repositoryRootPath = path.resolve(scriptsDirectoryPath, "..");
const typedFixturePath = path.resolve(
    repositoryRootPath,
    "test/fixtures/typed/prefer-ts-extras-safe-cast-to.invalid.ts"
);
const arrayableFixturePath = path.resolve(
    repositoryRootPath,
    "test/fixtures/typed/prefer-type-fest-arrayable.invalid.ts"
);

const expectedEslintMajorArgumentPrefix = "--expect-eslint-major=";

/**
 * @param {string} filePath
 *
 * @returns {string}
 */
const toPosixPath = (filePath) => filePath.replaceAll("\\", "/");

/**
 * @param {unknown} value
 *
 * @returns {readonly string[]}
 */
const collectStringEntries = (value) => {
    if (!Array.isArray(value)) {
        return [];
    }

    return value.filter((entry) => typeof entry === "string");
};

/**
 * @param {unknown} value
 *
 * @returns {value is UnknownRecord}
 */
const isUnknownRecord = (value) =>
    typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * @param {readonly string[]} argv
 *
 * @returns {number | undefined}
 */
const parseExpectedEslintMajor = (argv) => {
    const matchingArgument = argv.find((argument) =>
        argument.startsWith(expectedEslintMajorArgumentPrefix)
    );

    if (matchingArgument === undefined) {
        return undefined;
    }

    const majorString = matchingArgument.slice(
        expectedEslintMajorArgumentPrefix.length
    );

    if (majorString.length === 0) {
        throw new Error(
            `Missing ESLint major value in argument: ${matchingArgument}`
        );
    }

    const majorValue = Number.parseInt(majorString, 10);

    if (Number.isNaN(majorValue)) {
        throw new Error(
            `Invalid ESLint major value in argument: ${matchingArgument}`
        );
    }

    return majorValue;
};

/**
 * @param {number | undefined} expectedMajor
 */
const assertEslintMajor = (expectedMajor) => {
    const runtimeVersion = ESLint.version;

    if (typeof runtimeVersion !== "string" || runtimeVersion.length === 0) {
        throw new Error(
            `Unable to determine ESLint runtime version: ${String(runtimeVersion)}`
        );
    }

    const [runtimeMajorText] = runtimeVersion.split(".", 1);

    if (runtimeMajorText === undefined || runtimeMajorText.length === 0) {
        throw new Error(
            `Unable to parse ESLint runtime version: ${runtimeVersion}`
        );
    }

    const runtimeMajor = Number.parseInt(runtimeMajorText, 10);

    if (Number.isNaN(runtimeMajor)) {
        throw new Error(
            `Unable to parse ESLint runtime version: ${runtimeVersion}`
        );
    }

    if (expectedMajor !== undefined && runtimeMajor !== expectedMajor) {
        throw new Error(
            `Expected ESLint major ${expectedMajor}, but detected ${runtimeVersion}.`
        );
    }

    console.log(
        `${pc.green("✓")}` +
            ` ESLint runtime ${pc.bold(runtimeVersion)} detected for compatibility smoke checks.`
    );
};

/**
 * @param {string} fixturePath
 */
const assertFixtureExists = (fixturePath) => {
    if (!existsSync(fixturePath)) {
        throw new Error(`Missing fixture file: ${fixturePath}`);
    }
};

/**
 * @param {string} ruleId
 * @param {boolean} typed
 * @param {string} fixturePath
 *
 * @returns {import("eslint").Linter.Config[]}
 */
const createCompatibilityConfig = (ruleId, typed, fixturePath) => {
    const recommendedConfig = plugin.configs?.["recommended"];
    if (!isUnknownRecord(recommendedConfig)) {
        throw new Error(
            "Plugin recommended config is unavailable. Compatibility smoke test cannot continue."
        );
    }

    const baseLanguageOptions = isUnknownRecord(
        recommendedConfig["languageOptions"]
    )
        ? recommendedConfig["languageOptions"]
        : {};

    const baseParserOptions = isUnknownRecord(
        baseLanguageOptions["parserOptions"]
    )
        ? baseLanguageOptions["parserOptions"]
        : {};
    const baseProjectServiceOptions = isUnknownRecord(
        baseParserOptions["projectService"]
    )
        ? baseParserOptions["projectService"]
        : {};
    const relativeFixturePath = toPosixPath(
        path.relative(repositoryRootPath, fixturePath)
    );
    const existingAllowDefaultProject = collectStringEntries(
        baseProjectServiceOptions["allowDefaultProject"]
    );

    return [
        {
            ...recommendedConfig,
            files: ["**/*.{ts,tsx,mts,cts}"],
            languageOptions: {
                ...baseLanguageOptions,
                parser: tsParser,
                parserOptions: {
                    ...baseParserOptions,
                    ecmaVersion: "latest",
                    sourceType: "module",
                    tsconfigRootDir: repositoryRootPath,
                    ...(typed
                        ? {
                              projectService: {
                                  ...baseProjectServiceOptions,
                                  allowDefaultProject: [
                                      ...new Set([
                                          ...existingAllowDefaultProject,
                                          relativeFixturePath,
                                      ]),
                                  ],
                                  defaultProject: "tsconfig.eslint.json",
                              },
                          }
                        : {}),
                },
            },
            name: `compat-smoke:${ruleId}`,
            plugins: {
                typefest: plugin,
            },
            rules: {
                [ruleId]: "error",
            },
        },
    ];
};

/**
 * @param {Scenario} scenario
 */
const runScenario = async ({
    expectedMaximumMessages,
    expectedMinimumMessages,
    expectedOutputIncludes,
    fix,
    fixturePath,
    name,
    ruleId,
    typed,
}) => {
    const eslint = new ESLint({
        cwd: repositoryRootPath,
        fix,
        ignore: false,
        overrideConfig: createCompatibilityConfig(ruleId, typed, fixturePath),
        overrideConfigFile: true,
    });

    const lintResults = await eslint.lintFiles([fixturePath]);

    const fatalMessages = lintResults.flatMap((result) =>
        result.messages.filter((message) => message.fatal === true)
    );

    if (fatalMessages.length > 0) {
        throw new Error(
            `${name}: encountered fatal parse/runtime diagnostics (${fatalMessages.length}).`
        );
    }

    const matchingMessages = lintResults.flatMap((result) =>
        result.messages.filter((message) => message.ruleId === ruleId)
    );

    if (matchingMessages.length < expectedMinimumMessages) {
        throw new Error(
            `${name}: expected at least ${expectedMinimumMessages} ${ruleId} message(s), received ${matchingMessages.length}.`
        );
    }

    if (
        expectedMaximumMessages !== undefined &&
        matchingMessages.length > expectedMaximumMessages
    ) {
        throw new Error(
            `${name}: expected at most ${expectedMaximumMessages} ${ruleId} message(s), received ${matchingMessages.length}.`
        );
    }

    if (fix) {
        const fixedOutputs = lintResults
            .map((result) => result.output)
            .filter((output) => typeof output === "string");

        if (fixedOutputs.length === 0) {
            throw new Error(
                `${name}: expected at least one fixed output when fix=true.`
            );
        }

        const combinedOutput = fixedOutputs.join("\n");
        for (const expectedOutputSnippet of expectedOutputIncludes ?? []) {
            if (!combinedOutput.includes(expectedOutputSnippet)) {
                throw new Error(
                    `${name}: expected fixed output to include \"${expectedOutputSnippet}\".`
                );
            }
        }
    }

    console.log(
        `${pc.green("✓")}` +
            ` ${pc.bold(name)} ${pc.gray("->")} ${pc.bold(ruleId)} (${typed ? "typed" : "non-typed"}, fix=${fix}) produced ${pc.magenta(
                String(matchingMessages.length)
            )} message(s).`
    );
};

const scenarios = /** @type {const} */ ([
    {
        expectedMinimumMessages: 1,
        fix: false,
        fixturePath: typedFixturePath,
        name: "typed-detection",
        ruleId: "typefest/prefer-ts-extras-safe-cast-to",
        typed: true,
    },
    {
        expectedMaximumMessages: 0,
        expectedMinimumMessages: 0,
        expectedOutputIncludes: ["safeCastTo<"],
        fix: true,
        fixturePath: typedFixturePath,
        name: "typed-autofix",
        ruleId: "typefest/prefer-ts-extras-safe-cast-to",
        typed: true,
    },
    {
        expectedMinimumMessages: 1,
        fix: false,
        fixturePath: arrayableFixturePath,
        name: "non-typed-detection",
        ruleId: "typefest/prefer-type-fest-arrayable",
        typed: false,
    },
]);

for (const scenario of scenarios) {
    assertFixtureExists(scenario.fixturePath);
}

console.log(pc.bold(pc.cyan("Running ESLint 9 compatibility smoke checks...")));

const expectedEslintMajor = parseExpectedEslintMajor(process.argv.slice(2));
assertEslintMajor(expectedEslintMajor);

for (const scenario of scenarios) {
    await runScenario(scenario);
}

console.log(pc.bold(pc.green("ESLint 9 compatibility smoke checks passed.")));
