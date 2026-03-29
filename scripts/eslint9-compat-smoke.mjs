import process from "node:process";

import tsParser from "@typescript-eslint/parser";
import { ESLint } from "eslint";
import pc from "picocolors";

import plugin from "../plugin.mjs";

const expectedEslintMajorArgumentPrefix = "--expect-eslint-major=";

/**
 * @param {readonly string[]} argv
 *
 * @returns {number | undefined}
 */
const parseExpectedEslintMajor = (argv) => {
    const argument = argv.find((value) =>
        value.startsWith(expectedEslintMajorArgumentPrefix)
    );

    if (argument === undefined) {
        return undefined;
    }

    const value = argument.slice(expectedEslintMajorArgumentPrefix.length);

    if (value.length === 0) {
        throw new Error(
            `Missing value for ${expectedEslintMajorArgumentPrefix}`
        );
    }

    const expectedMajor = Number.parseInt(value, 10);

    if (Number.isNaN(expectedMajor)) {
        throw new TypeError(`Invalid ESLint major value: ${value}`);
    }

    return expectedMajor;
};

/**
 * @param {number | undefined} expectedMajor
 */
const assertEslintMajor = (expectedMajor) => {
    const runtimeVersion = ESLint.version;
    const [runtimeMajorText] = runtimeVersion.split(".", 1);

    if (runtimeMajorText === undefined) {
        throw new Error(`Unable to parse ESLint version: ${runtimeVersion}`);
    }

    const runtimeMajor = Number.parseInt(runtimeMajorText, 10);

    if (Number.isNaN(runtimeMajor)) {
        throw new Error(`Unable to parse ESLint version: ${runtimeVersion}`);
    }

    if (expectedMajor !== undefined && runtimeMajor !== expectedMajor) {
        throw new Error(
            `Expected ESLint major ${expectedMajor}, but found ${runtimeVersion}.`
        );
    }
};

/** @type {import("eslint").Linter.Config[]} */
const compatibilityConfig = [
    {
        files: ["**/*.{ts,tsx,mts,cts}"],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: "latest",
                sourceType: "module",
            },
        },
        plugins: {
            typedoc: plugin,
        },
        rules: /** @type {import("eslint").Linter.RulesRecord} */ ({
            "typedoc/no-typedoc-tag-alias": "error",
        }),
    },
];

const sampleCode = `/**
 * @return Normalized value.
 */
export function normalize(value: string): string {
    return value.trim();
}`;

const runCompatibilitySmoke = async () => {
    const expectedMajor = parseExpectedEslintMajor(process.argv.slice(2));
    assertEslintMajor(expectedMajor);

    console.log(pc.bold(pc.cyan("Running ESLint compatibility smoke test...")));

    const lintPass = new ESLint({
        ignore: false,
        overrideConfig: compatibilityConfig,
        overrideConfigFile: true,
    });
    const lintResults = await lintPass.lintText(sampleCode, {
        filePath: "compat-smoke.ts",
    });
    const lintMessages = lintResults.flatMap((result) => result.messages);

    if (lintMessages.length === 0) {
        throw new Error(
            "Expected at least one lint message from compatibility test."
        );
    }

    const fixPass = new ESLint({
        fix: true,
        ignore: false,
        overrideConfig: compatibilityConfig,
        overrideConfigFile: true,
    });
    const fixResults = await fixPass.lintText(sampleCode, {
        filePath: "compat-smoke.ts",
    });
    const fixedOutput = fixResults[0]?.output;

    if (typeof fixedOutput !== "string" || !fixedOutput.includes("@returns")) {
        throw new Error(
            "Compatibility autofix test failed: expected output to include '@returns'."
        );
    }

    console.log(pc.bold(pc.green("ESLint compatibility smoke checks passed.")));
};

runCompatibilitySmoke().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
});
