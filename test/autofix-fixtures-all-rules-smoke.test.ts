/**
 * @packageDocumentation
 * Opt-in smoke test that lints ad-hoc fixture files with `typefest.configs.all`
 * and executes ESLint autofix in memory (never writes fixes to disk).
 */
import parser from "@typescript-eslint/parser";
import { ESLint } from "eslint";
import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

import typefestPlugin from "../src/plugin";

/** Process environment alias for lint-safe environment access. */
const processEnvironment = globalThis.process.env;

/** `true` when tests are running in a CI environment. */
const isCiEnvironment = processEnvironment["CI"] === "true";

/** Environment variable gate for this intentionally expensive smoke test. */
const shouldRunFixtureAutofixSmoke =
    processEnvironment["TYPEFEST_AUTOFIX_SMOKE"] === "1" && !isCiEnvironment;

/** Repository root used for path normalization and parser-service config. */
const repositoryRootPath = process.cwd();

/** Canonical root for ad-hoc local-only fixture sources. */
const fixturesRootPath = path.join(repositoryRootPath, "test", "fixtures");

/** Default fixture folder used for ad-hoc autofix smoke files. */
const defaultFixtureDirectoryPath = path.join(
    repositoryRootPath,
    "test",
    "fixtures",
    "autofix-smoke"
);

/** Supported fixture file extensions for typed all-rules linting. */
const lintableFixtureExtensions = new Set([
    ".cts",
    ".mts",
    ".ts",
    ".tsx",
]);

/** Guard unknown values to object records. */
const isObjectRecord = (
    value: unknown
): value is Readonly<Record<string, unknown>> =>
    typeof value === "object" && value !== null;

/** Resolve fixture directory from environment override or default location. */
const getFixtureDirectoryPath = (): string => {
    const configuredDirectory =
        processEnvironment["TYPEFEST_AUTOFIX_FIXTURE_DIR"];

    if (typeof configuredDirectory !== "string") {
        return defaultFixtureDirectoryPath;
    }

    const trimmedDirectory = configuredDirectory.trim();
    const resolvedFixtureDirectoryPath =
        trimmedDirectory.length > 0
            ? path.resolve(repositoryRootPath, trimmedDirectory)
            : defaultFixtureDirectoryPath;
    const relativeFixturePathFromFixturesRoot = path.relative(
        fixturesRootPath,
        resolvedFixtureDirectoryPath
    );
    const isInsideFixturesRoot =
        relativeFixturePathFromFixturesRoot.length === 0 ||
        (!relativeFixturePathFromFixturesRoot.startsWith("..") &&
            !path.isAbsolute(relativeFixturePathFromFixturesRoot));

    if (!isInsideFixturesRoot) {
        throw new TypeError(
            [
                "TYPEFEST_AUTOFIX_FIXTURE_DIR must resolve under test/fixtures.",
                `Received: ${resolvedFixtureDirectoryPath}`,
            ].join(" ")
        );
    }

    return resolvedFixtureDirectoryPath;
};

/** Normalize file-system paths to forward-slash form for ESLint glob patterns. */
const toPosixPath = (filePath: string): string =>
    filePath.replaceAll("\\", "/");

/** Build allowDefaultProject file entries for ad-hoc fixture file paths. */
const createAllowDefaultProjectEntries = (
    fixtureFilePaths: readonly string[]
): readonly string[] => {
    const entries: string[] = [];

    for (const fixtureFilePath of fixtureFilePaths) {
        const relativeFixtureFilePath = toPosixPath(
            path.relative(repositoryRootPath, fixtureFilePath)
        );

        if (
            relativeFixtureFilePath.length > 0 &&
            !relativeFixtureFilePath.startsWith("../")
        ) {
            entries.push(relativeFixtureFilePath);
        }
    }

    return entries;
};

/** Return true when a fixture path has a lintable extension. */
const isLintableFixturePath = (fixturePath: string): boolean =>
    lintableFixtureExtensions.has(path.extname(fixturePath).toLowerCase());

/** Visit one directory and collect lintable fixture files recursively. */
const collectLintableFixtureFilesFromDirectory = (
    currentDirectoryPath: string
): readonly string[] => {
    const directoryEntryNames = fs.readdirSync(currentDirectoryPath);
    const lintableFilePaths: string[] = [];

    for (const directoryEntryName of directoryEntryNames) {
        const directoryEntryPath = path.join(
            currentDirectoryPath,
            directoryEntryName
        );
        const directoryEntryStats = fs.statSync(directoryEntryPath);

        if (directoryEntryStats.isDirectory()) {
            lintableFilePaths.push(
                ...collectLintableFixtureFilesFromDirectory(directoryEntryPath)
            );
        } else if (
            directoryEntryStats.isFile() &&
            isLintableFixturePath(directoryEntryPath)
        ) {
            lintableFilePaths.push(directoryEntryPath);
        }
    }

    return lintableFilePaths;
};

/** Recursively collect lintable fixture file paths from one directory tree. */
const collectLintableFixtureFiles = (
    fixtureDirectoryPath: string
): readonly string[] => {
    if (!fs.existsSync(fixtureDirectoryPath)) {
        return [];
    }

    const lintableFilePaths =
        collectLintableFixtureFilesFromDirectory(fixtureDirectoryPath);

    return lintableFilePaths.toSorted((leftPath, rightPath) =>
        leftPath.localeCompare(rightPath)
    );
};

/** Throw when fixture discovery produced no lintable files. */
const ensureFixtureFilesExist = (
    fixtureFilePaths: readonly string[],
    fixtureDirectoryPath: string
): void => {
    if (fixtureFilePaths.length === 0) {
        throw new Error(
            [
                "No lintable fixtures were found.",
                `Add *.ts/*.tsx/*.mts/*.cts files under: ${fixtureDirectoryPath}`,
                "Then rerun with TYPEFEST_AUTOFIX_SMOKE=1.",
            ].join(" ")
        );
    }
};

/** Snapshot current on-disk source text for every fixture file path. */
const snapshotFixtureSourceByPath = (
    fixtureFilePaths: readonly string[]
): ReadonlyMap<string, string> => {
    const sourceByPath = new Map<string, string>();

    for (const fixtureFilePath of fixtureFilePaths) {
        sourceByPath.set(
            fixtureFilePath,
            fs.readFileSync(fixtureFilePath, "utf8")
        );
    }

    return sourceByPath;
};

/** Build a human-readable relative path for assertion diagnostics. */
const toRelativePath = (absolutePath: string): string =>
    path.relative(repositoryRootPath, absolutePath);

/** Build fatal diagnostic strings from lint results. */
type ReadonlyLintResult = Readonly<ESLint.LintResult>;

/** Build fatal diagnostic strings from lint results. */
const collectFatalDiagnostics = (
    lintResults: readonly ReadonlyLintResult[]
): readonly string[] => {
    const diagnostics: string[] = [];

    for (const lintResult of lintResults) {
        for (const message of lintResult.messages) {
            if (message.fatal === true) {
                const line =
                    typeof message.line === "number" ? message.line : 0;
                const column =
                    typeof message.column === "number" ? message.column : 0;

                diagnostics.push(
                    `${toRelativePath(lintResult.filePath)}:${line}:${column} ${message.message}`
                );
            }
        }
    }

    return diagnostics;
};

/** Validate parser safety of all generated in-memory autofix outputs. */
const collectAutofixOutputParseErrors = (
    lintResults: readonly ReadonlyLintResult[]
): readonly string[] => {
    const parseErrors: string[] = [];

    for (const lintResult of lintResults) {
        const fixedOutput = lintResult.output;

        if (typeof fixedOutput === "string") {
            try {
                parser.parseForESLint(fixedOutput, {
                    ecmaVersion: "latest",
                    sourceType: "module",
                });
            } catch (error: unknown) {
                const parseErrorMessage =
                    error instanceof Error ? error.message : String(error);

                parseErrors.push(
                    `${toRelativePath(lintResult.filePath)} ${parseErrorMessage}`
                );
            }
        }
    }

    return parseErrors;
};

/** Assert that lint `fix: true` did not mutate fixture files on disk. */
const expectFixturesUnchangedOnDisk = (
    sourceSnapshotByPath: ReadonlyMap<string, string>
): void => {
    for (const [fixtureFilePath, originalSourceText] of sourceSnapshotByPath) {
        const currentSourceText = fs.readFileSync(fixtureFilePath, "utf8");

        expect(currentSourceText).toBe(originalSourceText);
    }
};

/** Collect only string entries from unknown input arrays. */
const collectStringEntries = (value: unknown): readonly string[] => {
    if (!Array.isArray(value)) {
        return [];
    }

    const stringEntries: string[] = [];

    for (const entry of value) {
        if (typeof entry === "string") {
            stringEntries.push(entry);
        }
    }

    return stringEntries;
};

describe.runIf(shouldRunFixtureAutofixSmoke)(
    "all-rules fixture autofix smoke",
    () => {
        it("runs typefest.configs.all against fixture files and executes in-memory autofix", async () => {
            const fixtureDirectoryPath = getFixtureDirectoryPath();
            const fixtureFilePaths =
                collectLintableFixtureFiles(fixtureDirectoryPath);

            ensureFixtureFilesExist(fixtureFilePaths, fixtureDirectoryPath);

            const sourceSnapshotByPath =
                snapshotFixtureSourceByPath(fixtureFilePaths);
            const allConfig = typefestPlugin.configs.all;
            const allowDefaultProject =
                createAllowDefaultProjectEntries(fixtureFilePaths);
            const parserOptions = isObjectRecord(
                allConfig.languageOptions?.["parserOptions"]
            )
                ? allConfig.languageOptions["parserOptions"]
                : {};
            const projectServiceOptions = isObjectRecord(
                parserOptions["projectService"]
            )
                ? parserOptions["projectService"]
                : {};
            const existingAllowDefaultProject = collectStringEntries(
                projectServiceOptions["allowDefaultProject"]
            );

            const eslint = new ESLint({
                cwd: repositoryRootPath,
                fix: true,
                ignore: false,
                overrideConfig: [
                    {
                        ...allConfig,
                        languageOptions: {
                            ...allConfig.languageOptions,
                            parserOptions: {
                                ...parserOptions,
                                projectService: {
                                    ...projectServiceOptions,
                                    allowDefaultProject: [
                                        ...new Set([
                                            ...existingAllowDefaultProject,
                                            ...allowDefaultProject,
                                        ]),
                                    ],
                                    defaultProject: "tsconfig.eslint.json",
                                },
                                sourceType: "module",
                                tsconfigRootDir: repositoryRootPath,
                            },
                        },
                    },
                ],
                overrideConfigFile: true,
            });

            const lintResults = await eslint.lintFiles([...fixtureFilePaths]);
            const fatalDiagnostics = collectFatalDiagnostics(lintResults);
            const parseErrors = collectAutofixOutputParseErrors(lintResults);

            expect(fatalDiagnostics).toStrictEqual([]);
            expect(parseErrors).toStrictEqual([]);

            expectFixturesUnchangedOnDisk(sourceSnapshotByPath);
        });
    }
);
