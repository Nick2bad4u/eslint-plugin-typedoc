/**
 * @packageDocumentation
 * Shared testing utilities for eslint-plugin-typefest RuleTester and Vitest suites.
 */
import type { ParserOptions } from "@typescript-eslint/parser";

import tsParser from "@typescript-eslint/parser";
import { RuleTester } from "@typescript-eslint/rule-tester";
import { readFileSync } from "node:fs";
import * as path from "node:path";

import { applySharedRuleTesterRunBehavior, repoPath } from "./ruleTester";

/**
 * Narrowed view of the shared run-behavior patcher used by typed tests.
 */
const applyRuleTesterRunBehavior = applySharedRuleTesterRunBehavior as (
    tester: Readonly<RuleTester>
) => RuleTester;

/** Absolute root directory for typed test fixtures. */
const typedFixturesRoot = repoPath("test", "fixtures", "typed");
/** Canonical line ending expected by RuleTester snapshots on Windows CI. */
const carriageReturnAndLineFeed = "\r\n";
/** Regex matching LF/CRLF line breaks for normalization. */
const lineFeedPattern = /\r?\n/gv;
/** Allowed default-project globs used by typed RuleTester suites. */
const typedRuleTesterAllowDefaultProject = [
    "file.ts",
    "test/fixtures/typed/*.ts",
    "test/fixtures/typed/tests/*.ts",
];
/** Shared parser options used by typed RuleTester suites. */
const typedRuleTesterParserOptions = {
    ecmaVersion: "latest",
    projectService: {
        allowDefaultProject: typedRuleTesterAllowDefaultProject,
        defaultProject: "tsconfig.eslint.json",
    },
    sourceType: "module",
    tsconfigRootDir: repoPath(),
} satisfies ParserOptions;
/** Minimal valid TypeScript module used to warm typed parser services. */
const typedParserWarmupModuleSource =
    "export const typedRuleTesterWarmup = [] as const;\n";

/**
 * Normalize fixture source to CRLF line endings for stable RuleTester output
 * comparisons across platforms.
 *
 * @param fixtureSource - Raw fixture file contents.
 *
 * @returns Fixture source with normalized line endings.
 */
const normalizeLineEndingsForRuleTester = (fixtureSource: string): string =>
    fixtureSource.replaceAll(lineFeedPattern, carriageReturnAndLineFeed);

/**
 * Resolve a path inside `test/fixtures/typed`.
 *
 * @param segments - Optional nested fixture path segments.
 *
 * @returns Absolute fixture path.
 */
export const typedFixturePath = (...segments: readonly string[]): string =>
    path.join(typedFixturesRoot, ...segments);

/**
 * Read a typed fixture file as UTF-8 text.
 *
 * @param segments - Fixture path segments under `test/fixtures/typed`.
 *
 * @returns Fixture source text.
 */
export const readTypedFixture = (...segments: readonly string[]): string =>
    normalizeLineEndingsForRuleTester(
        readFileSync(typedFixturePath(...segments), "utf8")
    );

/**
 * Warm the shared TypeScript project service used by typed RuleTester suites.
 *
 * This shifts initial project-service startup out of the first generated
 * RuleTester case, which helps prevent Windows CI timeouts when coverage is
 * enabled.
 *
 * @param filePath - Representative typed test filename to warm against.
 * @param sourceText - Optional TypeScript module source to parse.
 */
export const warmTypedParserServices = (
    filePath: string,
    sourceText: string = typedParserWarmupModuleSource
): void => {
    tsParser.parseForESLint(normalizeLineEndingsForRuleTester(sourceText), {
        ...typedRuleTesterParserOptions,
        filePath,
    });
};

/**
 * Create a RuleTester configured for typed fixture tests.
 *
 * @returns Configured RuleTester instance.
 */
export const createTypedRuleTester = (): RuleTester =>
    applyRuleTesterRunBehavior(
        new RuleTester({
            languageOptions: {
                parser: tsParser,
                parserOptions: typedRuleTesterParserOptions,
            },
        })
    );

/**
 * Shared typed RuleTester singleton for test modules.
 */
export const typedRuleTester: RuleTester = createTypedRuleTester();
