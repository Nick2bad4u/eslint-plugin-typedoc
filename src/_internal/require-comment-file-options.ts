import type { JSONSchema4 } from "@typescript-eslint/utils/json-schema";

import { arrayAt, isDefined, stringSplit } from "ts-extras";

const declarationFilePattern = /\.d\.(?:[cm]?js|[cm]?ts|jsx|tsx)$/v;
const windowsPathSeparatorPattern = /\\/gv;

/**
 * Default non-production paths ignored by require-comment rules.
 *
 * Keep this scope narrow to comment-requirement rules, not the entire plugin.
 */
const requireCommentDefaultIgnorePatterns = [
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

const matchPathSegment = (
    pathSegment: string,
    patternSegment: string
): boolean => {
    if (patternSegment === "*") {
        return true;
    }

    if (!patternSegment.includes("*")) {
        return pathSegment === patternSegment;
    }

    const parts = stringSplit(patternSegment, "*");
    let searchCursor = 0;
    let startIndex = 0;

    if (!patternSegment.startsWith("*")) {
        const [firstPart = ""] = parts;

        if (!pathSegment.startsWith(firstPart)) {
            return false;
        }

        searchCursor = firstPart.length;
        startIndex = 1;
    }

    const hasTrailingWildcard = patternSegment.endsWith("*");
    const trailingPart = hasTrailingWildcard ? "" : (arrayAt(parts, -1) ?? "");
    const endIndex = hasTrailingWildcard ? parts.length : parts.length - 1;

    for (let index = startIndex; index < endIndex; index += 1) {
        const part = parts[index];

        if (!isDefined(part) || part.length === 0) {
            continue;
        }

        const partOffset = pathSegment.indexOf(part, searchCursor);

        if (partOffset === -1) {
            return false;
        }

        searchCursor = partOffset + part.length;
    }

    if (hasTrailingWildcard || trailingPart.length === 0) {
        return true;
    }

    return pathSegment.slice(searchCursor).endsWith(trailingPart);
};

const matchesGlobPath = (filePath: string, pattern: string): boolean => {
    const pathSegments = stringSplit(filePath, "/");
    const patternSegments = stringSplit(pattern, "/");

    const matchesFrom = (pathIndex: number, patternIndex: number): boolean => {
        if (patternIndex === patternSegments.length) {
            return pathIndex === pathSegments.length;
        }

        const patternSegment = patternSegments[patternIndex];

        if (!isDefined(patternSegment)) {
            return false;
        }

        if (patternSegment === "**") {
            if (patternIndex === patternSegments.length - 1) {
                return true;
            }

            for (
                let segmentIndex = pathIndex;
                segmentIndex <= pathSegments.length;
                segmentIndex += 1
            ) {
                if (matchesFrom(segmentIndex, patternIndex + 1)) {
                    return true;
                }
            }

            return false;
        }

        const pathSegment = pathSegments[pathIndex];

        if (
            !isDefined(pathSegment) ||
            !matchPathSegment(pathSegment, patternSegment)
        ) {
            return false;
        }

        return matchesFrom(pathIndex + 1, patternIndex + 1);
    };

    return matchesFrom(0, 0);
};

const safelyMatchesPattern = (filePath: string, pattern: string): boolean => {
    try {
        return matchesGlobPath(filePath, pattern);
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
