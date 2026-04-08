import type { JSONSchema4 } from "@typescript-eslint/utils/json-schema";

import path from "node:path";

const declarationFilePattern = /\.d\.(?:[cm]?js|[cm]?ts|jsx|tsx)$/u;
const windowsPathSeparatorPattern = /\\/gu;

/**
 * Default non-production paths ignored by require-comment rules.
 *
 * Keep this scope narrow to comment-requirement rules, not the entire plugin.
 */
export const requireCommentDefaultIgnorePatterns = [
    "benchmark/**",
    "benchmarks/**",
    "build/**",
    "coverage/**",
    "dist/**",
    "fixture/**",
    "fixtures/**",
    "generated/**",
    "temp/**",
    "test/**",
    "tests/**",
    "**/benchmark/**",
    "**/benchmarks/**",
    "**/build/**",
    "**/coverage/**",
    "**/dist/**",
    "**/fixture/**",
    "**/fixtures/**",
    "**/generated/**",
    "**/temp/**",
    "**/test/**",
    "**/tests/**",
] as const;

/**
 * Shared file-level options for require-comment rules.
 */
export type RequireCommentFileOptions = Readonly<{
    /**
     * If true, declaration files (for example d.ts and d.mts) are skipped.
     */
    ignoreDeclarationFiles?: boolean;

    /**
     * Optional glob overrides. Defaults target test, benchmark, and generated
     * outputs.
     */
    ignorePatterns?: readonly string[];
}>;

/**
 * JSON schema properties shared by require-comment rule option objects.
 */
export const requireCommentFileOptionsSchemaProperties: Readonly<
    Record<string, JSONSchema4>
> = {
    ignoreDeclarationFiles: {
        description: "Ignore declaration files such as d.ts and d.mts.",
        type: "boolean",
    },
    ignorePatterns: {
        description:
            "Glob patterns of files to ignore for this comment-requirement rule.",
        items: {
            type: "string",
        },
        type: "array",
    },
};

const isVirtualFilename = (filename: string): boolean =>
    filename.startsWith("<") && filename.endsWith(">") && filename.length > 2;

const normalizePathForGlob = (filePath: string): string =>
    filePath.replaceAll(windowsPathSeparatorPattern, "/");

const safelyMatchesPattern = (filePath: string, pattern: string): boolean => {
    try {
        return path.matchesGlob(filePath, pattern);
    } catch {
        return false;
    }
};

/**
 * Returns true when a require-comment rule should skip linting the file.
 */
export const shouldIgnoreRequireCommentFile = (
    filename: string,
    options: RequireCommentFileOptions | undefined
): boolean => {
    if (filename.length === 0 || isVirtualFilename(filename)) {
        return false;
    }

    const normalizedFilename = normalizePathForGlob(filename);

    if (
        options?.ignoreDeclarationFiles === true &&
        declarationFilePattern.test(normalizedFilename)
    ) {
        return true;
    }

    const ignorePatterns =
        options?.ignorePatterns ?? requireCommentDefaultIgnorePatterns;

    return ignorePatterns.some((pattern) =>
        safelyMatchesPattern(normalizedFilename, pattern)
    );
};
