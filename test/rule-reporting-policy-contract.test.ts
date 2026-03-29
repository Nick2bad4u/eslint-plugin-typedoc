/**
 * @packageDocumentation
 * Contract tests for shared rule-reporting policy usage across rule modules.
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

const RULES_DIRECTORY = path.join(process.cwd(), "src", "rules");

/**
 * Read source text for all rule modules under `src/rules`.
 */
const getRuleSourceFiles = (): readonly (readonly [string, string])[] => {
    const fileNames = fs
        .readdirSync(RULES_DIRECTORY)
        .filter((entry) => entry.endsWith(".ts"))
        .toSorted((left, right) => left.localeCompare(right));

    return fileNames.map((fileName) => {
        const absolutePath = path.join(RULES_DIRECTORY, fileName);
        const sourceText = fs.readFileSync(absolutePath, "utf8");

        return [fileName, sourceText] as const;
    });
};

describe("rule reporting policy contract", () => {
    it("prevents direct context.report calls inside rule modules", () => {
        for (const [fileName, sourceText] of getRuleSourceFiles()) {
            expect(
                sourceText,
                `Rule '${fileName}' must report via shared rule-reporting helpers`
            ).not.toMatch(/\bcontext\.report\s*\(/v);
        }
    });
});
