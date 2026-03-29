import { readdirSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import typedocPlugin from "../src/plugin.js";

const docsRulesDirectory = join(process.cwd(), "docs", "rules");

const expectedRuleDocFiles = Object.keys(typedocPlugin.rules ?? {})
    .map((ruleName) => `${ruleName}.md`)
    .toSorted();

describe("rule docs integrity", () => {
    it("has one markdown doc file per rule", () => {
        const docFiles = readdirSync(docsRulesDirectory)
            .filter((fileName) => fileName.endsWith(".md"))
            .toSorted();

        expect(docFiles).toEqual(expect.arrayContaining(expectedRuleDocFiles));
    });
});
