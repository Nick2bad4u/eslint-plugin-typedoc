import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import plugin from "../dist/plugin.js";

const repositoryRoot = path.resolve(import.meta.dirname, "..");
const temporaryRoot = path.join(
    repositoryRoot,
    ".temp",
    "oxlint-compatibility-" + String(process.pid)
);
const fixturePath = path.join(temporaryRoot, "fixture.ts");
const eslintConfigPath = path.join(temporaryRoot, "eslint.config.mjs");
const oxlintConfigPath = path.join(temporaryRoot, "oxlint.json");
const eslintCliPath = path.join(
    repositoryRoot,
    "node_modules",
    "eslint",
    "bin",
    "eslint.js"
);
const oxlintPackagePath = fileURLToPath(
    import.meta.resolve("oxlint/package.json")
);
const oxlintCliPath = path.join(
    path.dirname(oxlintPackagePath),
    "bin",
    "oxlint"
);
const pluginSpecifier = "../../dist/plugin.js";
const namespace = plugin.meta.namespace;
const ruleNames = Object.keys(plugin.rules);
const configNames = Object.keys(plugin.configs);
const rules = Object.fromEntries(
    ruleNames.map((ruleName) => [namespace + "/" + ruleName, "warn"])
);
const fixture =
    "/** A sample function.\n * @param value - the input\n * @returns the input\n * @example value\n */\nexport function sample(value: string): string {\n  return value;\n}\n";

/**
 * Run a local CLI through the current Node.js executable.
 *
 * @param {string} cliPath
 * @param {readonly string[]} arguments_
 *
 * @returns {string}
 */
const runCli = (cliPath, arguments_) => {
    const result = spawnSync(process.execPath, [cliPath, ...arguments_], {
        cwd: repositoryRoot,
        encoding: "utf8",
        env: {
            ...process.env,
            NO_COLOR: "1",
        },
        shell: false,
    });

    if (result.error !== undefined) {
        throw result.error;
    }

    assert.equal(
        result.status,
        0,
        [
            "Command failed: " + cliPath + " " + arguments_.join(" "),
            result.stdout,
            result.stderr,
        ].join("\n")
    );

    return result.stdout;
};

/**
 * Normalize one runner's JSON diagnostics to the shared plugin surface.
 *
 * @param {"eslint" | "oxlint"} runner
 * @param {string} output
 *
 * @returns {readonly object[]}
 */
const normalizeDiagnostics = (runner, output) => {
    /**
     * @typedef {{
     *     code?: string;
     *     column?: number;
     *     labels?: { span?: { column?: number; line?: number } }[];
     *     line?: number;
     *     message: string;
     *     ruleId?: string;
     * }} RawDiagnostic
     */
    /**
     * @typedef {{
     *     column: number | undefined;
     *     line: number | undefined;
     *     message: string;
     *     ruleName: string;
     * }} NormalizedDiagnostic
     */

    /** @type {RawDiagnostic[]} */
    let diagnostics;
    if (runner === "eslint") {
        /** @type {{ messages?: RawDiagnostic[] }[]} */
        const parsed = JSON.parse(output);
        diagnostics = parsed[0]?.messages ?? [];
    } else {
        /** @type {{ diagnostics?: RawDiagnostic[] }} */
        const parsed = JSON.parse(output);
        diagnostics = parsed.diagnostics ?? [];
    }

    /** @type {NormalizedDiagnostic[]} */
    const normalized = [];
    for (const diagnostic of diagnostics) {
        if (runner === "eslint") {
            if (!diagnostic.ruleId?.startsWith(namespace + "/")) {
                continue;
            }

            normalized.push({
                column: diagnostic.column,
                line: diagnostic.line,
                message: diagnostic.message,
                ruleName: diagnostic.ruleId.slice(namespace.length + 1),
            });
            continue;
        }

        const prefix = namespace + "(";
        if (
            typeof diagnostic.code !== "string" ||
            !diagnostic.code.startsWith(prefix) ||
            !diagnostic.code.endsWith(")")
        ) {
            continue;
        }

        normalized.push({
            column: diagnostic.labels?.[0]?.span?.column,
            line: diagnostic.labels?.[0]?.span?.line,
            message: diagnostic.message,
            ruleName: diagnostic.code.slice(prefix.length, -1),
        });
    }

    return normalized.toSorted((left, right) =>
        JSON.stringify(left).localeCompare(JSON.stringify(right))
    );
};

const main = async () => {
    assert.equal(ruleNames.length, 31);
    assert.equal(configNames.length, 7);

    await mkdir(temporaryRoot, { recursive: true });
    await writeFile(fixturePath, fixture, "utf8");
    await writeFile(
        eslintConfigPath,
        [
            'import tsParser from "@typescript-eslint/parser";',
            'import plugin from "' + pluginSpecifier + '";',
            "",
            "export default [{",
            '    files: ["**/*.{js,cjs,mjs,jsx,ts,cts,mts,tsx}"],',
            "    languageOptions: {",
            "        parser: tsParser,",
            '        parserOptions: { ecmaVersion: "latest", sourceType: "module" },',
            "    },",
            "    plugins: { " + JSON.stringify(namespace) + ": plugin },",
            "    rules: " + JSON.stringify(rules) + ",",
            "}];",
            "",
        ].join("\n"),
        "utf8"
    );
    await writeFile(
        oxlintConfigPath,
        JSON.stringify(
            {
                jsPlugins: [{ name: namespace, specifier: pluginSpecifier }],
                rules,
            },
            undefined,
            2
        ) + "\n",
        "utf8"
    );

    const eslintDiagnostics = normalizeDiagnostics(
        "eslint",
        runCli(eslintCliPath, [
            "--config",
            eslintConfigPath,
            "--format",
            "json",
            fixturePath,
        ])
    );
    const oxlintDiagnostics = normalizeDiagnostics(
        "oxlint",
        runCli(oxlintCliPath, [
            "-A",
            "correctness",
            "--config",
            oxlintConfigPath,
            "--disable-nested-config",
            "--format",
            "json",
            fixturePath,
        ])
    );

    assert.ok(eslintDiagnostics.length > 0);
    assert.deepEqual(oxlintDiagnostics, eslintDiagnostics);

    console.log(
        JSON.stringify(
            {
                compatibleDiagnostics: oxlintDiagnostics.length,
                configCount: configNames.length,
                namespace,
                oxlintVersion: runCli(oxlintCliPath, ["--version"]).trim(),
                ruleCount: ruleNames.length,
            },
            undefined,
            2
        )
    );
};

try {
    await main();
} finally {
    await rm(temporaryRoot, { force: true, recursive: true });
}
